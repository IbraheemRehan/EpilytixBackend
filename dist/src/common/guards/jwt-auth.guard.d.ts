import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';
export declare class JwtAuthGuard {
    private reflector;
    private userModel;
    constructor(reflector: Reflector, userModel: Model<UserDocument>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
