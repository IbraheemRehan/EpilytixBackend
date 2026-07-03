"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let UploadService = UploadService_1 = class UploadService {
    configService;
    logger = new common_1.Logger(UploadService_1.name);
    initialized = false;
    constructor(configService) {
        this.configService = configService;
        const cloudName = this.configService.get('app.cloudinary.cloudName');
        const apiKey = this.configService.get('app.cloudinary.apiKey');
        const apiSecret = this.configService.get('app.cloudinary.apiSecret');
        if (cloudName && apiKey && apiSecret) {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.initialized = true;
            this.logger.log('Cloudinary initialized');
        }
        else {
            this.logger.warn('Cloudinary configuration missing. File uploads will not work.');
        }
    }
    async uploadFile(file) {
        if (!this.initialized) {
            this.logger.warn('Returning mock url since Cloudinary is not initialized.');
            return {
                url: `http://localhost:4000/mock-files/${file.originalname}`,
                key: file.originalname,
            };
        }
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'epilytix',
            }, (error, result) => {
                if (error) {
                    this.logger.error('Failed to upload file to Cloudinary', error);
                    return reject(new common_1.InternalServerErrorException('File upload failed'));
                }
                resolve({
                    url: result.secure_url,
                    key: result.public_id,
                });
            });
            uploadStream.end(file.buffer);
        });
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map