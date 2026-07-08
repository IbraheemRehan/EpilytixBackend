import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  NEW_LEAD = 'NEW_LEAD',
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  LEAD_STATUS_CHANGED = 'LEAD_STATUS_CHANGED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  FOUNDER_INVITED = 'FOUNDER_INVITED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  DELETION_REQUEST = 'DELETION_REQUEST',
  DELETION_APPROVED = 'DELETION_APPROVED',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  resourceId?: string;

  @Prop()
  resourceType?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

NotificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
