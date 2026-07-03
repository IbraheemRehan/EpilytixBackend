import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { LeadDeletionRequest, LeadDeletionRequestSchema } from './schemas/deletion-request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuditLogModule } from '../audit-logs/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NewsletterModule } from '../newsletter/newsletter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: LeadDeletionRequest.name, schema: LeadDeletionRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditLogModule,
    NotificationsModule,
    NewsletterModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
