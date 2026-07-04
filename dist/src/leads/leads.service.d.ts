import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { LeadDeletionRequest, LeadDeletionRequestDocument } from './schemas/deletion-request.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { ConfigService } from '@nestjs/config';
export declare class LeadsService {
    private leadModel;
    private deletionRequestModel;
    private userModel;
    private auditLogService;
    private notificationsService;
    private newsletterService;
    private configService;
    private resend;
    constructor(leadModel: Model<LeadDocument>, deletionRequestModel: Model<LeadDeletionRequestDocument>, userModel: Model<UserDocument>, auditLogService: AuditLogService, notificationsService: NotificationsService, newsletterService: NewsletterService, configService: ConfigService);
    create(createLeadDto: CreateLeadDto, user?: any): Promise<Lead & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(filterDto: LeadFilterDto, user: any): Promise<{
        items: (Lead & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    findOne(id: string, user: any): Promise<Lead & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateLeadDto: UpdateLeadDto, user: any): Promise<Lead & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addNote(id: string, addNoteDto: AddNoteDto, user: any): Promise<import("./schemas/lead.schema").LeadNote | undefined>;
    getStats(user: any): Promise<{
        totalLeads: number;
        activeLeads: number;
        convertedLeads: number;
        lostLeads: number;
        revenueGenerated: number;
        newThisWeek: any;
        newThisMonth: any;
        conversionRate: string;
        sources: {
            name: string;
            value: number;
        }[];
        statusBreakdown: Record<string, number>;
    }>;
    requestDeleteLead(leadId: string, caller: any): Promise<{
        message: string;
        deletionRequest: any;
    }>;
    getDeleteRequests(): Promise<(import("mongoose").Document<unknown, {}, LeadDeletionRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & LeadDeletionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    approveDeleteRequest(requestId: string, caller: any): Promise<{
        message: string;
        deletionRequest: any;
    }>;
    private _executeDeletion;
    exportLeads(caller: any): Promise<string>;
}
