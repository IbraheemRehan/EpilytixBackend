import { Model, Types } from 'mongoose';
import { ContentBlock, ContentBlockDocument } from './schemas/content-block.schema';
import { UpdateContentDto } from './dto/update-content.dto';
import { ToggleSectionDto } from './dto/toggle-section.dto';
import { AuditLogService } from '../audit-logs/audit.service';
export declare class ContentService {
    private contentModel;
    private auditLogService;
    constructor(contentModel: Model<ContentBlockDocument>, auditLogService: AuditLogService);
    getAllContent(includeHidden?: boolean): Promise<Record<string, any>>;
    getSection(section: string, includeHidden?: boolean): Promise<any>;
    updateContent(section: string, updateDto: UpdateContentDto, user: any): Promise<import("mongoose").Document<unknown, {}, ContentBlockDocument, {}, import("mongoose").DefaultSchemaOptions> & ContentBlock & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    toggleSection(section: string, toggleDto: ToggleSectionDto, user: any): Promise<{
        message: string;
    }>;
    private checkPermissions;
}
