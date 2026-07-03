import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsOptional()
  isVisible?: boolean;
}
