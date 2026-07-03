"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
const nodemailer = __importStar(require("nodemailer"));
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    configService;
    notificationModel;
    userModel;
    gateway;
    logger = new common_1.Logger(NotificationsService_1.name);
    firebaseApp;
    transporter;
    constructor(configService, notificationModel, userModel, gateway) {
        this.configService = configService;
        this.notificationModel = notificationModel;
        this.userModel = userModel;
        this.gateway = gateway;
        const projectId = this.configService.get('app.firebase.projectId');
        const clientEmail = this.configService.get('app.firebase.clientEmail');
        const privateKey = this.configService.get('app.firebase.privateKey');
        if ((0, app_1.getApps)().length) {
            this.firebaseApp = (0, app_1.getApp)();
            this.logger.log('Firebase Admin found. Push notifications enabled.');
        }
        else {
            this.logger.warn('Firebase configuration missing. Push notifications disabled.');
        }
        const smtpHost = this.configService.get('app.smtp.host');
        const smtpPort = this.configService.get('app.smtp.port');
        const smtpUser = this.configService.get('app.smtp.user');
        const smtpPass = this.configService.get('app.smtp.pass');
        if (smtpHost && smtpUser) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
            this.logger.log('Nodemailer initialized for notifications');
        }
        else {
            this.logger.warn('SMTP configuration missing. Email notifications disabled.');
        }
    }
    async sendNotification(recipientId, type, title, body, data) {
        const notification = new this.notificationModel({
            recipientId: new mongoose_2.Types.ObjectId(recipientId),
            type,
            title,
            body,
            resourceId: data?.resourceId,
            resourceType: data?.resourceType,
        });
        await notification.save();
        try {
            this.gateway.emitToUser(recipientId, 'notification:new', {
                id: notification._id.toString(),
                type,
                title,
                body,
                data,
            });
            if (type === notification_schema_1.NotificationType.ANNOUNCEMENT) {
                this.gateway.broadcast('announcement:new', { id: notification._id.toString() });
            }
            else if (type === notification_schema_1.NotificationType.NEW_LEAD) {
                this.gateway.emitToUser(recipientId, 'lead:new', { id: notification._id.toString() });
            }
            else if (type === notification_schema_1.NotificationType.LEAD_STATUS_CHANGED || type === notification_schema_1.NotificationType.LEAD_ASSIGNED || type === notification_schema_1.NotificationType.DELETION_REQUEST || type === notification_schema_1.NotificationType.DELETION_APPROVED) {
                this.gateway.emitToUser(recipientId, 'lead:status', { id: notification._id.toString() });
            }
            else if (type === notification_schema_1.NotificationType.TASK_ASSIGNED) {
                this.gateway.emitToUser(recipientId, 'task:new', { id: notification._id.toString() });
            }
        }
        catch (wsErr) {
            this.logger.error('WebSocket emit error:', wsErr);
        }
        const user = await this.userModel.findById(recipientId).select('email fcmTokens').exec();
        if (!user)
            return;
        if (!this.firebaseApp || !user.fcmTokens?.length)
            return;
        try {
            const message = {
                tokens: user.fcmTokens,
                notification: { title, body },
                data: {
                    type,
                    ...data,
                },
            };
            const response = await (0, messaging_1.getMessaging)().sendEachForMulticast(message);
            if (response.failureCount > 0) {
                const invalidTokens = [];
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
        }
        catch (error) {
            this.logger.error(`Error sending push to user ${recipientId}`, error);
        }
    }
    async getUserNotifications(userId, limit = 20, skip = 0) {
        const [items, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find({ recipientId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.notificationModel.countDocuments({ recipientId: new mongoose_2.Types.ObjectId(userId) }),
            this.notificationModel.countDocuments({ recipientId: new mongoose_2.Types.ObjectId(userId), isRead: false }),
        ]);
        return { items, total, unreadCount };
    }
    async markAsRead(id, userId) {
        return this.notificationModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), recipientId: new mongoose_2.Types.ObjectId(userId) }, { $set: { isRead: true, readAt: new Date() } }, { new: true });
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({ recipientId: new mongoose_2.Types.ObjectId(userId), isRead: false }, { $set: { isRead: true, readAt: new Date() } });
        return { success: true };
    }
    async registerFcmToken(userId, token) {
        await this.userModel.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: token },
        });
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map