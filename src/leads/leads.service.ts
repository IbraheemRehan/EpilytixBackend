import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument, LeadStatus } from './schemas/lead.schema';
import { LeadDeletionRequest, LeadDeletionRequestDocument, DeletionRequestStatus } from './schemas/deletion-request.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { UserRole, User, UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { NewsletterService } from '../newsletter/newsletter.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);
  private resend: Resend;

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(LeadDeletionRequest.name) private deletionRequestModel: Model<LeadDeletionRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditLogService: AuditLogService,
    private notificationsService: NotificationsService,
    private newsletterService: NewsletterService,
    private configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get<string>('app.resend.apiKey');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('✅ Resend initialized successfully');
    } else {
      this.logger.warn('⚠️ RESEND_API_KEY not configured — emails will NOT be sent');
    }
  }

  async create(createLeadDto: CreateLeadDto, user?: any) {
    // Combine notes into message if provided from public form
    let finalMessage = createLeadDto.message || '';
    if (createLeadDto.notes && createLeadDto.notes.length > 0) {
      const noteContent = createLeadDto.notes.map(n => n.content).join('\n');
      finalMessage = finalMessage ? `${finalMessage}\n\nAdditional Details:\n${noteContent}` : noteContent;
    }

    const lead = new this.leadModel({
      name: `${createLeadDto.firstName} ${createLeadDto.lastName}`.trim(),
      email: createLeadDto.email,
      phone: createLeadDto.phone,
      company: createLeadDto.company,
      message: finalMessage || 'No message provided',
      source: createLeadDto.source || 'WEBSITE',
      status: LeadStatus.NEW,
      history: [
        {
          action: 'CREATED',
          timestamp: new Date(),
        },
      ],
    });

    await lead.save();

    // Auto-subscribe lead email to newsletter (fire-and-forget, don't block lead creation)
    try {
      await this.newsletterService.subscribe({ email: createLeadDto.email });
    } catch {
      // Silently ignore — email may already be subscribed
    }

    if (user?.userId) {
      await this.auditLogService.log({
        userId: new Types.ObjectId(user.userId),
        action: 'LEAD_CREATED',
        resource: 'Lead',
        resourceId: lead._id.toString(),
        details: { email: lead.email, name: lead.name }
      });
    }

    // Extract service and request message if formatted as "[Service: ...] Message"
    let service = 'Web';
    let requestMessage = finalMessage || 'Assistance';
    if (finalMessage.startsWith('[Service:')) {
      const closingBracketIndex = finalMessage.indexOf(']');
      if (closingBracketIndex !== -1) {
        service = finalMessage.substring('[Service:'.length, closingBracketIndex).trim();
        requestMessage = finalMessage.substring(closingBracketIndex + 1).trim() || 'Assistance';
      }
    }

    // Resolve frontend base URL from CORS configurations
    const corsOrigins = this.configService.get<string[]>('app.corsOrigins') || [];
    const frontendUrl = corsOrigins[0] || 'http://localhost:3000';

    // Featured blogs content to show client
    const featuredBlogs = [
      {
        title: 'Future of AI in Business',
        category: 'AI & Analytics',
        description: 'A strict architectural review determining the baseline requirements for deploying scalable foundation models.',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=350&fit=crop',
        slug: 'future-of-ai-in-business',
      },
      {
        title: 'Benefits of ERP Systems',
        category: 'ERP Solutions',
        description: 'Technical breakdown of the systemic implementations and deployment strategies necessary to achieve production efficiency.',
        image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=350&fit=crop',
        slug: 'benefits-of-erp-systems',
      },
      {
        title: 'Odoo Implementation Guide',
        category: 'ERP Solutions',
        description: 'Step-by-step guide to deploying Odoo ERP systems and integrating custom modules for operational excellence.',
        image: 'https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=600&h=350&fit=crop',
        slug: 'odoo-implementation-guide',
      },
    ];

    const blogsHtml = featuredBlogs
      .map(
        (blog) => `
              <!-- Blog Card -->
              <table class="blog-card" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0c10; border: 1px solid #1a1a1f; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                <tr>
                  <td>
                    <!-- Image -->
                    <img class="responsive-image" src="${blog.image}" alt="${blog.title}" width="100%" style="display: block; border-bottom: 1px solid #1a1a1f;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 8px 0; color: #fa0395; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">${blog.category}</p>
                    <h3 style="margin: 0 0 10px 0; color: #ffffff; font-size: 18px; font-weight: 800; line-height: 1.3;">${blog.title}</h3>
                    <p style="margin: 0 0 20px 0; color: #b0b0bc; font-size: 13px; line-height: 1.5; font-weight: 300;">${blog.description}</p>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 4px;" bgcolor="#fa0395">
                          <a href="${frontendUrl}/blog/${blog.slug}" target="_blank" style="padding: 10px 20px; border: 1px solid #fa0395; border-radius: 4px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">Read Article &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
        `,
      )
      .join('\n');

    // Send detailed consultation request email to the company inbox
    if (this.resend) {
      const companyEmail = this.configService.get<string>('app.company.email') || 'epilytix.official@gmail.com';
      this.logger.log(`📧 Sending company notification email to: ${companyEmail}`);
      try {
        const result = await this.resend.emails.send({
          from: 'Epilytix Consultations <noreply@epilytix.com>',
          to: companyEmail,
          subject: `[New Lead] Consultation Request from ${lead.name}`,
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #030303; border: 1px solid #1a1a1f; border-radius: 12px; color: #ffffff;">
              <h2 style="color: #fa0395; border-bottom: 1px solid #1a1a1f; padding-bottom: 15px; margin-top: 0; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">New Consultation Request</h2>
              
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #b0b0bc;"><strong style="color: #ffffff;">Name:</strong> ${lead.name}</p>
                <p style="margin: 0 0 10px 0; color: #b0b0bc;"><strong style="color: #ffffff;">Email:</strong> <a href="mailto:${lead.email}" style="color: #fa0395; text-decoration: none;">${lead.email}</a></p>
                <p style="margin: 0 0 10px 0; color: #b0b0bc;"><strong style="color: #ffffff;">Phone:</strong> ${lead.phone || 'N/A'}</p>
                <p style="margin: 0 0 10px 0; color: #b0b0bc;"><strong style="color: #ffffff;">Company:</strong> ${lead.company || 'N/A'}</p>
                <p style="margin: 0 0 10px 0; color: #b0b0bc;"><strong style="color: #ffffff;">Service:</strong> ${service}</p>
              </div>
              
              <div style="background-color: #0c0c10; padding: 20px; border-radius: 8px; margin-top: 25px; border-left: 3px solid #fa0395;">
                <strong style="color: #fa0395; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Client Message</strong>
                <p style="white-space: pre-wrap; margin-top: 12px; margin-bottom: 0; color: #eaeaea; line-height: 1.6; font-size: 14px;">${requestMessage}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a1a1f; text-align: center;">
                <p style="color: #6e6e7d; font-size: 12px; margin: 0;">Epilytix Enterprise CRM</p>
              </div>
            </div>
          `,
        });
        if (result.error) {
          this.logger.error(`❌ Resend API error for company email: ${JSON.stringify(result.error)}`);
        } else {
          this.logger.log(`✅ Company email sent successfully. Resend ID: ${result.data?.id}`);
        }
      } catch (error) {
        this.logger.error('❌ Failed to send company notification email', error?.message || error);
      }

      // Send confirmation email to the lead (customer) — branded template
      this.logger.log(`📧 Sending confirmation email to lead: ${lead.email}`);
      try {
        const firstName = lead.name?.split(' ')[0] || 'there';
        const currentYear = new Date().getFullYear();

        const confirmResult = await this.resend.emails.send({
          from: 'Epilytix Consultations <noreply@epilytix.com>',
          to: lead.email,
          subject: 'Your consultation request has been received',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Consultation Received</title>
              <style>
                body { margin: 0; padding: 0; background-color: #030303; }
                @media only screen and (max-width: 620px) {
                  .email-container { width: 100% !important; }
                  .responsive-image { height: auto !important; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #030303;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 30px 15px;">
                    <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #030303; border: 1px solid #1a1a1f; border-radius: 12px; overflow: hidden; font-family: 'Inter', Arial, sans-serif;">

                      <!-- Header -->
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #fa0395 0%, #a3009c 100%); padding: 40px 25px;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 2px;">EPILYTIX</h1>
                          <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">Where Chaos Becomes Clarity</p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding: 35px 30px;">
                          <p style="margin: 0 0 20px 0; color: #ffffff; font-size: 16px; font-weight: 700;">Hi ${firstName},</p>
                          <p style="margin: 0 0 25px 0; color: #b0b0bc; font-size: 14px; line-height: 1.7; font-weight: 300;">
                            We have successfully received your consultation request and appreciate your interest in Epilytix. Our team is currently reviewing the information you provided. A member of our team will contact you within 24&ndash;48 hours to discuss your requirements and schedule a consultation at a convenient time.
                          </p>

                          <!-- Inquiry Box -->
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0c10; border-radius: 8px; margin-bottom: 25px;">
                            <tr>
                              <td style="border-left: 3px solid #fa0395; padding: 20px;">
                                <p style="margin: 0 0 12px 0; color: #fa0395; font-size: 12px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">Your Inquiry</p>
                                <p style="margin: 0 0 8px 0; color: #b0b0bc; font-size: 14px;"><strong style="color: #ffffff;">Service:</strong> ${service}</p>
                                <p style="margin: 0; color: #b0b0bc; font-size: 14px; line-height: 1.6;"><strong style="color: #ffffff;">Request:</strong> ${requestMessage}</p>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 0 0 20px 0; color: #b0b0bc; font-size: 14px; line-height: 1.7; font-weight: 300;">
                            During the consultation, we will discuss your goals and requirements, answer any questions you may have, and explore potential solutions tailored to your needs.
                          </p>
                          <p style="margin: 0; color: #b0b0bc; font-size: 14px; line-height: 1.7; font-weight: 300;">
                            If your inquiry is urgent, please reply to this email and we will do our best to assist you promptly.
                          </p>
                        </td>
                      </tr>

                      <!-- Engineering Journal -->
                      <tr>
                        <td style="padding: 0 30px 10px 30px;">
                          <hr style="border: none; border-top: 1px solid #1a1a1f; margin: 0 0 30px 0;" />
                          <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">Engineering Journal</h2>
                          <p style="margin: 0 0 25px 0; color: #6e6e7d; font-size: 13px; font-weight: 300;">Explore our latest architectural updates and technical reviews</p>

                          ${blogsHtml}
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 30px 35px 30px;">
                          <hr style="border: none; border-top: 1px solid #1a1a1f; margin: 0 0 25px 0;" />
                          <p style="margin: 0 0 15px 0; color: #eaeaea; font-size: 14px; text-align: center;">Thank you for choosing Epilytix. We look forward to speaking with you.</p>
                          <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 700; text-align: center;">Best regards,<br/>The Epilytix Team</p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 20px 30px; border-top: 1px solid #1a1a1f; text-align: center;">
                          <p style="margin: 0 0 4px 0; color: #6e6e7d; font-size: 11px;">&copy; ${currentYear} Epilytix. All rights reserved.</p>
                          <p style="margin: 0; color: #6e6e7d; font-size: 11px;">You are receiving this because you requested a consultation on our website.</p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });
        if (confirmResult.error) {
          this.logger.error(`❌ Resend API error for lead email: ${JSON.stringify(confirmResult.error)}`);
        } else {
          this.logger.log(`✅ Confirmation email sent. Resend ID: ${confirmResult.data?.id}`);
        }
      } catch (err) {
        this.logger.error('❌ Failed to send confirmation email to lead', err?.message || err);
      }
    } else {
      this.logger.warn('⚠️ Resend not initialized — skipping all emails for this lead');
    }

    // Notify all active founders/CEOs via in-app notification only
    try {
      const activeFounders = await this.userModel.find({
        role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
        isActive: true,
      }).exec();

      for (const founder of activeFounders) {
        // Send In-App Notification
        await this.notificationsService.sendNotification(
          founder._id.toString(),
          NotificationType.NEW_LEAD,
          'New Consultation Request',
          `Client ${lead.name} requested a consultation.`,
          {
            resourceId: lead._id.toString(),
            resourceType: 'Lead',
          },
        );
      }
    } catch (err) {
      console.error('Failed to notify founders of new lead:', err);
    }

    return lead.toJSON();
  }

  async findAll(filterDto: LeadFilterDto, user: any) {
    // Update lastSeenLeadsAt for user
    if (user && user.userId) {
      await this.userModel.findByIdAndUpdate(user.userId, {
        lastSeenLeadsAt: new Date(),
      });
    }

    const query: any = {};

    // All founders and CEO can view all leads
    if (user.role !== UserRole.CEO && user.role !== UserRole.FOUNDER && !user.permissions?.canViewAllLeads) {
      query.assignedTo = new Types.ObjectId(user.userId);
    }

    if (filterDto.status) {
      query.status = filterDto.status;
    }

    if (filterDto.assignedTo) {
      query.assignedTo = new Types.ObjectId(filterDto.assignedTo);
    }

    if (filterDto.search) {
      query.$or = [
        { name: { $regex: filterDto.search, $options: 'i' } },
        { email: { $regex: filterDto.search, $options: 'i' } },
        { company: { $regex: filterDto.search, $options: 'i' } },
      ];
    }

    const page = parseInt(filterDto.page || '1', 10);
    const limit = parseInt(filterDto.limit || '20', 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.leadModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'firstName lastName avatar')
        .exec(),
      this.leadModel.countDocuments(query),
    ]);

    return {
      items: items.map(item => item.toJSON()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string, user: any) {
    const lead = await this.leadModel
      .findById(id)
      .populate('assignedTo', 'firstName lastName avatar')
      .populate('notes.author', 'firstName lastName avatar')
      .populate('history.performedBy', 'firstName lastName')
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // All founders and CEO can view any lead
    if (
      user.role !== UserRole.CEO &&
      user.role !== UserRole.FOUNDER &&
      !user.permissions?.canViewAllLeads &&
      lead.assignedTo?._id.toString() !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    return lead.toJSON();
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, user: any) {
    const lead = await this.leadModel.findById(id);
    if (!lead) throw new NotFoundException('Lead not found');

    // All founders and CEO can update any lead
    if (
      user.role !== UserRole.CEO &&
      user.role !== UserRole.FOUNDER &&
      !user.permissions?.canManageLeads
    ) {
      throw new ForbiddenException('You do not have permission to manage leads');
    }

    const historyEntry: any = {
      action: 'UPDATED',
      performedBy: new Types.ObjectId(user.userId),
      timestamp: new Date(),
    };

    if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
      historyEntry.action = 'STATUS_CHANGED';
      historyEntry.from = lead.status;
      historyEntry.to = updateLeadDto.status;
    } else if (
      updateLeadDto.assignedTo &&
      updateLeadDto.assignedTo !== lead.assignedTo?.toString()
    ) {
      historyEntry.action = 'ASSIGNED';
      historyEntry.from = lead.assignedTo?.toString();
      historyEntry.to = updateLeadDto.assignedTo;
    }

    const updated = await this.leadModel
      .findByIdAndUpdate(
        id,
        {
          $set: updateLeadDto,
          $push: { history: historyEntry },
          $inc: { syncVersion: 1 },
        },
        { new: true },
      )
      .populate('assignedTo', 'firstName lastName avatar')
      .exec();

    if (!updated) throw new NotFoundException('Lead not found after update');

    if (updateLeadDto.status) {
      await this.auditLogService.log({
        userId: new Types.ObjectId(user.userId),
        action: 'LEAD_STATUS_UPDATED',
        resource: 'leads',
        resourceId: id,
        details: { email: updated.email, newStatus: updated.status }
      });
    }

    await this.auditLogService.log({
      userId: new Types.ObjectId(user.userId),
      action: 'UPDATE_LEAD',
      resource: 'leads',
      resourceId: id,
      details: updateLeadDto,
    });

    return updated.toJSON();
  }

  async addNote(id: string, addNoteDto: AddNoteDto, user: any) {
    const lead = await this.leadModel.findById(id);
    if (!lead) throw new NotFoundException('Lead not found');

    const note = {
      _id: new Types.ObjectId(),
      content: addNoteDto.content,
      author: new Types.ObjectId(user.userId),
      createdAt: new Date(),
    };

    const updated = await this.leadModel
      .findByIdAndUpdate(
        id,
        {
          $push: { notes: note },
          $inc: { syncVersion: 1 },
        },
        { new: true },
      )
      .populate('notes.author', 'firstName lastName avatar')
      .exec();

    if (!updated) throw new NotFoundException('Lead not found after note addition');

    return updated.notes.find((n) => n._id.toString() === note._id.toString());
  }

  async getStats(user: any) {
    const query: any = {};
    if (user.role !== UserRole.CEO && user.role !== UserRole.FOUNDER && !user.permissions?.canViewAllLeads) {
      query.assignedTo = new Types.ObjectId(user.userId);
    }

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1);

    const aggregations = await this.leadModel.aggregate([
      { $match: query },
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$value' } } }
          ],
          sourceCounts: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          newThisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: 'count' }
          ],
          newThisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const data = aggregations[0];

    const result = {
      totalLeads: 0,
      activeLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      revenueGenerated: 0,
      newThisWeek: data.newThisWeek[0]?.count || 0,
      newThisMonth: data.newThisMonth[0]?.count || 0,
      conversionRate: '0%',
      sources: [] as { name: string; value: number }[],
      statusBreakdown: {} as Record<string, number>,
    };

    data.statusCounts.forEach((stat: any) => {
      const status = stat._id as string;
      const count = stat.count;
      
      result.totalLeads += count;
      result.statusBreakdown[status] = count;

      if (status === LeadStatus.CONVERTED) {
        result.convertedLeads += count;
        result.revenueGenerated += stat.revenue || 0;
      } else if (status === LeadStatus.LOST || status === LeadStatus.CLOSED) {
        result.lostLeads += count;
      } else {
        result.activeLeads += count;
      }
    });

    data.sourceCounts.forEach((stat: any) => {
      if (stat._id) {
        result.sources.push({ name: stat._id, value: stat.count });
      }
    });

    if (result.totalLeads > 0) {
      result.conversionRate = Math.round((result.convertedLeads / result.totalLeads) * 100) + '%';
    }

    return result;
  }

  async requestDeleteLead(leadId: string, caller: any) {
    const lead = await this.leadModel.findById(leadId);
    if (!lead) throw new NotFoundException('Lead not found');

    // Check if there's already a pending request for this lead
    const existing = await this.deletionRequestModel.findOne({
      leadId: new Types.ObjectId(leadId),
      status: DeletionRequestStatus.PENDING,
    });
    if (existing) {
      throw new ConflictException('A deletion request is already pending for this lead');
    }

    // Count all active founders (CEO + FOUNDER roles)
    const activeFounders = await this.userModel.countDocuments({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
    });

    // Calculate required votes (51% majority)
    const requiredVotes = Math.floor(activeFounders * 0.5) + 1;

    // If only one founder exists (requiredVotes === 1), auto-approve and delete immediately
    if (requiredVotes === 1) {
      // Build a minimal deletion request object for audit/logging purposes
      const autoDeletionRequest: any = {
        leadId: new Types.ObjectId(leadId),
        leadName:
          lead.name ||
          `${(lead as any).firstName || ''} ${(lead as any).lastName || ''}`.trim(),
        requestedBy: new Types.ObjectId(caller.userId),
        approvals: [new Types.ObjectId(caller.userId)],
        requiredVotes,
        status: DeletionRequestStatus.APPROVED,
      };
      // Directly execute deletion without persisting a pending request
      return this._executeDeletion(autoDeletionRequest, lead, caller);
    }

    // Create the deletion request with the requester's vote auto-applied
    const deletionRequest = new this.deletionRequestModel({
      leadId: new Types.ObjectId(leadId),
      leadName: lead.name || `${(lead as any).firstName || ''} ${(lead as any).lastName || ''}`.trim(),
      requestedBy: new Types.ObjectId(caller.userId),
      approvals: [new Types.ObjectId(caller.userId)],
      requiredVotes,
      status: DeletionRequestStatus.PENDING,
    });
    await deletionRequest.save();

    // If the requester's vote already meets the required votes (covers edge case where requiredVotes could be 1), auto-approve
    if (deletionRequest.approvals.length >= requiredVotes) {
      return this._executeDeletion(deletionRequest, lead, caller);
    }

    // Notify all OTHER active founders
    const otherFounders = await this.userModel.find({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
      _id: { $ne: new Types.ObjectId(caller.userId) },
    }).select('_id').exec();

    const requesterName = await this.userModel
      .findById(caller.userId)
      .select('firstName lastName')
      .lean();
    const requesterDisplay = requesterName
      ? `${requesterName.firstName} ${requesterName.lastName}`
      : 'A founder';

    for (const founder of otherFounders) {
      await this.notificationsService.sendNotification(
        founder._id.toString(),
        NotificationType.DELETION_REQUEST,
        'Lead Deletion Vote Required',
        `${requesterDisplay} has requested to delete lead "${deletionRequest.leadName}". ${deletionRequest.approvals.length}/${requiredVotes} votes. Tap to review.`,
        {
          resourceId: deletionRequest._id.toString(),
          resourceType: 'LeadDeletionRequest',
        },
      );
    }

    return {
      message: `Deletion request created. ${deletionRequest.approvals.length}/${requiredVotes} votes received. Other founders have been notified.`,
      deletionRequest,
    };
  }

  /**
   * Recalculates requiredVotes for every PENDING deletion request based on the
   * CURRENT count of active founders, and auto-executes deletion for any
   * request whose existing approvals already meet the (possibly new) threshold.
   *
   * IMPORTANT: this runs against raw (unpopulated) documents so that `.save()`
   * calls don't choke on populated ref fields, and each request is handled in
   * its own try/catch so one bad/corrupt request can't block the rest (which
   * was previously causing the whole endpoint to throw and the mobile app to
   * silently keep showing stale vote counts).
   *
   * Call this any time the active-founder set changes (add/deactivate/delete
   * a founder), in addition to it running on every fetch/vote.
   */
  async recalculateAndResolvePendingDeletions() {
    const activeFoundersCount = await this.userModel.countDocuments({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
    });
    const currentRequiredVotes = Math.floor(activeFoundersCount * 0.5) + 1;

    // Work with raw (unpopulated) docs so .save() is safe
    const pendingRequests = await this.deletionRequestModel
      .find({ status: DeletionRequestStatus.PENDING })
      .exec();

    for (const req of pendingRequests) {
      try {
        if (req.requiredVotes !== currentRequiredVotes) {
          req.requiredVotes = currentRequiredVotes;
          await req.save();
        }

        if (req.approvals.length >= currentRequiredVotes) {
          // Threshold is now met (e.g. founders were removed) — execute automatically
          const lead = await this.leadModel.findById(req.leadId);
          const systemCaller = {
            userId: req.requestedBy.toString(),
            role: UserRole.CEO,
          };
          await this._executeDeletion(req, lead, systemCaller);
        }
      } catch (err) {
        this.logger.error(
          `Failed to recalculate/resolve deletion request ${req._id}`,
          err?.message || err,
        );
        // Continue processing remaining requests instead of failing the whole batch
      }
    }
  }

  async getDeleteRequests() {
    // Recalculate thresholds and auto-resolve anything that now qualifies
    // BEFORE reading the populated list back out for the client.
    await this.recalculateAndResolvePendingDeletions();

    // Return only still-pending requests (any auto-approved ones are now APPROVED)
    return this.deletionRequestModel
      .find({ status: DeletionRequestStatus.PENDING })
      .populate('requestedBy', 'firstName lastName email')
      .populate('approvals', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveDeleteRequest(requestId: string, caller: any) {
    const deletionRequest = await this.deletionRequestModel.findById(requestId);
    if (!deletionRequest) throw new NotFoundException('Deletion request not found');

    if (deletionRequest.status !== DeletionRequestStatus.PENDING) {
      throw new ConflictException('This deletion request has already been resolved');
    }

    // Check if caller already voted
    const alreadyVoted = deletionRequest.approvals.some(
      (id) => id.toString() === caller.userId,
    );
    if (alreadyVoted) {
      throw new ConflictException('You have already voted on this request');
    }

    // Update required votes based on current active founders
    const activeFoundersCount = await this.userModel.countDocuments({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
    });
    deletionRequest.requiredVotes = Math.floor(activeFoundersCount * 0.5) + 1;

    // Add the vote
    deletionRequest.approvals.push(new Types.ObjectId(caller.userId));
    await deletionRequest.save();

    // Check if threshold is met
    if (deletionRequest.approvals.length >= deletionRequest.requiredVotes) {
      const lead = await this.leadModel.findById(deletionRequest.leadId);
      return this._executeDeletion(deletionRequest, lead, caller);
    }

    // Notify all founders about the new vote count
    const allFounders = await this.userModel.find({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
      _id: { $ne: new Types.ObjectId(caller.userId) },
    }).select('_id').exec();

    const voterDoc = await this.userModel.findById(caller.userId).select('firstName lastName').lean();
    const voterName = voterDoc ? `${voterDoc.firstName} ${voterDoc.lastName}` : 'A founder';

    for (const founder of allFounders) {
      await this.notificationsService.sendNotification(
        founder._id.toString(),
        NotificationType.DELETION_REQUEST,
        'Lead Deletion Vote Update',
        `${voterName} approved deleting "${deletionRequest.leadName}". ${deletionRequest.approvals.length}/${deletionRequest.requiredVotes} votes.`,
        {
          resourceId: deletionRequest._id.toString(),
          resourceType: 'LeadDeletionRequest',
        },
      );
    }

    return {
      message: `Vote recorded. ${deletionRequest.approvals.length}/${deletionRequest.requiredVotes} votes.`,
      deletionRequest,
    };
  }

  private async _executeDeletion(deletionRequest: any, lead: any, caller: any) {
    // Hard delete the lead
    if (lead) {
      await this.leadModel.findByIdAndDelete(deletionRequest.leadId);
    }

    deletionRequest.status = DeletionRequestStatus.APPROVED;
    await deletionRequest.save();

    await this.auditLogService.log({
      userId: new Types.ObjectId(caller.userId),
      action: 'DELETE_LEAD',
      resource: 'Lead',
      resourceId: deletionRequest.leadId.toString(),
      details: { name: deletionRequest.leadName, approvals: deletionRequest.approvals.length },
    });

    // Notify all founders
    const allFounders = await this.userModel.find({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
    }).select('_id').exec();

    for (const founder of allFounders) {
      await this.notificationsService.sendNotification(
        founder._id.toString(),
        NotificationType.DELETION_APPROVED,
        'Lead Deleted',
        `Lead "${deletionRequest.leadName}" has been permanently deleted with ${deletionRequest.approvals.length}/${deletionRequest.requiredVotes} founder votes.`,
        {
          resourceId: deletionRequest._id.toString(),
          resourceType: 'LeadDeletionRequest',
        },
      );
    }

    return {
      message: `Lead "${deletionRequest.leadName}" has been permanently deleted.`,
      deletionRequest,
    };
  }

  async exportLeads(caller: any) {
    const leads = await this.leadModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Build CSV
    const headers = [
      'Name', 'Email', 'Phone', 'Company', 'Status', 'Priority',
      'Source', 'Value', 'Tags', 'Message', 'Created At',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map((lead) => [
      escapeCSV(lead.name),
      escapeCSV(lead.email),
      escapeCSV(lead.phone),
      escapeCSV(lead.company),
      escapeCSV(lead.status),
      escapeCSV(lead.priority),
      escapeCSV(lead.source),
      escapeCSV(lead.value),
      escapeCSV((lead.tags || []).join(', ')),
      escapeCSV(lead.message),
      escapeCSV(lead.createdAt ? new Date(lead.createdAt).toISOString() : ''),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}