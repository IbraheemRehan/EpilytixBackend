import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentBlock, ContentBlockSchema } from './schemas/content-block.schema';
import { AuditLogModule } from '../audit-logs/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContentBlock.name, schema: ContentBlockSchema }]),
    AuditLogModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
