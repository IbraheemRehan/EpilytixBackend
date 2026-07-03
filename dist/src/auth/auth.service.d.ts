import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';
export declare class AuthService {
    private userModel;
    private jwtService;
    private configService;
    private auditLogService;
    private readonly logger;
    private transporter;
    private otpStore;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService, auditLogService: AuditLogService);
    login(email: string, password: string, ip?: string, userAgent?: string): Promise<{
        requiresTwoFactor: boolean;
        tempToken: string;
        message: string;
    } | {
        user: User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        accessToken: string;
        refreshToken: string;
        requiresTwoFactor: boolean;
        tempToken?: undefined;
        message?: undefined;
    }>;
    verify2fa(tempToken: string, otp: string, ip?: string, userAgent?: string): Promise<{
        user: User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    setupTotp(userId: string): Promise<{
        secret: any;
        otpAuthUrl: any;
    }>;
    enableTotp(userId: string, token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateTempToken;
    private generateTokens;
    private sendOtp;
    private updateLoginTimestamp;
}
