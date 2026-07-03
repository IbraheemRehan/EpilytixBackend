import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { Subscriber, SubscriberSchema } from './schemas/subscriber.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subscriber.name, schema: SubscriberSchema }]),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
