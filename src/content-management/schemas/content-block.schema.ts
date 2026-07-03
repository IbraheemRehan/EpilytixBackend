import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ContentBlockDocument = ContentBlock & Document;

@Schema({ timestamps: true, collection: 'content_blocks' })
export class ContentBlock {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  section: string;

  @Prop({ required: true })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;

  @Prop({ default: true })
  isVisible: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: 1 })
  version: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ContentBlockSchema = SchemaFactory.createForClass(ContentBlock);

ContentBlockSchema.index({ section: 1, key: 1 }, { unique: true });

ContentBlockSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
