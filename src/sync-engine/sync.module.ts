import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsModule } from '../leads/leads.module';
import { ContentModule } from '../content-management/content.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    LeadsModule,
    ContentModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
