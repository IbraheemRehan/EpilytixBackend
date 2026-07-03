import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<import("./schemas/task.schema").Task & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getStats(req: any): Promise<{
        pending: number;
        inProgress: number;
        completed: number;
        total: number;
        dueToday: any;
        overdue: any;
    }>;
    findAll(req: any, query: any): Promise<{
        items: (import("./schemas/task.schema").Task & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    findOne(id: string, req: any): Promise<import("./schemas/task.schema").Task & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<import("./schemas/task.schema").Task & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
