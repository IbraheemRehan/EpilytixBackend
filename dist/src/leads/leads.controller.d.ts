import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { AddNoteDto } from './dto/add-note.dto';
import type { Response } from 'express';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(createLeadDto: CreateLeadDto): Promise<import("./schemas/lead.schema").Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    export(res: Response, user: any): Promise<Response<any, Record<string, any>>>;
    findAll(filterDto: LeadFilterDto, user: any): Promise<{
        items: (import("./schemas/lead.schema").Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getStats(user: any): Promise<{
        totalLeads: number;
        activeLeads: number;
        convertedLeads: number;
        lostLeads: number;
        revenueGenerated: number;
        newThisWeek: any;
        newThisMonth: any;
        conversionRate: string;
        sources: {
            name: string;
            value: number;
        }[];
        statusBreakdown: Record<string, number>;
    }>;
    getDeleteRequests(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/deletion-request.schema").LeadDeletionRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/deletion-request.schema").LeadDeletionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    approveDeleteRequest(id: string, user: any): Promise<{
        message: string;
        deletionRequest: any;
    }>;
    findOne(id: string, user: any): Promise<import("./schemas/lead.schema").Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateLeadDto: UpdateLeadDto, user: any): Promise<import("./schemas/lead.schema").Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addNote(id: string, addNoteDto: AddNoteDto, user: any): Promise<import("./schemas/lead.schema").LeadNote | undefined>;
    requestDelete(id: string, user: any): Promise<{
        message: string;
        deletionRequest: any;
    }>;
    delete(id: string, user: any): Promise<{
        message: string;
        deletionRequest: any;
    }>;
}
