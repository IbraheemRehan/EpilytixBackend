import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';
import { LeadDocument } from '../leads/schemas/lead.schema';
import { TaskDocument } from '../tasks/schemas/task.schema';
import { CreateFounderDto } from './dto/create-founder.dto';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { AuditLogService } from '../audit-logs/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private userModel;
    private announcementModel;
    private leadModel;
    private taskModel;
    private auditLogService;
    private notificationsService;
    private configService;
    private resend;
    constructor(userModel: Model<UserDocument>, announcementModel: Model<AnnouncementDocument>, leadModel: Model<LeadDocument>, taskModel: Model<TaskDocument>, auditLogService: AuditLogService, notificationsService: NotificationsService, configService: ConfigService);
    getMyLogins(userId: string): Promise<{
        logins: {
            items: (import("mongoose").Document<unknown, {}, import("../audit-logs/schemas/audit-log.schema").AuditLogDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../audit-logs/schemas/audit-log.schema").AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            } & {
                id: string;
            })[];
            total: number;
        };
    }>;
    updateMyProfile(userId: string, updateMeDto: UpdateMeDto): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateMyPassword(userId: string, oldPassword?: string, newPassword?: string): Promise<{
        message: string;
    }>;
    createFounder(createDto: CreateFounderDto, callerId: string, callerRole: UserRole): Promise<User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAllFounders(): Promise<(User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string, callerId?: string, callerRole?: UserRole): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateFounder(id: string, updateDto: UpdateFounderDto, callerId: string, callerRole: UserRole): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updatePermissions(id: string, permissions: UpdatePermissionsDto, ceoId: string): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    deleteFounder(id: string, callerId: string, callerRole: UserRole): Promise<{
        message: string;
    }>;
    createAnnouncement(title: string, content: string, caller: any): Promise<import("mongoose").Document<unknown, {}, AnnouncementDocument, {}, import("mongoose").DefaultSchemaOptions> & Announcement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAnnouncements(userId?: string): Promise<(import("mongoose").Document<unknown, {}, AnnouncementDocument, {}, import("mongoose").DefaultSchemaOptions> & Announcement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    acknowledgeAnnouncement(announcementId: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, AnnouncementDocument, {}, import("mongoose").DefaultSchemaOptions> & Announcement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getUnseenCounts(userId: string): Promise<{
        leads: boolean;
        tasks: boolean;
        announcements: boolean;
    }>;
}
