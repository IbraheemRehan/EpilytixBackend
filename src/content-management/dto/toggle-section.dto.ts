import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ToggleSectionDto {
  @IsBoolean()
  @IsNotEmpty()
  isVisible: boolean;
}
