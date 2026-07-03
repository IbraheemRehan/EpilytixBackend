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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const content_block_schema_1 = require("./schemas/content-block.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const audit_service_1 = require("../audit-logs/audit.service");
let ContentService = class ContentService {
    contentModel;
    auditLogService;
    constructor(contentModel, auditLogService) {
        this.contentModel = contentModel;
        this.auditLogService = auditLogService;
    }
    async getAllContent(includeHidden = false) {
        const query = includeHidden ? {} : { isVisible: true };
        const blocks = await this.contentModel.find(query).exec();
        const grouped = blocks.reduce((acc, block) => {
            if (!acc[block.section])
                acc[block.section] = {};
            acc[block.section][block.key] = block.value;
            acc[block.section]._isVisible = block.isVisible;
            return acc;
        }, {});
        return grouped;
    }
    async getSection(section, includeHidden = false) {
        const query = { section };
        if (!includeHidden)
            query.isVisible = true;
        const blocks = await this.contentModel.find(query).exec();
        if (blocks.length === 0)
            return null;
        const result = { _isVisible: blocks[0].isVisible };
        blocks.forEach(b => (result[b.key] = b.value));
        return result;
    }
    async updateContent(section, updateDto, user) {
        this.checkPermissions(user);
        const updated = await this.contentModel.findOneAndUpdate({ section, key: updateDto.key }, {
            $set: {
                value: updateDto.value,
                ...(updateDto.isVisible !== undefined ? { isVisible: updateDto.isVisible } : {}),
                updatedBy: new mongoose_2.Types.ObjectId(user.userId),
            },
            $inc: { version: 1 },
        }, { new: true, upsert: true });
        await this.auditLogService.log({
            userId: new mongoose_2.Types.ObjectId(user.userId),
            action: 'UPDATE_CONTENT',
            resource: 'content',
            details: { section, key: updateDto.key },
        });
        return updated;
    }
    async toggleSection(section, toggleDto, user) {
        this.checkPermissions(user);
        await this.contentModel.updateMany({ section }, { $set: { isVisible: toggleDto.isVisible, updatedBy: new mongoose_2.Types.ObjectId(user.userId) } });
        await this.auditLogService.log({
            userId: new mongoose_2.Types.ObjectId(user.userId),
            action: 'TOGGLE_CONTENT_SECTION',
            resource: 'content',
            details: { section, isVisible: toggleDto.isVisible },
        });
        return { message: `Section ${section} visibility set to ${toggleDto.isVisible}` };
    }
    checkPermissions(user) {
        if (user.role !== user_schema_1.UserRole.CEO && !user.permissions?.canManageContent) {
            throw new common_1.ForbiddenException('You do not have permission to manage content');
        }
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(content_block_schema_1.ContentBlock.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditLogService])
], ContentService);
//# sourceMappingURL=content.service.js.map