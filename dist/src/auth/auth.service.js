"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const { authenticator } = require('otplib');
const nodemailer = __importStar(require("nodemailer"));
const user_schema_1 = require("../users/schemas/user.schema");
const audit_service_1 = require("../audit-logs/audit.service");
let AuthService = AuthService_1 = class AuthService {
    userModel;
    jwtService;
    configService;
    auditLogService;
    logger = new common_1.Logger(AuthService_1.name);
    transporter;
    otpStore = new Map();
    constructor(userModel, jwtService, configService, auditLogService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogService = auditLogService;
        const smtp = this.configService.get('app.smtp');
        if (smtp?.user && smtp?.pass) {
            this.transporter = nodemailer.createTransport({
                host: smtp.host,
                port: smtp.port,
                secure: smtp.port === 465,
                auth: { user: smtp.user, pass: smtp.pass },
            });
        }
    }
    async login(email, password, ip, userAgent) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Your account has been deactivated. Please contact the CEO.');
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
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
    async verify2fa(tempToken, otp, ip, userAgent) {
        let payload;
        try {
            payload = this.jwtService.verify(tempToken, {
                secret: this.configService.get('jwt.accessSecret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired temporary token');
        }
        if (payload.type !== 'temp') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const storedOtp = this.otpStore.get(payload.sub);
        if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        this.otpStore.delete(payload.sub);
        const user = await this.userModel.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        if (user.twoFactorSecret) {
            const isValid = authenticator.verify({
                token: otp,
                secret: user.twoFactorSecret,
            });
            if (!isValid && storedOtp.otp !== otp) {
                throw new common_1.BadRequestException('Invalid OTP');
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
    async refreshToken(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const user = await this.userModel.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        if (user.refreshTokenHash) {
            const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
            if (!isValid) {
                await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash: null });
                throw new common_1.UnauthorizedException('Token reuse detected');
            }
        }
        const tokens = await this.generateTokens(user);
        return tokens;
    }
    async logout(userId) {
        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
        await this.auditLogService.log({
            userId: userId,
            action: 'LOGOUT',
            resource: 'auth',
        });
        return { message: 'Logged out successfully' };
    }
    async setupTotp(userId) {
        const secret = authenticator.generateSecret();
        const appName = this.configService.get('app.twoFactor.appName');
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);
        await this.userModel.findByIdAndUpdate(userId, { twoFactorSecret: secret });
        return { secret, otpAuthUrl };
    }
    async enableTotp(userId, token) {
        const user = await this.userModel.findById(userId);
        if (!user || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('TOTP not set up');
        }
        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid TOTP code');
        }
        await this.userModel.findByIdAndUpdate(userId, { twoFactorEnabled: true });
        await this.auditLogService.log({
            userId: user._id,
            action: 'TOTP_ENABLED',
            resource: 'auth',
        });
        return { message: 'Two-factor authentication enabled' };
    }
    async forgotPassword(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase(), isActive: true });
        if (!user) {
            return { message: 'If an account with that email exists, a password reset OTP has been sent.' };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        const hashedOtp = await bcrypt.hash(otp, 10);
        await this.userModel.findByIdAndUpdate(user._id, {
            resetPasswordOtp: hashedOtp,
            resetPasswordOtpExpires: expires,
        });
        this.logger.log(`[DEV] Reset Password OTP for ${user.email}: ${otp}`);
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: `"Epilytix Security" <${this.configService.get('app.smtp.user')}>`,
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
            }
            catch (error) {
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
    async resetPassword(email, otp, newPassword) {
        const user = await this.userModel.findOne({ email: email.toLowerCase(), isActive: true });
        if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        if (user.resetPasswordOtpExpires < new Date()) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        const isValid = await bcrypt.compare(otp, user.resetPasswordOtp);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
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
    async generateTempToken(user) {
        return this.jwtService.sign({ sub: user._id.toString(), email: user.email, type: 'temp' }, {
            secret: this.configService.get('jwt.accessSecret'),
            expiresIn: '10m',
        });
    }
    async generateTokens(user) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign({ ...payload, type: 'access' }, {
            secret: this.configService.get('jwt.accessSecret'),
            expiresIn: this.configService.get('jwt.accessExpiry'),
        });
        const refreshToken = this.jwtService.sign({ ...payload, type: 'refresh' }, {
            secret: this.configService.get('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExpiry'),
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash });
        return { accessToken, refreshToken };
    }
    async sendOtp(user) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expirySeconds = this.configService.get('app.twoFactor.otpExpirySeconds') || 300;
        this.otpStore.set(user._id.toString(), {
            otp,
            userId: user._id.toString(),
            expiresAt: Date.now() + expirySeconds * 1000,
        });
        this.logger.log(`[DEV] OTP for ${user.email}: ${otp}`);
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: `"Epilytix Security" <${this.configService.get('app.smtp.user')}>`,
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
            }
            catch (error) {
                this.logger.warn(`Failed to send OTP email: ${error.message}`);
            }
        }
    }
    async updateLoginTimestamp(userId) {
        await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map