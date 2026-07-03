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
exports.LeadDeletionRequestSchema = exports.LeadDeletionRequest = exports.DeletionRequestStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var DeletionRequestStatus;
(function (DeletionRequestStatus) {
    DeletionRequestStatus["PENDING"] = "PENDING";
    DeletionRequestStatus["APPROVED"] = "APPROVED";
    DeletionRequestStatus["REJECTED"] = "REJECTED";
})(DeletionRequestStatus || (exports.DeletionRequestStatus = DeletionRequestStatus = {}));
let LeadDeletionRequest = class LeadDeletionRequest {
    _id;
    leadId;
    leadName;
    requestedBy;
    approvals;
    requiredVotes;
    status;
    createdAt;
    updatedAt;
};
exports.LeadDeletionRequest = LeadDeletionRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Lead', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeadDeletionRequest.prototype, "leadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LeadDeletionRequest.prototype, "leadName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeadDeletionRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], LeadDeletionRequest.prototype, "approvals", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], LeadDeletionRequest.prototype, "requiredVotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: DeletionRequestStatus, default: DeletionRequestStatus.PENDING, index: true }),
    __metadata("design:type", String)
], LeadDeletionRequest.prototype, "status", void 0);
exports.LeadDeletionRequest = LeadDeletionRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'lead_deletion_requests' })
], LeadDeletionRequest);
exports.LeadDeletionRequestSchema = mongoose_1.SchemaFactory.createForClass(LeadDeletionRequest);
exports.LeadDeletionRequestSchema.index({ leadId: 1, status: 1 });
exports.LeadDeletionRequestSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=deletion-request.schema.js.map