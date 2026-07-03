import { Document, Types } from 'mongoose';
export type TaskDocument = Task & Document;
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
}
export declare enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class Task {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: Types.ObjectId;
    relatedLead?: Types.ObjectId;
    dueDate?: Date;
    createdBy: Types.ObjectId;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TaskSchema: import("mongoose").Schema<Task, import("mongoose").Model<Task, any, any, any, any, any, Task>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Task, Document<unknown, {}, Task, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<TaskStatus, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    priority?: import("mongoose").SchemaDefinitionProperty<TaskPriority, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    assignee?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    relatedLead?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dueDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isPrivate?: import("mongoose").SchemaDefinitionProperty<boolean, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Task, Document<unknown, {}, Task, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Task & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Task>;
