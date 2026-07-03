import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      // Verify standard JWT using access secret
      const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-epilytix-2024';
      const decoded: any = jwt.verify(token, secret);
      
      // Fetch user from DB to verify status
      const user = await this.userModel.findById(decoded.sub).select('isActive');
      if (!user) {
        throw new UnauthorizedException('User account has been deleted');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Your account is deactivated');
      }

      request.user = {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'FOUNDER',
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
