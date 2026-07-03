import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private readonly logger;
    private initialized;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
}
