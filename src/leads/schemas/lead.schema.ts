import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  FOLLOW_UP = 'FOLLOW_UP',
  IN_PROGRESS = 'IN_PROGRESS',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
  CLOSED = 'CLOSED',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Schema({ _id: false, timestamps: false })
export class LeadNote {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const LeadNoteSchema = SchemaFactory.createForClass(LeadNote);

@Schema({ _id: false, timestamps: false })
export class LeadHistory {
  @Prop({ required: true })
  action: string;

  @Prop()
  from?: string;

  @Prop()
  to?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy: Types.ObjectId;

  @Prop({ default: () => new Date() })
  timestamp: Date;
}

export const LeadHistorySchema = SchemaFactory.createForClass(LeadHistory);

@Schema({ timestamps: true, collection: 'leads' })
export class Lead {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  company?: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: 'website' })
  source: string;

  @Prop()
  sourcePage?: string;

  @Prop({ required: true, enum: LeadStatus, default: LeadStatus.NEW, index: true })
  status: LeadStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedTo?: Types.ObjectId;

  @Prop({ enum: LeadPriority, default: LeadPriority.MEDIUM })
  priority: LeadPriority;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Number, default: 0 })
  value: number;

  @Prop({ type: [LeadNoteSchema], default: [] })
  notes: LeadNote[];

  @Prop({ type: [LeadHistorySchema], default: [] })
  history: LeadHistory[];

  @Prop({ default: 1 })
  syncVersion: number;

  createdAt: Date;
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Compound indexes for efficient querying
LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ source: 1, status: 1 });

LeadSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
