import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { LeadPriority, LeadStatus } from '../schemas/lead.schema';

export class UpdateLeadDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
  
  @IsString()
  @IsOptional()
  name?: string;
  
  @IsString()
  @IsOptional()
  email?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;
  
  @IsString()
  @IsOptional()
  company?: string;

  @IsOptional()
  value?: number;
}
