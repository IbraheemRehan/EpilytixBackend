import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class UpdateMeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  companyRole?: string;

  @IsBoolean()
  @IsOptional()
  isOnboarded?: boolean;
}
