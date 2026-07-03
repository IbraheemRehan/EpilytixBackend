import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriberDocument = Subscriber & Document;

export enum SubscriberStatus {
  ACTIVE = 'ACTIVE',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

@Schema({ timestamps: true, collection: 'subscribers' })
export class Subscriber {
  _id: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true, unique: true })
  email: string;

  @Prop({ required: true, enum: SubscriberStatus, default: SubscriberStatus.ACTIVE })
  status: SubscriberStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);

SubscriberSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
