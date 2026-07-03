import { Document, Types } from 'mongoose';
export type LeadDocument = Lead & Document;
export declare enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    FOLLOW_UP = "FOLLOW_UP",
    IN_PROGRESS = "IN_PROGRESS",
    QUALIFIED = "QUALIFIED",
    CONVERTED = "CONVERTED",
    LOST = "LOST",
    CLOSED = "CLOSED"
}
export declare enum LeadPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class LeadNote {
    _id: Types.ObjectId;
    content: string;
    author: Types.ObjectId;
    createdAt: Date;
}
export declare const LeadNoteSchema: import("mongoose").Schema<LeadNote, import("mongoose").Model<LeadNote, any, any, any, any, any, LeadNote>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeadNote, Document<unknown, {}, LeadNote, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<LeadNote & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeadNote, Document<unknown, {}, LeadNote, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadNote & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, LeadNote, Document<unknown, {}, LeadNote, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadNote & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    author?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeadNote, Document<unknown, {}, LeadNote, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadNote & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, LeadNote, Document<unknown, {}, LeadNote, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadNote & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, LeadNote>;
export declare class LeadHistory {
    action: string;
    from?: string;
    to?: string;
    performedBy: Types.ObjectId;
    timestamp: Date;
}
export declare const LeadHistorySchema: import("mongoose").Schema<LeadHistory, import("mongoose").Model<LeadHistory, any, any, any, any, any, LeadHistory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeadHistory, Document<unknown, {}, LeadHistory, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<LeadHistory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    action?: import("mongoose").SchemaDefinitionProperty<string, LeadHistory, Document<unknown, {}, LeadHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    from?: import("mongoose").SchemaDefinitionProperty<string | undefined, LeadHistory, Document<unknown, {}, LeadHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    to?: import("mongoose").SchemaDefinitionProperty<string | undefined, LeadHistory, Document<unknown, {}, LeadHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    performedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeadHistory, Document<unknown, {}, LeadHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    timestamp?: import("mongoose").SchemaDefinitionProperty<Date, LeadHistory, Document<unknown, {}, LeadHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, LeadHistory>;
export declare class Lead {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
    source: string;
    sourcePage?: string;
    status: LeadStatus;
    assignedTo?: Types.ObjectId;
    priority: LeadPriority;
    tags: string[];
    value: number;
    notes: LeadNote[];
    history: LeadHistory[];
    syncVersion: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LeadSchema: import("mongoose").Schema<Lead, import("mongoose").Model<Lead, any, any, any, any, any, Lead>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Lead, Document<unknown, {}, Lead, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string | undefined, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    company?: import("mongoose").SchemaDefinitionProperty<string | undefined, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sourcePage?: import("mongoose").SchemaDefinitionProperty<string | undefined, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<LeadStatus, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    assignedTo?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    priority?: import("mongoose").SchemaDefinitionProperty<LeadPriority, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    value?: import("mongoose").SchemaDefinitionProperty<number, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<LeadNote[], Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    history?: import("mongoose").SchemaDefinitionProperty<LeadHistory[], Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    syncVersion?: import("mongoose").SchemaDefinitionProperty<number, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Lead, Document<unknown, {}, Lead, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lead & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Lead>;
