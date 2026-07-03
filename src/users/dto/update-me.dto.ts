import { IsString, IsOptional, IsUrl } from 'class-validator';

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
}
