import { AuditLogService } from './audit.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    getLogs(limit?: string, skip?: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./schemas/audit-log.schema").AuditLogDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/audit-log.schema").AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
    }>;
}
