import { SyncService } from './sync.service';
import { SyncPayloadDto } from './dto/sync-payload.dto';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    pullChanges(since: string, user: any): Promise<{
        timestamp: string;
        leads: (import("mongoose").Document<unknown, {}, import("../leads/schemas/lead.schema").LeadDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../leads/schemas/lead.schema").Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
