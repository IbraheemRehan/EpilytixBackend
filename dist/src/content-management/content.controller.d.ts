import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';
import { ToggleSectionDto } from './dto/toggle-section.dto';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getAllVisibleContent(): Promise<Record<string, any>>;
    getAllContentIncludingHidden(user: any): Promise<Record<string, any>>;
    getSectionContent(section: string): Promise<any>;
    updateContent(section: string, updateContentDto: UpdateContentDto, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/content-block.schema").ContentBlockDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/content-block.schema").ContentBlock & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    toggleSection(section: string, toggleDto: ToggleSectionDto, user: any): Promise<{
        message: string;
    }>;
}
