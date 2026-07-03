import { PartialType } from '@nestjs/swagger';
import { CreateFounderDto } from './create-founder.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFounderDto extends PartialType(CreateFounderDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
