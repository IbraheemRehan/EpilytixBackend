import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePermissionsDto {
  @IsBoolean()
  @IsOptional()
  canManageLeads?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewAllLeads?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageContent?: boolean;

  @IsBoolean()
  @IsOptional()
  canChat?: boolean;
}
