import { Document, Types } from 'mongoose';
export type AnnouncementDocument = Announcement & Document;
export declare class Announcement {
    _id: Types.ObjectId;
    title: string;
    content: string;
    createdBy: Types.ObjectId;
    acknowledgedBy: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const AnnouncementSchema: import("mongoose").Schema<Announcement, import("mongoose").Model<Announcement, any, any, any, any, any, Announcement>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Announcement, Document<unknown, {}, Announcement, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    acknowledgedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Announcement, Document<unknown, {}, Announcement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Announcement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Announcement>;
