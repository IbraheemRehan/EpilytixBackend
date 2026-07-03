import type { Response } from 'express';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(subscribeDto: SubscribeDto): Promise<import("./schemas/subscriber.schema").Subscriber & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<{
        items: (import("./schemas/subscriber.schema").Subscriber & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    exportCsv(res: Response, startDate?: string, endDate?: string): Promise<Response<any, Record<string, any>>>;
}
