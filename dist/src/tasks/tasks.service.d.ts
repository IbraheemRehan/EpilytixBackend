import { Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TasksService {
    private taskModel;
    private userModel;
    private auditLogService;
    private notificationsService;
    constructor(taskModel: Model<TaskDocument>, userModel: Model<UserDocument>, auditLogService: AuditLogService, notificationsService: NotificationsService);
    create(createTaskDto: CreateTaskDto, user: any): Promise<Task & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(user: any, filter?: any): Promise<{
        items: (Task & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    findOne(id: string, user: any): Promise<Task & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: any): Promise<Task & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, user: any): Promise<{
        success: boolean;
    }>;
    getStats(user: any): Promise<{
        pending: number;
        inProgress: number;
        completed: number;
        total: number;
        dueToday: any;
        overdue: any;
    }>;
}
