import { LeadPriority, LeadStatus } from '../schemas/lead.schema';
export declare class UpdateLeadDto {
    status?: LeadStatus;
    priority?: LeadPriority;
    assignedTo?: string;
    tags?: string[];
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    value?: number;
}
