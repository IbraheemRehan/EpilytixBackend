import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('app.cloudinary.cloudName');
    const apiKey = this.configService.get('app.cloudinary.apiKey');
    const apiSecret = this.configService.get('app.cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.initialized = true;
      this.logger.log('Cloudinary initialized');
    } else {
      this.logger.warn('Cloudinary configuration missing. File uploads will not work.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!this.initialized) {
      this.logger.warn('Returning mock url since Cloudinary is not initialized.');
      return {
        url: `http://localhost:4000/mock-files/${file.originalname}`,
        key: file.originalname,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'epilytix',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Failed to upload file to Cloudinary', error);
            return reject(new InternalServerErrorException('File upload failed'));
          }
          resolve({
            url: result.secure_url,
            key: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
