import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncPayloadDto {
  @IsArray()
  changes: SyncChange[];
}

export class SyncChange {
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsNotEmpty()
  action: 'CREATE' | 'UPDATE' | 'DELETE';

  @IsNotEmpty()
  payload: any;

  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsString()
  @IsOptional()
  localId?: string;
}
