import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
export declare class AuditLogService {
    private auditLogModel;
    constructor(auditLogModel: Model<AuditLogDocument>);
    log(data: Partial<AuditLog>): Promise<void>;
    getLogs(filters?: any, options?: {
        limit?: number;
        skip?: number;
    }): Promise<{
        items: (import("mongoose").Document<unknown, {}, AuditLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
    }>;
}
