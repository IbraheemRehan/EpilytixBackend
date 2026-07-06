import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateFounderDto } from './dto/create-founder.dto';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/logins')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  getMyLogins(@CurrentUser('userId') userId: string) {
    return this.usersService.getMyLogins(userId);
  }

  @Get('me/unseen-counts')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  getUnseenCounts(@CurrentUser('userId') userId: string) {
    return this.usersService.getUnseenCounts(userId);
  }

  @Patch('me')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  updateMyProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.usersService.updateMyProfile(userId, updateMeDto);
  }

  @Patch('me/password')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  updateMyPassword(
    @CurrentUser('userId') userId: string,
    @Body('oldPassword') oldPassword?: string,
    @Body('newPassword') newPassword?: string,
  ) {
    return this.usersService.updateMyPassword(userId, oldPassword, newPassword);
  }

  @Post('founders')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  createFounder(
    @Body() createFounderDto: CreateFounderDto,
    @CurrentUser('userId') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.usersService.createFounder(createFounderDto, callerId, callerRole);
  }

  @Get('founders')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  findAllFounders() {
    return this.usersService.findAllFounders();
  }

  @Get('founders/:id')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.usersService.findOne(id, callerId, callerRole);
  }

  @Patch('founders/:id')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  updateFounder(
    @Param('id') id: string,
    @Body() updateFounderDto: UpdateFounderDto,
    @CurrentUser('userId') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.usersService.updateFounder(id, updateFounderDto, callerId, callerRole);
  }

  @Patch('founders/:id/permissions')
  @Roles(UserRole.CEO)
  updatePermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
    @CurrentUser('userId') ceoId: string,
  ) {
    return this.usersService.updatePermissions(id, updatePermissionsDto, ceoId);
  }

  @Post('admin/cleanup-founders')
  @Roles(UserRole.CEO)
  cleanupFounders(@CurrentUser('userId') ceoId: string) {
    // CEO can trigger cleanup; ignore callerId since method doesn't need it
    return this.usersService.cleanupFoundersAndCeo();
  }

  @Post('announcements')
  createAnnouncement(
    @Body('title') title: string,
    @Body('content') content: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.createAnnouncement(title, content, user);
  }

  @Get('announcements')
  getAnnouncements(@CurrentUser('userId') userId: string) {
    return this.usersService.getAnnouncements(userId);
  }

  @Post('announcements/:id/acknowledge')
  acknowledgeAnnouncement(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.usersService.acknowledgeAnnouncement(id, userId);
  }

  @Delete('founders/:id')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  deleteFounder(
    @Param('id') id: string,
    @CurrentUser('userId') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.usersService.deleteFounder(id, callerId, callerRole);
  }

  @Delete('announcements/:id')
  @Roles(UserRole.CEO, UserRole.FOUNDER)
  deleteAnnouncement(
    @Param('id') id: string,
    @CurrentUser('userId') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.usersService.deleteAnnouncement(id, callerId, callerRole);
  }
}
