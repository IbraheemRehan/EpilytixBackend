import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { CreateFounderDto } from './dto/create-founder.dto';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { AuditLogService } from '../audit-logs/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class UsersService {
  private resend: Resend;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private auditLogService: AuditLogService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get('app.resend.apiKey');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async getMyLogins(userId: string) {
    const result = await this.auditLogService.getLogs({
      userId,
      action: { $in: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGIN_2FA_SUCCESS'] },
    }, { limit: 20 });
    return { logins: result.items };
  }

  async updateMyProfile(userId: string, updateMeDto: UpdateMeDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateMeDto },
      { new: true, select: '-passwordHash -refreshTokenHash -twoFactorSecret' }
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMyPassword(userId: string, oldPassword?: string, newPassword?: string) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Old and new passwords are required');
    }
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Invalid old password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { passwordHash });
    
    await this.auditLogService.log({
      userId: userId as any,
      action: 'CHANGE_PASSWORD',
      resource: 'users',
    });

    return { message: 'Password updated successfully' };
  }

  async createFounder(createDto: CreateFounderDto, callerId: string, callerRole: UserRole) {
    if (callerRole !== UserRole.CEO) {
      const caller = await this.userModel.findById(callerId);
      if (!caller) throw new NotFoundException('Caller profile not found');
      if (createDto.email.toLowerCase() !== caller.email.toLowerCase()) {
        throw new ForbiddenException('You can only add your own information');
      }
      if (caller.firstName !== 'Pending' && caller.firstName !== '' && caller.lastName !== 'Pending' && caller.lastName !== '') {
        throw new ConflictException('You have already added your information');
      }

      // Update caller's details
      const updateData: any = {
        firstName: createDto.firstName,
        lastName: createDto.lastName,
      };
      if (createDto.phone) {
        updateData.phone = createDto.phone;
      }
      if (createDto.password) {
        updateData.passwordHash = await bcrypt.hash(createDto.password, 10);
      }
      const updatedUser = await this.userModel.findByIdAndUpdate(callerId, { $set: updateData }, { new: true });
      if (!updatedUser) throw new NotFoundException('User not found');
      return updatedUser.toJSON();
    }

    const existing = await this.userModel.findOne({
      email: createDto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate random initial password or use provided
    const tempPassword = (createDto as any).password || crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Remove password from dto before saving
    const { password, ...saveDto } = createDto as any;

    const user = new this.userModel({
      ...saveDto,
      role: UserRole.FOUNDER,
      passwordHash,
      // Default basic permissions
      permissions: {
        canManageLeads: true,
        canViewAllLeads: false,
        canManageContent: false,
        canChat: true,
      },
    });

    await user.save();

    await this.auditLogService.log({
      userId: callerId as any,
      action: 'CREATE_FOUNDER',
      resource: 'users',
      resourceId: user._id.toString(),
      details: { email: user.email },
    });

    // Send invitation email with temp password
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Epilytix Admin <onboarding@resend.dev>',
          to: user.email,
          subject: 'Welcome to Epilytix Dashboard',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <h2 style="color: #fa0395; margin: 0 0 20px;">Welcome to Epilytix</h2>
              <p style="color: #9ca3af; font-size: 14px;">You have been invited as a Founder.</p>
              <p style="color: #9ca3af; font-size: 14px;">Your temporary password is:</p>
              <div style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #fff;">${tempPassword}</span>
              </div>
              <p style="color: #6b7280; font-size: 12px;">Please log in via the mobile app and change your password immediately.</p>
            </div>
          `,
        });
      } catch (error) {
        console.error('Failed to send invitation email', error);
      }
    } else {
      console.log(`[DEV] Created founder ${user.email} with temp password: ${tempPassword}`);
    }

    return user.toJSON();
  }

  async findAllFounders() {
    return this.userModel
      .find({ role: { $in: [UserRole.FOUNDER, UserRole.CEO] } })
      .select('firstName lastName email role isActive avatar companyRole permissions')
      .lean()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, callerId?: string, callerRole?: UserRole) {
    if (callerRole && callerRole !== UserRole.CEO && id !== callerId) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash -refreshTokenHash -twoFactorSecret')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateFounder(id: string, updateDto: UpdateFounderDto, callerId: string, callerRole: UserRole) {
    if (callerRole !== UserRole.CEO && id !== callerId) {
      throw new ForbiddenException('You can only edit your own information');
    }
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.CEO && callerRole !== UserRole.CEO) throw new ForbiddenException('Cannot modify CEO');

    if (updateDto.email && updateDto.email !== user.email) {
      const existing = await this.userModel.findOne({ email: updateDto.email.toLowerCase() });
      if (existing) throw new ConflictException('Email already in use');
    }

    const updated = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateDto },
      { new: true },
    ).select('-passwordHash -refreshTokenHash -twoFactorSecret');

    if (updateDto.isActive === false) {
      await this.userModel.findByIdAndUpdate(id, {
        refreshTokenHash: null,
        fcmTokens: [],
      });
    }

    await this.auditLogService.log({
      userId: callerId as any,
      action: 'UPDATE_FOUNDER',
      resource: 'users',
      resourceId: id,
      details: updateDto,
    });

    return updated;
  }

  async updatePermissions(id: string, permissions: UpdatePermissionsDto, ceoId: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.CEO) throw new BadRequestException('Cannot modify CEO permissions');

    const updated = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { permissions: { ...((user.permissions as any)?.toObject ? (user.permissions as any).toObject() : user.permissions), ...permissions } } },
      { new: true },
    ).select('-passwordHash -refreshTokenHash -twoFactorSecret');

    await this.auditLogService.log({
      userId: ceoId as any,
      action: 'UPDATE_FOUNDER_PERMISSIONS',
      resource: 'users',
      resourceId: id,
      details: permissions,
    });

    return updated;
  }

  async cleanupFoundersAndCeo() {
    // Find duplicate Founder/CEO records by email
    const duplicates = await this.userModel.aggregate([
      { $match: { role: { $in: [UserRole.FOUNDER, UserRole.CEO] } } },
      {
        $group: {
          _id: "$email",
          docs: { $push: "$_id" },
          roles: { $push: "$role" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicates) {
      // Keep the CEO if present, otherwise keep the first document
      const ceoIndex = dup.roles.findIndex((r: any) => r === UserRole.CEO);
      const keepId = ceoIndex !== -1 ? dup.docs[ceoIndex] : dup.docs[0];
      const toDelete = dup.docs.filter((id: any) => id.toString() !== keepId.toString());
      if (toDelete.length) {
        await this.userModel.deleteMany({ _id: { $in: toDelete } });
      }
    }
    return { cleanedDuplicates: duplicates.length };
  }

  async createAnnouncement(title: string, content: string, caller: any) {
    const announcement = new this.announcementModel({
      title,
      content,
      createdBy: caller.userId,
    });
    await announcement.save();

    // Log action
    await this.auditLogService.log({
      userId: caller.userId,
      action: 'CREATE_ANNOUNCEMENT',
      resource: 'announcements',
      resourceId: announcement._id.toString(),
      details: { title },
    });

    // Notify all active founders
    const founders = await this.userModel.find({
      role: { $in: [UserRole.CEO, UserRole.FOUNDER] },
      isActive: true,
    }).select('_id').exec();

    const authorDoc = await this.userModel.findById(caller.userId).select('firstName lastName').lean();
    const authorName = authorDoc ? `${authorDoc.firstName} ${authorDoc.lastName}` : 'A founder';

    for (const founder of founders) {
      await this.notificationsService.sendNotification(
        founder._id.toString(),
        NotificationType.ANNOUNCEMENT,
        'New Announcement',
        `${authorName} posted: "${title}". Tap to read.`,
        {
          resourceId: announcement._id.toString(),
          resourceType: 'Announcement',
        },
      );
    }

    return announcement;
  }

  async getAnnouncements(userId?: string) {
    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, {
        lastSeenAnnouncementsAt: new Date(),
      });
    }
    return this.announcementModel
      .find()
      .populate('createdBy', 'firstName lastName email avatar companyRole role')
      .populate('acknowledgedBy', 'firstName lastName email avatar companyRole role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async acknowledgeAnnouncement(announcementId: string, userId: string) {
    const announcement = await this.announcementModel.findById(announcementId);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    const { Types } = require('mongoose');
    const userObjectId = new Types.ObjectId(userId);

    const userIndex = announcement.acknowledgedBy.findIndex(
      (id: any) => id.toString() === userId,
    );

    if (userIndex > -1) {
      announcement.acknowledgedBy.splice(userIndex, 1);
    } else {
      announcement.acknowledgedBy.push(userObjectId);
    }

    await announcement.save();
    return this.getAnnouncements();
  }

  async getUnseenCounts(userId: string): Promise<{ leads: boolean; tasks: boolean; announcements: boolean }> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) return { leads: false, tasks: false, announcements: false };

    const lastLead = await this.leadModel
      .findOne({})
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    const lastTask = await this.taskModel
      .findOne({})
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    const lastAnnouncement = await this.announcementModel
      .findOne({})
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    const lastSeenLeads = user.lastSeenLeadsAt ? new Date(user.lastSeenLeadsAt) : new Date(0);
    const lastSeenTasks = user.lastSeenTasksAt ? new Date(user.lastSeenTasksAt) : new Date(0);
    const lastSeenAnnouncements = user.lastSeenAnnouncementsAt ? new Date(user.lastSeenAnnouncementsAt) : new Date(0);

    return {
      leads: lastLead ? new Date((lastLead as any).createdAt) > lastSeenLeads : false,
      tasks: lastTask ? new Date((lastTask as any).createdAt) > lastSeenTasks : false,
      announcements: lastAnnouncement ? new Date((lastAnnouncement as any).createdAt) > lastSeenAnnouncements : false,
    };
  }

  async deleteFounder(id: string, callerId: string, callerRole: UserRole) {
    if (callerRole !== UserRole.CEO && id !== callerId) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.CEO) throw new ForbiddenException('Cannot delete CEO');

    await this.userModel.findByIdAndDelete(id);

    await this.auditLogService.log({
      userId: callerId as any,
      action: 'DELETE_FOUNDER',
      resource: 'users',
      resourceId: id,
      details: { email: user.email },
    });

    return { success: true };
  }

  async deleteAnnouncement(id: string, callerId: string, callerRole: UserRole) {
    const announcement = await this.announcementModel.findById(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (callerRole !== UserRole.CEO && announcement.createdBy.toString() !== callerId) {
      throw new ForbiddenException('You can only delete your own announcements');
    }

    await this.announcementModel.findByIdAndDelete(id);

    await this.auditLogService.log({
      userId: callerId as any,
      action: 'DELETE_ANNOUNCEMENT',
      resource: 'announcements',
      resourceId: id,
      details: { title: announcement.title },
    });

    return { success: true };
  }
}
