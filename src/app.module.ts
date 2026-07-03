import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContentModule } from './content-management/content.module';
import { AuditLogModule } from './audit-logs/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SyncModule } from './sync-engine/sync.module';
import { UploadModule } from './file-upload/upload.module';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('app.throttle.ttl') || 60000,
          limit: config.get<number>('app.throttle.limit') || 60,
        },
      ],
    }),
    AuditLogModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    ContentModule,
    NewsletterModule,
    NotificationsModule,
    SyncModule,
    UploadModule,
    HealthModule,
    TasksModule,
  ],
})
export class AppModule {}
