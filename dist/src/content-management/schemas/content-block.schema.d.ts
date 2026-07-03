import { Document, Types, Schema as MongooseSchema } from 'mongoose';
export type ContentBlockDocument = ContentBlock & Document;
export declare class ContentBlock {
    _id: Types.ObjectId;
    section: string;
    key: string;
    value: any;
    isVisible: boolean;
    updatedBy?: Types.ObjectId;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ContentBlockSchema: MongooseSchema<ContentBlock, import("mongoose").Model<ContentBlock, any, any, any, any, any, ContentBlock>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContentBlock, Document<unknown, {}, ContentBlock, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    section?: import("mongoose").SchemaDefinitionProperty<string, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    key?: import("mongoose").SchemaDefinitionProperty<string, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    value?: import("mongoose").SchemaDefinitionProperty<any, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isVisible?: import("mongoose").SchemaDefinitionProperty<boolean, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    version?: import("mongoose").SchemaDefinitionProperty<number, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, ContentBlock, Document<unknown, {}, ContentBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContentBlock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ContentBlock>;
