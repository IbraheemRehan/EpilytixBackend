import { Controller, Post, Body, Get, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  subscribe(@Body() subscribeDto: SubscribeDto) {
    return this.newsletterService.subscribe(subscribeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportCsv(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.newsletterService.exportCsv(startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    return res.status(200).send(csv);
  }
}
