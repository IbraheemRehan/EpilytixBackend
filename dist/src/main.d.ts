import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
export declare class RedisIoAdapter extends IoAdapter {
    private adapterConstructor;
    connectToRedis(configService: ConfigService): Promise<void>;
    createIOServer(port: number, options?: any): any;
}
