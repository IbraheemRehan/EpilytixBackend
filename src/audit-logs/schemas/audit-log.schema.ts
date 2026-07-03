import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: false, collection: 'audit_logs' })
export class AuditLog {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop()
  resourceId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  details?: any;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: () => new Date() })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Compound index for querying by user + time
AuditLogSchema.index({ userId: 1, timestamp: -1 });
// TTL index: auto-delete after 90 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

AuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
