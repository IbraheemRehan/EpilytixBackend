import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { UserRole, User, UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditLogService: AuditLogService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: any) {
    const task = new this.taskModel({
      ...createTaskDto,
      createdBy: new Types.ObjectId(user.userId),
    });
    if (createTaskDto.assignee) {
      task.assignee = new Types.ObjectId(createTaskDto.assignee);
    } else {
      task.assignee = new Types.ObjectId(user.userId);
    }
    if (createTaskDto.relatedLead) {
      task.relatedLead = new Types.ObjectId(createTaskDto.relatedLead);
    }
    await task.save();

    await this.auditLogService.log({
      userId: new Types.ObjectId(user.userId),
      action: 'TASK_CREATED',
      resource: 'Task',
      resourceId: task._id.toString(),
      details: { title: task.title, assignee: task.assignee }
    });

    if (task.assignee && task.assignee.toString() !== user.userId) {
      try {
        const creatorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Co-founder';
        await this.notificationsService.sendNotification(
          task.assignee.toString(),
          NotificationType.TASK_ASSIGNED,
          'New Task Assigned',
          `${creatorName} has assigned you a new task: "${task.title}".`,
          {
            resourceId: task._id.toString(),
            resourceType: 'Task',
          }
        );
      } catch (err) {
        console.error('Failed to send task assignment notification:', err);
      }
    }

    return task.toJSON();
  }

  async findAll(user: any, filter?: any) {
    // Update lastSeenTasksAt for user
    await this.userModel.findByIdAndUpdate(user.userId, {
      lastSeenTasksAt: new Date(),
    });

    const query: any = {};
    
    const visibilityQuery = {
      $or: [
        { isPrivate: false },
        { isPrivate: { $exists: false } },
        { isPrivate: true, createdBy: new Types.ObjectId(user.userId) },
        { isPrivate: true, assignee: new Types.ObjectId(user.userId) }
      ]
    };

    if (user.role !== UserRole.CEO && !user.permissions?.canViewAllLeads) {
      query.$and = [
        visibilityQuery,
        {
          $or: [
            { assignee: new Types.ObjectId(user.userId) },
            { createdBy: new Types.ObjectId(user.userId) }
          ]
        }
      ];
    } else {
      query.$and = [visibilityQuery];
    }

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.priority) {
      query.priority = filter.priority;
    }
    if (filter?.assignee) {
      query.assignee = new Types.ObjectId(filter.assignee);
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

  async findOne(id: string, user: any) {
    const task = await this.taskModel
      .findById(id)
      .populate('assignee', 'firstName lastName avatar')
      .populate('createdBy', 'firstName lastName avatar')
      .populate('relatedLead', 'name company')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    return task.toJSON();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any) {
    const originalTask = await this.taskModel.findById(id);
    if (!originalTask) throw new NotFoundException('Task not found');

    const updateData: any = { ...updateTaskDto };
    delete updateData.assignee; // Assignee cannot be changed after creation
    
    if (updateTaskDto.relatedLead) {
      updateData.relatedLead = new Types.ObjectId(updateTaskDto.relatedLead);
    }

    const updated = await this.taskModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
    .populate('assignee', 'firstName lastName avatar')
    .populate('createdBy', 'firstName lastName avatar')
    .populate('relatedLead', 'name company')
    .exec();

    if (!updated) throw new NotFoundException('Task not found');

    if (updateTaskDto.assignee && originalTask.assignee?.toString() !== updateTaskDto.assignee) {
      try {
        const creatorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Co-founder';
        await this.notificationsService.sendNotification(
          updateTaskDto.assignee,
          NotificationType.TASK_ASSIGNED,
          'Task Reassigned',
          `${creatorName} has assigned you a task: "${updated.title}".`,
          {
            resourceId: updated._id.toString(),
            resourceType: 'Task',
          }
        );
      } catch (err) {
        console.error('Failed to send task reassignment notification:', err);
      }
    }

    if (updateTaskDto.priority && originalTask.priority !== updateTaskDto.priority) {
      try {
        const updaterName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Co-founder';
        const activeFounders = await this.userModel.find({
          role: { $in: [UserRole.FOUNDER, UserRole.CEO] },
          isActive: true,
        });
        
        for (const founder of activeFounders) {
          if (founder._id.toString() === user.userId) continue;

          await this.notificationsService.sendNotification(
            founder._id.toString(),
            NotificationType.TASK_ASSIGNED,
            'Task Priority Changed',
            `${updaterName} updated task "${updated.title}" priority to ${updateTaskDto.priority}.`,
            {
              resourceId: updated._id.toString(),
              resourceType: 'Task',
            }
          );
        }
      } catch (err) {
        console.error('Failed to send task priority change notifications:', err);
      }
    }

    if (updateData.status) {
      await this.auditLogService.log({
        userId: new Types.ObjectId(user.userId),
        action: `TASK_STATUS_UPDATED`,
        resource: 'Task',
        resourceId: updated._id.toString(),
        details: { title: updated.title, newStatus: updated.status }
      });
    }

    return updated.toJSON();
  }

  async remove(id: string, user: any) {
    const deleted = await this.taskModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Task not found');
    return { success: true };
  }

  async getStats(user: any) {
    const query: any = {};
    
    const visibilityQuery = {
      $or: [
        { isPrivate: false },
        { isPrivate: { $exists: false } },
        { isPrivate: true, createdBy: new Types.ObjectId(user.userId) },
        { isPrivate: true, assignee: new Types.ObjectId(user.userId) }
      ]
    };

    if (user.role !== UserRole.CEO && !user.permissions?.canViewAllLeads) {
      query.$and = [
        visibilityQuery,
        {
          $or: [
            { assignee: new Types.ObjectId(user.userId) },
            { createdBy: new Types.ObjectId(user.userId) }
          ]
        }
      ];
    } else {
      query.$and = [visibilityQuery];
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23,59,59,999);

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
                status: { $ne: TaskStatus.COMPLETED }
              } 
            },
            { $count: 'count' }
          ],
          overdue: [
            { $match: {
                dueDate: { $lt: today },
                status: { $ne: TaskStatus.COMPLETED }
            }},
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

    data.statusCounts.forEach((stat: any) => {
      const s = stat._id as string;
      const count = stat.count;
      result.total += count;
      if (s === TaskStatus.PENDING) result.pending = count;
      if (s === TaskStatus.IN_PROGRESS) result.inProgress = count;
      if (s === TaskStatus.COMPLETED) result.completed = count;
    });

    return result;
  }
}
