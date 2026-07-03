import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, limit: string, skip: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        unreadCount: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    markAsRead(id: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    registerToken(userId: string, token: string): Promise<{
        success: boolean;
    }>;
}
