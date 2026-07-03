import { UsersService } from './users.service';
import { CreateFounderDto } from './dto/create-founder.dto';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserRole } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    getUnseenCounts(userId: string): Promise<{
        leads: boolean;
        tasks: boolean;
        announcements: boolean;
    }>;
    updateMyProfile(userId: string, updateMeDto: UpdateMeDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateMyPassword(userId: string, oldPassword?: string, newPassword?: string): Promise<{
        message: string;
    }>;
    createFounder(createFounderDto: CreateFounderDto, callerId: string, callerRole: UserRole): Promise<import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAllFounders(): Promise<(import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string, callerId: string, callerRole: UserRole): Promise<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateFounder(id: string, updateFounderDto: UpdateFounderDto, callerId: string, callerRole: UserRole): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updatePermissions(id: string, updatePermissionsDto: UpdatePermissionsDto, ceoId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    removeFounder(id: string, callerId: string, callerRole: UserRole): Promise<{
        message: string;
    }>;
    createAnnouncement(title: string, content: string, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/announcement.schema").AnnouncementDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/announcement.schema").Announcement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAnnouncements(userId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/announcement.schema").AnnouncementDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/announcement.schema").Announcement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    acknowledgeAnnouncement(id: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/announcement.schema").AnnouncementDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/announcement.schema").Announcement & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
