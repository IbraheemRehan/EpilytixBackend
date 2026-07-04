import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, getApps, getApp } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { Resend } from 'resend';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: App;
  private resend: Resend;

  constructor(
    private configService: ConfigService,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly gateway: NotificationsGateway,
  ) {
    const projectId = this.configService.get('app.firebase.projectId');
    const clientEmail = this.configService.get('app.firebase.clientEmail');
    const privateKey = this.configService.get('app.firebase.privateKey');

    if (getApps().length) {
      this.firebaseApp = getApp();
      this.logger.log('Firebase Admin found. Push notifications enabled.');
    } else {
      this.logger.warn('Firebase configuration missing. Push notifications disabled.');
    }

    const resendApiKey = this.configService.get('app.resend.apiKey');

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('Resend initialized for notifications');
    } else {
      this.logger.warn('Resend configuration missing. Email notifications disabled.');
    }
  }

  async sendNotification(
    recipientId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    // Save to DB
    const notification = new this.notificationModel({
      recipientId: new Types.ObjectId(recipientId),
      type,
      title,
      body,
      resourceId: data?.resourceId,
      resourceType: data?.resourceType,
    });
    await notification.save();

    // Emit WebSocket event for real-time mobile app updates
    try {
      this.gateway.emitToUser(recipientId, 'notification:new', {
        id: notification._id.toString(),
        type,
        title,
        body,
        data,
      });

      // Backward compatibility events for specific tabs
      if (type === NotificationType.ANNOUNCEMENT) {
        this.gateway.broadcast('announcement:new', { id: notification._id.toString() });
      } else if (type === NotificationType.NEW_LEAD) {
        this.gateway.emitToUser(recipientId, 'lead:new', { id: notification._id.toString() });
      } else if (type === NotificationType.LEAD_STATUS_CHANGED || type === NotificationType.LEAD_ASSIGNED || type === NotificationType.DELETION_REQUEST || type === NotificationType.DELETION_APPROVED) {
        this.gateway.emitToUser(recipientId, 'lead:status', { id: notification._id.toString() });
      } else if (type === NotificationType.TASK_ASSIGNED) {
        this.gateway.emitToUser(recipientId, 'task:new', { id: notification._id.toString() });
      }
    } catch (wsErr) {
      this.logger.error('WebSocket emit error:', wsErr);
    }

    // Send Push
    const user = await this.userModel.findById(recipientId).select('email fcmTokens').exec();
    if (!user) return;

    if (!this.firebaseApp || !user.fcmTokens?.length) return;

    try {
      const message: MulticastMessage = {
        tokens: user.fcmTokens,
        notification: { title, body },
        data: {
          type,
          ...data,
        },
      };

      const response = await getMessaging().sendEachForMulticast(message);
      
      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(user.fcmTokens[idx]);
          }
        });
        if (invalidTokens.length > 0) {
          await this.userModel.findByIdAndUpdate(recipientId, {
            $pullAll: { fcmTokens: invalidTokens },
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error sending push to user ${recipientId}`, error);
    }
  }

  async getUserNotifications(userId: string, limit = 20, skip = 0) {
    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ recipientId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ recipientId: new Types.ObjectId(userId) }),
      this.notificationModel.countDocuments({ recipientId: new Types.ObjectId(userId), isRead: false }),
    ]);

    return { items, total, unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), recipientId: new Types.ObjectId(userId) },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return { success: true };
  }

  async registerFcmToken(userId: string, token: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
    return { success: true };
  }
}
