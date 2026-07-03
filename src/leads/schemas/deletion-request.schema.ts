import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDeletionRequestDocument = LeadDeletionRequest & Document;

export enum DeletionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true, collection: 'lead_deletion_requests' })
export class LeadDeletionRequest {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ required: true })
  leadName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  approvals: Types.ObjectId[];

  @Prop({ required: true, type: Number })
  requiredVotes: number;

  @Prop({ required: true, enum: DeletionRequestStatus, default: DeletionRequestStatus.PENDING, index: true })
  status: DeletionRequestStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const LeadDeletionRequestSchema = SchemaFactory.createForClass(LeadDeletionRequest);

LeadDeletionRequestSchema.index({ leadId: 1, status: 1 });

LeadDeletionRequestSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
