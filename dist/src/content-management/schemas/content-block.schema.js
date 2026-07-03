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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentBlockSchema = exports.ContentBlock = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ContentBlock = class ContentBlock {
    _id;
    section;
    key;
    value;
    isVisible;
    updatedBy;
    version;
    createdAt;
    updatedAt;
};
exports.ContentBlock = ContentBlock;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ContentBlock.prototype, "section", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContentBlock.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, required: true }),
    __metadata("design:type", Object)
], ContentBlock.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ContentBlock.prototype, "isVisible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ContentBlock.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], ContentBlock.prototype, "version", void 0);
exports.ContentBlock = ContentBlock = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'content_blocks' })
], ContentBlock);
exports.ContentBlockSchema = mongoose_1.SchemaFactory.createForClass(ContentBlock);
exports.ContentBlockSchema.index({ section: 1, key: 1 }, { unique: true });
exports.ContentBlockSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=content-block.schema.js.map