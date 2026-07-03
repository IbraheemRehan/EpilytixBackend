import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditLogService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  getLogs(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    return this.auditLogService.getLogs(
      {},
      {
        limit: limit ? parseInt(limit, 10) : 50,
        skip: skip ? parseInt(skip, 10) : 0,
      },
    );
  }
}
