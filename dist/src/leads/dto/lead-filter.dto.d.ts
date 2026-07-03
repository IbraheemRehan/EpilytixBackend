import { LeadStatus } from '../schemas/lead.schema';
export declare class LeadFilterDto {
    status?: LeadStatus;
    assignedTo?: string;
    search?: string;
    page?: string;
    limit?: string;
}
