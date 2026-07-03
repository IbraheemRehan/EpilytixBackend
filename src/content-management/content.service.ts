import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContentBlock, ContentBlockDocument } from './schemas/content-block.schema';
import { UpdateContentDto } from './dto/update-content.dto';
import { ToggleSectionDto } from './dto/toggle-section.dto';
import { UserRole } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(ContentBlock.name) private contentModel: Model<ContentBlockDocument>,
    private auditLogService: AuditLogService,
  ) {}

  async getAllContent(includeHidden = false) {
    const query = includeHidden ? {} : { isVisible: true };
    const blocks = await this.contentModel.find(query).exec();

    // Group by section for easier frontend consumption
    const grouped = blocks.reduce<Record<string, any>>((acc, block) => {
      if (!acc[block.section]) acc[block.section] = {};
      acc[block.section][block.key] = block.value;
      acc[block.section]._isVisible = block.isVisible;
      return acc;
    }, {});

    return grouped;
  }

  async getSection(section: string, includeHidden = false) {
    const query: any = { section };
    if (!includeHidden) query.isVisible = true;

    const blocks = await this.contentModel.find(query).exec();
    if (blocks.length === 0) return null;

    const result: any = { _isVisible: blocks[0].isVisible };
    blocks.forEach(b => (result[b.key] = b.value));
    return result;
  }

  async updateContent(section: string, updateDto: UpdateContentDto, user: any) {
    this.checkPermissions(user);

    const updated = await this.contentModel.findOneAndUpdate(
      { section, key: updateDto.key },
      {
        $set: {
          value: updateDto.value,
          ...(updateDto.isVisible !== undefined ? { isVisible: updateDto.isVisible } : {}),
          updatedBy: new Types.ObjectId(user.userId),
        },
        $inc: { version: 1 },
      },
      { new: true, upsert: true }
    );

    await this.auditLogService.log({
      userId: new Types.ObjectId(user.userId),
      action: 'UPDATE_CONTENT',
      resource: 'content',
      details: { section, key: updateDto.key },
    });

    return updated;
  }

  async toggleSection(section: string, toggleDto: ToggleSectionDto, user: any) {
    this.checkPermissions(user);

    await this.contentModel.updateMany(
      { section },
      { $set: { isVisible: toggleDto.isVisible, updatedBy: new Types.ObjectId(user.userId) } }
    );

    await this.auditLogService.log({
      userId: new Types.ObjectId(user.userId),
      action: 'TOGGLE_CONTENT_SECTION',
      resource: 'content',
      details: { section, isVisible: toggleDto.isVisible },
    });

    return { message: `Section ${section} visibility set to ${toggleDto.isVisible}` };
  }

  private checkPermissions(user: any) {
    if (user.role !== UserRole.CEO && !user.permissions?.canManageContent) {
      throw new ForbiddenException('You do not have permission to manage content');
    }
  }
}
