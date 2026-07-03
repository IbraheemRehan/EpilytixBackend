import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';
import { ToggleSectionDto } from './dto/toggle-section.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get()
  getAllVisibleContent() {
    return this.contentService.getAllContent(false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAllContentIncludingHidden(@CurrentUser() user: any) {
    // Allows mobile app to see all content, even hidden sections
    return this.contentService.getAllContent(true);
  }

  @Public()
  @Get(':section')
  getSectionContent(@Param('section') section: string) {
    return this.contentService.getSection(section, false);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':section')
  updateContent(
    @Param('section') section: string,
    @Body() updateContentDto: UpdateContentDto,
    @CurrentUser() user: any,
  ) {
    return this.contentService.updateContent(section, updateContentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':section/toggle')
  toggleSection(
    @Param('section') section: string,
    @Body() toggleDto: ToggleSectionDto,
    @CurrentUser() user: any,
  ) {
    return this.contentService.toggleSection(section, toggleDto, user);
  }
}
