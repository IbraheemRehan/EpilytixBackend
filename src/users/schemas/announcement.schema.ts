import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true, collection: 'announcements' })
export class Announcement {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  acknowledgedBy: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ createdAt: -1 });

AnnouncementSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
