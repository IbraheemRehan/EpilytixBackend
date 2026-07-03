import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(data: Partial<AuditLog>) {
    try {
      await this.auditLogModel.create(data);
    } catch (error) {
      // We don't want audit log failures to break the main application flow
      console.error('Failed to write audit log:', error);
    }
  }

  async getLogs(
    filters: any = {},
    options: { limit?: number; skip?: number } = {},
  ) {
    const { limit = 50, skip = 0 } = options;
    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(filters)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName role')
        .exec(),
      this.auditLogModel.countDocuments(filters),
    ]);

    return { items, total };
  }
}
