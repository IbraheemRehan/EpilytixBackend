import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Delete,
  Res,
  Logger,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Response } from 'express';

@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);
  constructor(private readonly leadsService: LeadsService) {}

  @Public() // Public endpoint for web forms to submit leads
  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    this.logger.log(`🚀 POST /leads received from: ${createLeadDto.email}`);
    return this.leadsService.create(createLeadDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async export(@Res() res: Response, @CurrentUser() user: any) {
    const csv = await this.leadsService.exportLeads(user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.status(200).send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filterDto: LeadFilterDto, @CurrentUser() user: any) {
    return this.leadsService.findAll(filterDto, user);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.leadsService.getStats(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete-requests')
  getDeleteRequests() {
    return this.leadsService.getDeleteRequests();
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-requests/:id/approve')
  approveDeleteRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.approveDeleteRequest(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.update(id, updateLeadDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() addNoteDto: AddNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.addNote(id, addNoteDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/delete-request')
  requestDelete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.requestDeleteLead(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.requestDeleteLead(id, user);
  }
}
