import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPayloadDto } from './dto/sync-payload.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('pull')
  pullChanges(@Query('since') since: string, @CurrentUser() user: any) {
    const sinceDate = since ? new Date(since) : new Date(0);
    return this.syncService.pullChanges(sinceDate, user.userId, user);
  }

  @Post('push')
  pushChanges(@Body() payload: SyncPayloadDto, @CurrentUser() user: any) {
    return this.syncService.pushChanges(payload, user);
  }
}
