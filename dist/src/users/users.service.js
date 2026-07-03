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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const user_schema_1 = require("./schemas/user.schema");
const announcement_schema_1 = require("./schemas/announcement.schema");
const lead_schema_1 = require("../leads/schemas/lead.schema");
const task_schema_1 = require("../tasks/schemas/task.schema");
const audit_service_1 = require("../audit-logs/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let UsersService = class UsersService {
    userModel;
    announcementModel;
    leadModel;
    taskModel;
    auditLogService;
    notificationsService;
    configService;
    transporter;
    constructor(userModel, announcementModel, leadModel, taskModel, auditLogService, notificationsService, configService) {
        this.userModel = userModel;
        this.announcementModel = announcementModel;
        this.leadModel = leadModel;
        this.taskModel = taskModel;
        this.auditLogService = auditLogService;
        this.notificationsService = notificationsService;
        this.configService = configService;
        const smtp = this.configService.get('app.smtp');
        if (smtp?.user && smtp?.pass) {
            this.transporter = nodemailer.createTransport({
                host: smtp.host,
                port: smtp.port,
                secure: smtp.port === 465,
                auth: { user: smtp.user, pass: smtp.pass },
            });
        }
    }
    async getMyLogins(userId) {
        const logins = await this.auditLogService.getLogs({
            userId,
            action: { $in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] },
        }, { limit: 20 });
        return { logins };
    }
    async updateMyProfile(userId, updateMeDto) {
        const user = await this.userModel.findByIdAndUpdate(userId, { $set: updateMeDto }, { new: true, select: '-passwordHash -refreshTokenHash -twoFactorSecret' });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateMyPassword(userId, oldPassword, newPassword) {
        if (!oldPassword || !newPassword) {
            throw new common_1.BadRequestException('Old and new passwords are required');
        }
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid old password');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(userId, { passwordHash });
        await this.auditLogService.log({
            userId: userId,
            action: 'CHANGE_PASSWORD',
            resource: 'users',
        });
        return { message: 'Password updated successfully' };
    }
    async createFounder(createDto, callerId, callerRole) {
        if (callerRole !== user_schema_1.UserRole.CEO) {
            const caller = await this.userModel.findById(callerId);
            if (!caller)
                throw new common_1.NotFoundException('Caller profile not found');
            if (createDto.email.toLowerCase() !== caller.email.toLowerCase()) {
                throw new common_1.ForbiddenException('You can only add your own information');
            }
            if (caller.firstName !== 'Pending' && caller.firstName !== '' && caller.lastName !== 'Pending' && caller.lastName !== '') {
                throw new common_1.ConflictException('You have already added your information');
            }
            const updateData = {
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
            if (!updatedUser)
                throw new common_1.NotFoundException('User not found');
            return updatedUser.toJSON();
        }
        const existing = await this.userModel.findOne({
            email: createDto.email.toLowerCase(),
        });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const tempPassword = createDto.password || crypto.randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const { password, ...saveDto } = createDto;
        const user = new this.userModel({
            ...saveDto,
            role: user_schema_1.UserRole.FOUNDER,
            passwordHash,
            permissions: {
                canManageLeads: true,
                canViewAllLeads: false,
                canManageContent: false,
                canChat: true,
            },
        });
        await user.save();
        await this.auditLogService.log({
            userId: callerId,
            action: 'CREATE_FOUNDER',
            resource: 'users',
            resourceId: user._id.toString(),
            details: { email: user.email },
        });
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: `"Epilytix Admin" <${this.configService.get('app.smtp.user')}>`,
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
            }
            catch (error) {
                console.error('Failed to send invitation email', error);
            }
        }
        else {
            console.log(`[DEV] Created founder ${user.email} with temp password: ${tempPassword}`);
        }
        return user.toJSON();
    }
    async findAllFounders() {
        return this.userModel
            .find({ role: { $in: [user_schema_1.UserRole.FOUNDER, user_schema_1.UserRole.CEO] }, isActive: true })
            .select('firstName lastName role avatar')
            .lean()
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id, callerId, callerRole) {
        if (callerRole && callerRole !== user_schema_1.UserRole.CEO && id !== callerId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const user = await this.userModel
            .findById(id)
            .select('-passwordHash -refreshTokenHash -twoFactorSecret')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateFounder(id, updateDto, callerId, callerRole) {
        if (callerRole !== user_schema_1.UserRole.CEO && id !== callerId) {
            throw new common_1.ForbiddenException('You can only edit your own information');
        }
        const user = await this.userModel.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === user_schema_1.UserRole.CEO && callerRole !== user_schema_1.UserRole.CEO)
            throw new common_1.ForbiddenException('Cannot modify CEO');
        if (updateDto.email && updateDto.email !== user.email) {
            const existing = await this.userModel.findOne({ email: updateDto.email.toLowerCase() });
            if (existing)
                throw new common_1.ConflictException('Email already in use');
        }
        const updated = await this.userModel.findByIdAndUpdate(id, { $set: updateDto }, { new: true }).select('-passwordHash -refreshTokenHash -twoFactorSecret');
        if (updateDto.isActive === false) {
            await this.userModel.findByIdAndUpdate(id, {
                refreshTokenHash: null,
                fcmTokens: [],
            });
        }
        await this.auditLogService.log({
            userId: callerId,
            action: 'UPDATE_FOUNDER',
            resource: 'users',
            resourceId: id,
            details: updateDto,
        });
        return updated;
    }
    async updatePermissions(id, permissions, ceoId) {
        const user = await this.userModel.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === user_schema_1.UserRole.CEO)
            throw new common_1.BadRequestException('Cannot modify CEO permissions');
        const updated = await this.userModel.findByIdAndUpdate(id, { $set: { permissions: { ...(user.permissions?.toObject ? user.permissions.toObject() : user.permissions), ...permissions } } }, { new: true }).select('-passwordHash -refreshTokenHash -twoFactorSecret');
        await this.auditLogService.log({
            userId: ceoId,
            action: 'UPDATE_FOUNDER_PERMISSIONS',
            resource: 'users',
            resourceId: id,
            details: permissions,
        });
        return updated;
    }
    async deleteFounder(id, callerId, callerRole) {
        if (callerRole !== user_schema_1.UserRole.CEO && id !== callerId) {
            throw new common_1.ForbiddenException('You can only delete your own information');
        }
        const user = await this.userModel.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === user_schema_1.UserRole.CEO)
            throw new common_1.BadRequestException('Cannot delete CEO');
        await this.userModel.findByIdAndDelete(id);
        await this.auditLogService.log({
            userId: callerId,
            action: 'DELETE_FOUNDER',
            resource: 'users',
            resourceId: id,
        });
        return { message: 'Founder deleted successfully' };
    }
    async createAnnouncement(title, content, caller) {
        const announcement = new this.announcementModel({
            title,
            content,
            createdBy: caller.userId,
        });
        await announcement.save();
        await this.auditLogService.log({
            userId: caller.userId,
            action: 'CREATE_ANNOUNCEMENT',
            resource: 'announcements',
            resourceId: announcement._id.toString(),
            details: { title },
        });
        const founders = await this.userModel.find({
            role: { $in: [user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER] },
            isActive: true,
        }).select('_id').exec();
        const authorDoc = await this.userModel.findById(caller.userId).select('firstName lastName').lean();
        const authorName = authorDoc ? `${authorDoc.firstName} ${authorDoc.lastName}` : 'A founder';
        for (const founder of founders) {
            await this.notificationsService.sendNotification(founder._id.toString(), notification_schema_1.NotificationType.ANNOUNCEMENT, 'New Announcement', `${authorName} posted: "${title}". Tap to read.`, {
                resourceId: announcement._id.toString(),
                resourceType: 'Announcement',
            });
        }
        return announcement;
    }
    async getAnnouncements(userId) {
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
    async acknowledgeAnnouncement(announcementId, userId) {
        const announcement = await this.announcementModel.findById(announcementId);
        if (!announcement) {
            throw new common_1.NotFoundException('Announcement not found');
        }
        const { Types } = require('mongoose');
        const userObjectId = new Types.ObjectId(userId);
        const userIndex = announcement.acknowledgedBy.findIndex((id) => id.toString() === userId);
        if (userIndex > -1) {
            announcement.acknowledgedBy.splice(userIndex, 1);
        }
        else {
            announcement.acknowledgedBy.push(userObjectId);
        }
        await announcement.save();
        return this.getAnnouncements();
    }
    async getUnseenCounts(userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!user)
            return { leads: false, tasks: false, announcements: false };
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
            leads: lastLead ? new Date(lastLead.createdAt) > lastSeenLeads : false,
            tasks: lastTask ? new Date(lastTask.createdAt) > lastSeenTasks : false,
            announcements: lastAnnouncement ? new Date(lastAnnouncement.createdAt) > lastSeenAnnouncements : false,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(announcement_schema_1.Announcement.name)),
    __param(2, (0, mongoose_1.InjectModel)(lead_schema_1.Lead.name)),
    __param(3, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditLogService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map