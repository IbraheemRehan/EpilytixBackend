import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private configService;
    private notificationModel;
    private userModel;
    private readonly gateway;
    private readonly logger;
    private firebaseApp;
    private resend;
    constructor(configService: ConfigService, notificationModel: Model<NotificationDocument>, userModel: Model<UserDocument>, gateway: NotificationsGateway);
    sendNotification(recipientId: string, type: NotificationType, title: string, body: string, data?: Record<string, string>): Promise<void>;
    getUserNotifications(userId: string, limit?: number, skip?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        unreadCount: number;
    }>;
    markAsRead(id: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    registerFcmToken(userId: string, token: string): Promise<{
        success: boolean;
    }>;
}
