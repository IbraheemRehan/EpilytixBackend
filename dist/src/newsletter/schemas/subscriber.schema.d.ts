import { Document, Types } from 'mongoose';
export type SubscriberDocument = Subscriber & Document;
export declare enum SubscriberStatus {
    ACTIVE = "ACTIVE",
    UNSUBSCRIBED = "UNSUBSCRIBED"
}
export declare class Subscriber {
    _id: Types.ObjectId;
    email: string;
    status: SubscriberStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SubscriberSchema: import("mongoose").Schema<Subscriber, import("mongoose").Model<Subscriber, any, any, any, any, any, Subscriber>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subscriber, Document<unknown, {}, Subscriber, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Subscriber & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Subscriber, Document<unknown, {}, Subscriber, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subscriber & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Subscriber, Document<unknown, {}, Subscriber, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subscriber & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<SubscriberStatus, Subscriber, Document<unknown, {}, Subscriber, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subscriber & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Subscriber, Document<unknown, {}, Subscriber, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subscriber & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Subscriber, Document<unknown, {}, Subscriber, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subscriber & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Subscriber>;
