import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      limit ? parseInt(limit, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('fcm-token')
  registerToken(
    @CurrentUser('userId') userId: string,
    @Body('token') token: string,
  ) {
    return this.notificationsService.registerFcmToken(userId, token);
  }
}
