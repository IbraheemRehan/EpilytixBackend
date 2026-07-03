import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Announcement, AnnouncementSchema } from './schemas/announcement.schema';
import { AuditLogModule } from '../audit-logs/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    AuditLogModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
