import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument, SubscriberStatus } from './schemas/subscriber.schema';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Subscriber.name) private subscriberModel: Model<SubscriberDocument>,
  ) {}

  async subscribe(subscribeDto: SubscribeDto) {
    const existing = await this.subscriberModel.findOne({ email: subscribeDto.email.toLowerCase() });
    if (existing) {
      if (existing.status === SubscriberStatus.UNSUBSCRIBED) {
        existing.status = SubscriberStatus.ACTIVE;
        await existing.save();
        return existing.toJSON();
      }
      throw new ConflictException('Email is already subscribed');
    }

    const subscriber = new this.subscriberModel({
      email: subscribeDto.email.toLowerCase(),
      status: SubscriberStatus.ACTIVE,
    });

    await subscriber.save();
    return subscriber.toJSON();
  }

  async findAll() {
    const items = await this.subscriberModel.find().sort({ createdAt: -1 }).exec();
    return {
      items: items.map((item) => item.toJSON()),
      total: items.length,
    };
  }

  async exportCsv(startDate?: string, endDate?: string): Promise<string> {
    const query: any = { status: SubscriberStatus.ACTIVE };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const items = await this.subscriberModel.find(query).sort({ createdAt: -1 }).exec();
    const headers = ['Email', 'Status', 'Subscribed At'];
    const rows = items.map(item => [
      item.email,
      item.status,
      item.createdAt.toISOString()
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }
}
