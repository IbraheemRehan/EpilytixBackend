import { IsEnum, IsOptional, IsString, IsNumberString } from 'class-validator';
import { LeadStatus } from '../schemas/lead.schema';

export class LeadFilterDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;
}
