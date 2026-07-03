"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("./schemas/task.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const audit_service_1 = require("../audit-logs/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let TasksService = class TasksService {
    taskModel;
    userModel;
    auditLogService;
    notificationsService;
    constructor(taskModel, userModel, auditLogService, notificationsService) {
        this.taskModel = taskModel;
        this.userModel = userModel;
        this.auditLogService = auditLogService;
        this.notificationsService = notificationsService;
    }
    async create(createTaskDto, user) {
        const task = new this.taskModel({
            ...createTaskDto,
            createdBy: new mongoose_2.Types.ObjectId(user.userId),
        });
        if (createTaskDto.assignee) {
            task.assignee = new mongoose_2.Types.ObjectId(createTaskDto.assignee);
        }
        else {
            task.assignee = new mongoose_2.Types.ObjectId(user.userId);
        }
        if (createTaskDto.relatedLead) {
            task.relatedLead = new mongoose_2.Types.ObjectId(createTaskDto.relatedLead);
        }
        await task.save();
        await this.auditLogService.log({
            userId: new mongoose_2.Types.ObjectId(user.userId),
            action: 'TASK_CREATED',
            resource: 'Task',
            resourceId: task._id.toString(),
            details: { title: task.title, assignee: task.assignee }
        });
        if (task.assignee && task.assignee.toString() !== user.userId) {
            try {
                const creatorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Co-founder';
                await this.notificationsService.sendNotification(task.assignee.toString(), notification_schema_1.NotificationType.TASK_ASSIGNED, 'New Task Assigned', `${creatorName} has assigned you a new task: "${task.title}".`, {
                    resourceId: task._id.toString(),
                    resourceType: 'Task',
                });
            }
            catch (err) {
                console.error('Failed to send task assignment notification:', err);
            }
        }
        return task.toJSON();
    }
    async findAll(user, filter) {
        await this.userModel.findByIdAndUpdate(user.userId, {
            lastSeenTasksAt: new Date(),
        });
        const query = {};
        const visibilityQuery = {
            $or: [
                { isPrivate: false },
                { isPrivate: { $exists: false } },
                { isPrivate: true, createdBy: new mongoose_2.Types.ObjectId(user.userId) },
                { isPrivate: true, assignee: new mongoose_2.Types.ObjectId(user.userId) }
            ]
        };
        if (user.role !== user_schema_1.UserRole.CEO && !user.permissions?.canViewAllLeads) {
            query.$and = [
                visibilityQuery,
                {
                    $or: [
                        { assignee: new mongoose_2.Types.ObjectId(user.userId) },
                        { createdBy: new mongoose_2.Types.ObjectId(user.userId) }
                    ]
                }
            ];
        }
        else {
            query.$and = [visibilityQuery];
        }
        if (filter?.status) {
            query.status = filter.status;
        }
        if (filter?.priority) {
            query.priority = filter.priority;
        }
        if (filter?.assignee) {
            query.assignee = new mongoose_2.Types.ObjectId(filter.assignee);
        }
        const items = await this.taskModel
            .find(query)
            .sort({ dueDate: 1, createdAt: -1 })
            .populate('assignee', 'firstName lastName avatar')
            .populate('createdBy', 'firstName lastName avatar')
            .populate('relatedLead', 'name company')
            .exec();
        return {
            items: items.map(i => i.toJSON()),
            total: items.length,
        };
    }
    async findOne(id, user) {
        const task = await this.taskModel
            .findById(id)
            .populate('assignee', 'firstName lastName avatar')
            .populate('createdBy', 'firstName lastName avatar')
            .populate('relatedLead', 'name company')
            .exec();
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return task.toJSON();
    }
    async update(id, updateTaskDto, user) {
        const originalTask = await this.taskModel.findById(id);
        if (!originalTask)
            throw new common_1.NotFoundException('Task not found');
        const updateData = { ...updateTaskDto };
        delete updateData.assignee;
        if (updateTaskDto.relatedLead) {
            updateData.relatedLead = new mongoose_2.Types.ObjectId(updateTaskDto.relatedLead);
        }
        const updated = await this.taskModel.findByIdAndUpdate(id, { $set: updateData }, { new: true })
            .populate('assignee', 'firstName lastName avatar')
            .populate('createdBy', 'firstName lastName avatar')
            .populate('relatedLead', 'name company')
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Task not found');
        if (updateTaskDto.assignee && originalTask.assignee?.toString() !== updateTaskDto.assignee) {
            try {
                const creatorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Co-founder';
                await this.notificationsService.sendNotification(updateTaskDto.assignee, notification_schema_1.NotificationType.TASK_ASSIGNED, 'Task Reassigned', `${creatorName} has assigned you a task: "${updated.title}".`, {
                    resourceId: updated._id.toString(),
                    resourceType: 'Task',
                });
            }
            catch (err) {
                console.error('Failed to send task reassignment notification:', err);
            }
        }
        if (updateTaskDto.priority && originalTask.priority !== updateTaskDto.priority) {
            try {
                const updaterName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Co-founder';
                const activeFounders = await this.userModel.find({
                    role: { $in: [user_schema_1.UserRole.FOUNDER, user_schema_1.UserRole.CEO] },
                    isActive: true,
                });
                for (const founder of activeFounders) {
                    if (founder._id.toString() === user.userId)
                        continue;
                    await this.notificationsService.sendNotification(founder._id.toString(), notification_schema_1.NotificationType.TASK_ASSIGNED, 'Task Priority Changed', `${updaterName} updated task "${updated.title}" priority to ${updateTaskDto.priority}.`, {
                        resourceId: updated._id.toString(),
                        resourceType: 'Task',
                    });
                }
            }
            catch (err) {
                console.error('Failed to send task priority change notifications:', err);
            }
        }
        if (updateData.status) {
            await this.auditLogService.log({
                userId: new mongoose_2.Types.ObjectId(user.userId),
                action: `TASK_STATUS_UPDATED`,
                resource: 'Task',
                resourceId: updated._id.toString(),
                details: { title: updated.title, newStatus: updated.status }
            });
        }
        return updated.toJSON();
    }
    async remove(id, user) {
        const deleted = await this.taskModel.findByIdAndDelete(id);
        if (!deleted)
            throw new common_1.NotFoundException('Task not found');
        return { success: true };
    }
    async getStats(user) {
        const query = {};
        const visibilityQuery = {
            $or: [
                { isPrivate: false },
                { isPrivate: { $exists: false } },
                { isPrivate: true, createdBy: new mongoose_2.Types.ObjectId(user.userId) },
                { isPrivate: true, assignee: new mongoose_2.Types.ObjectId(user.userId) }
            ]
        };
        if (user.role !== user_schema_1.UserRole.CEO && !user.permissions?.canViewAllLeads) {
            query.$and = [
                visibilityQuery,
                {
                    $or: [
                        { assignee: new mongoose_2.Types.ObjectId(user.userId) },
                        { createdBy: new mongoose_2.Types.ObjectId(user.userId) }
                    ]
                }
            ];
        }
        else {
            query.$and = [visibilityQuery];
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        const aggregations = await this.taskModel.aggregate([
            { $match: query },
            {
                $facet: {
                    statusCounts: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    dueToday: [
                        { $match: {
                                dueDate: { $gte: today, $lte: endOfToday },
                                status: { $ne: task_schema_1.TaskStatus.COMPLETED }
                            }
                        },
                        { $count: 'count' }
                    ],
                    overdue: [
                        { $match: {
                                dueDate: { $lt: today },
                                status: { $ne: task_schema_1.TaskStatus.COMPLETED }
                            } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);
        const data = aggregations[0];
        const result = {
            pending: 0,
            inProgress: 0,
            completed: 0,
            total: 0,
            dueToday: data.dueToday[0]?.count || 0,
            overdue: data.overdue[0]?.count || 0,
        };
        data.statusCounts.forEach((stat) => {
            const s = stat._id;
            const count = stat.count;
            result.total += count;
            if (s === task_schema_1.TaskStatus.PENDING)
                result.pending = count;
            if (s === task_schema_1.TaskStatus.IN_PROGRESS)
                result.inProgress = count;
            if (s === task_schema_1.TaskStatus.COMPLETED)
                result.completed = count;
        });
        return result;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditLogService,
        notifications_service_1.NotificationsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map