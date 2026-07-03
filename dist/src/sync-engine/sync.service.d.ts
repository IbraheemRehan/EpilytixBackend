import { LeadsService } from '../leads/leads.service';
import { SyncPayloadDto } from './dto/sync-payload.dto';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { Model } from 'mongoose';
export declare class SyncService {
    private leadsService;
    private leadModel;
    private readonly logger;
    constructor(leadsService: LeadsService, leadModel: Model<LeadDocument>);
    pullChanges(since: Date, userId: string, user: any): Promise<{
        timestamp: string;
        leads: (import("mongoose").Document<unknown, {}, LeadDocument, {}, import("mongoose").DefaultSchemaOptions> & Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    pushChanges(payload: SyncPayloadDto, user: any): Promise<{
        timestamp: string;
        results: ({
            localId: string | undefined;
            entityId: any;
            status: string;
            error?: undefined;
        } | {
            localId: string | undefined;
            status: string;
            error: any;
            entityId?: undefined;
        })[];
        conflicts: {
            localId: string | undefined;
            entityId: string | undefined;
            reason: string;
            serverVersion: number;
        }[];
    }>;
}
