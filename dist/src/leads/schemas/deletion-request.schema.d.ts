import { Document, Types } from 'mongoose';
export type LeadDeletionRequestDocument = LeadDeletionRequest & Document;
export declare enum DeletionRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class LeadDeletionRequest {
    _id: Types.ObjectId;
    leadId: Types.ObjectId;
    leadName: string;
    requestedBy: Types.ObjectId;
    approvals: Types.ObjectId[];
    requiredVotes: number;
    status: DeletionRequestStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LeadDeletionRequestSchema: import("mongoose").Schema<LeadDeletionRequest, import("mongoose").Model<LeadDeletionRequest, any, any, any, any, any, LeadDeletionRequest>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    leadId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    leadName?: import("mongoose").SchemaDefinitionProperty<string, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    requestedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    approvals?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    requiredVotes?: import("mongoose").SchemaDefinitionProperty<number, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<DeletionRequestStatus, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, LeadDeletionRequest, Document<unknown, {}, LeadDeletionRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeadDeletionRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, LeadDeletionRequest>;
