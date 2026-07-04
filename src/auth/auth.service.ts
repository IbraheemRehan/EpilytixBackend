import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
const { authenticator } = require('otplib');
import { Resend } from 'resend';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-logs/audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private resend: Resend;
  // In-memory OTP store for dev; production should use Redis
  private otpStore = new Map<string, { otp: string; userId: string; expiresAt: number }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {
    const resendApiKey = this.configService.get('app.resend.apiKey');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact the CEO.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.auditLogService.log({
        userId: user._id,
        action: 'LOGIN_FAILED',
        resource: 'auth',
        details: { reason: 'invalid_password' },
        ipAddress: ip,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Only require 2FA if the user has explicitly enabled it
    if (user.twoFactorEnabled) {
      const tempToken = await this.generateTempToken(user);
      await this.sendOtp(user);

      await this.auditLogService.log({
        userId: user._id,
        action: 'LOGIN_2FA_REQUIRED',
        resource: 'auth',
        ipAddress: ip,
        userAgent,
      });

      return {
        requiresTwoFactor: true,
        tempToken,
        message: 'OTP sent to your email address',
      };
    }

    // Direct login for founders without 2FA
    const tokens = await this.generateTokens(user);
    await this.updateLoginTimestamp(user._id);

    await this.auditLogService.log({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      ipAddress: ip,
      userAgent,
    });

    return {
      requiresTwoFactor: false,
      ...tokens,
      user: user.toJSON(),
    };
  }

  async verify2fa(tempToken: string, otp: string, ip?: string, userAgent?: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    if (payload.type !== 'temp') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Verify OTP
    const storedOtp = this.otpStore.get(payload.sub);
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clear used OTP
    this.otpStore.delete(payload.sub);

    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check TOTP if user has authenticator set up
    if (user.twoFactorSecret) {
      const isValid = authenticator.verify({
        token: otp,
        secret: user.twoFactorSecret,
      });
      if (!isValid && storedOtp.otp !== otp) {
        throw new BadRequestException('Invalid OTP');
      }
    }

    const tokens = await this.generateTokens(user);
    await this.updateLoginTimestamp(user._id);

    await this.auditLogService.log({
      userId: user._id,
      action: 'LOGIN_2FA_SUCCESS',
      resource: 'auth',
      ipAddress: ip,
      userAgent,
    });

    return {
      ...tokens,
      user: user.toJSON(),
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Verify the refresh token hash matches
    if (user.refreshTokenHash) {
      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        // Potential token reuse attack — invalidate all tokens
        await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash: null });
        throw new UnauthorizedException('Token reuse detected');
      }
    }

    // Generate new tokens (rotate refresh token)
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });

    await this.auditLogService.log({
      userId: userId as any,
      action: 'LOGOUT',
      resource: 'auth',
    });

    return { message: 'Logged out successfully' };
  }

  async setupTotp(userId: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('app.twoFactor.appName');
    const user = await this.userModel.findById(userId);

    if (!user) throw new BadRequestException('User not found');

    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);

    // Store secret (not yet enabled)
    await this.userModel.findByIdAndUpdate(userId, { twoFactorSecret: secret });

    return { secret, otpAuthUrl };
  }

  async enableTotp(userId: string, token: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('TOTP not set up');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    await this.userModel.findByIdAndUpdate(userId, { twoFactorEnabled: true });

    await this.auditLogService.log({
      userId: user._id,
      action: 'TOTP_ENABLED',
      resource: 'auth',
    });

    return { message: 'Two-factor authentication enabled' };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      // Return a generic message even if user not found to prevent email enumeration
      return { message: 'If an account with that email exists, a password reset OTP has been sent.' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const hashedOtp = await bcrypt.hash(otp, 10);
    
    await this.userModel.findByIdAndUpdate(user._id, {
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpires: expires,
    });

    this.logger.log(`[DEV] Reset Password OTP for ${user.email}: ${otp}`);

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Epilytix Security <onboarding@resend.dev>',
          to: user.email,
          subject: 'Password Reset Request',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <h2 style="color: #fa0395; margin: 0 0 20px;">Reset Password</h2>
              <p style="color: #9ca3af; font-size: 14px;">You requested a password reset. Your OTP is:</p>
              <div style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 12px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (error) {
        this.logger.error(`Failed to send password reset OTP email: ${error.message}`);
      }
    }

    await this.auditLogService.log({
      userId: user._id,
      action: 'FORGOT_PASSWORD_REQUEST',
      resource: 'auth',
    });

    return { message: 'If an account with that email exists, a password reset OTP has been sent.' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase(), isActive: true });
    
    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    const isValid = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await this.userModel.findByIdAndUpdate(user._id, {
      passwordHash,
      $unset: { resetPasswordOtp: "", resetPasswordOtpExpires: "" }
    });

    await this.auditLogService.log({
      userId: user._id,
      action: 'RESET_PASSWORD_SUCCESS',
      resource: 'auth',
    });

    return { message: 'Password has been successfully reset' };
  }

  // ─── Private Helpers ──────────────────────────────────────────

  private async generateTempToken(user: UserDocument): Promise<string> {
    return this.jwtService.sign(
      { sub: user._id.toString(), email: user.email, type: 'temp' },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: '10m',
      },
    );
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiry') as any,
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiry') as any,
      },
    );

    // Store hashed refresh token for rotation validation
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  private async sendOtp(user: UserDocument) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirySeconds = this.configService.get<number>('app.twoFactor.otpExpirySeconds') || 300;

    this.otpStore.set(user._id.toString(), {
      otp,
      userId: user._id.toString(),
      expiresAt: Date.now() + expirySeconds * 1000,
    });

    this.logger.log(`[DEV] OTP for ${user.email}: ${otp}`);

    // Send email if transporter is configured
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Epilytix Security <onboarding@resend.dev>',
          to: user.email,
          subject: 'Your Epilytix Login Verification Code',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <h2 style="color: #fa0395; margin: 0 0 20px;">Epilytix Security</h2>
              <p style="color: #9ca3af; font-size: 14px;">Your one-time verification code is:</p>
              <div style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 12px;">This code expires in ${expirySeconds / 60} minutes. Do not share it with anyone.</p>
            </div>
          `,
        });
      } catch (error) {
        this.logger.warn(`Failed to send OTP email: ${error.message}`);
      }
    }
  }

  private async updateLoginTimestamp(userId: any) {
    await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }
}
