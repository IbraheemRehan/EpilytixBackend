import { TaskStatus, TaskPriority } from '../schemas/task.schema';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
    relatedLead?: string;
    dueDate?: string;
    isPrivate?: boolean;
}
