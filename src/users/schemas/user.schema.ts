import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CEO = 'CEO',
  FOUNDER = 'FOUNDER',
}

@Schema({ timestamps: true })
export class UserPermissions {
  @Prop({ default: false })
  canManageLeads: boolean;

  @Prop({ default: false })
  canViewAllLeads: boolean;

  @Prop({ default: false })
  canManageContent: boolean;

  @Prop({ default: true })
  canChat: boolean;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.FOUNDER })
  role: UserRole;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop()
  avatar?: string;

  @Prop()
  phone?: string;

  @Prop({ trim: true, default: 'Co-founder' })
  companyRole?: string;

  @Prop({ type: UserPermissions, default: () => ({}) })
  permissions: UserPermissions;

  @Prop()
  twoFactorSecret?: string;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  refreshTokenHash?: string;

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];

  @Prop({ type: [String], default: [] })
  deviceBindings: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isOnboarded: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: () => new Date() })
  lastSeenAnnouncementsAt: Date;

  @Prop({ default: () => new Date() })
  lastSeenLeadsAt: Date;

  @Prop({ default: () => new Date() })
  lastSeenTasksAt: Date;

  @Prop()
  resetPasswordOtp?: string;

  @Prop()
  resetPasswordOtpExpires?: Date;

  @Prop()
  deleteLeadOtp?: string;

  @Prop()
  deleteLeadOtpExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ role: 1, isActive: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.twoFactorSecret;
    delete ret.resetPasswordOtp;
    delete ret.resetPasswordOtpExpires;
    delete ret.__v;
    return ret;
  },
});
