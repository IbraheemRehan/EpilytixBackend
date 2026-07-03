import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SubscribeDto } from './dto/subscribe.dto';
export declare class NewsletterService {
    private subscriberModel;
    constructor(subscriberModel: Model<SubscriberDocument>);
    subscribe(subscribeDto: SubscribeDto): Promise<Subscriber & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<{
        items: (Subscriber & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    exportCsv(startDate?: string, endDate?: string): Promise<string>;
}
