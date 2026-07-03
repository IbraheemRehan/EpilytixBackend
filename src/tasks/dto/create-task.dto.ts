import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsMongoId()
  @IsOptional()
  assignee?: string;

  @IsMongoId()
  @IsOptional()
  relatedLead?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  isPrivate?: boolean;
}
