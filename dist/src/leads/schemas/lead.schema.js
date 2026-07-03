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
exports.LeadSchema = exports.Lead = exports.LeadHistorySchema = exports.LeadHistory = exports.LeadNoteSchema = exports.LeadNote = exports.LeadPriority = exports.LeadStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["FOLLOW_UP"] = "FOLLOW_UP";
    LeadStatus["IN_PROGRESS"] = "IN_PROGRESS";
    LeadStatus["QUALIFIED"] = "QUALIFIED";
    LeadStatus["CONVERTED"] = "CONVERTED";
    LeadStatus["LOST"] = "LOST";
    LeadStatus["CLOSED"] = "CLOSED";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var LeadPriority;
(function (LeadPriority) {
    LeadPriority["LOW"] = "LOW";
    LeadPriority["MEDIUM"] = "MEDIUM";
    LeadPriority["HIGH"] = "HIGH";
    LeadPriority["URGENT"] = "URGENT";
})(LeadPriority || (exports.LeadPriority = LeadPriority = {}));
let LeadNote = class LeadNote {
    _id;
    content;
    author;
    createdAt;
};
exports.LeadNote = LeadNote;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, default: () => new mongoose_2.Types.ObjectId() }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeadNote.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LeadNote.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeadNote.prototype, "author", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], LeadNote.prototype, "createdAt", void 0);
exports.LeadNote = LeadNote = __decorate([
    (0, mongoose_1.Schema)({ _id: false, timestamps: false })
], LeadNote);
exports.LeadNoteSchema = mongoose_1.SchemaFactory.createForClass(LeadNote);
let LeadHistory = class LeadHistory {
    action;
    from;
    to;
    performedBy;
    timestamp;
};
exports.LeadHistory = LeadHistory;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LeadHistory.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LeadHistory.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LeadHistory.prototype, "to", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeadHistory.prototype, "performedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], LeadHistory.prototype, "timestamp", void 0);
exports.LeadHistory = LeadHistory = __decorate([
    (0, mongoose_1.Schema)({ _id: false, timestamps: false })
], LeadHistory);
exports.LeadHistorySchema = mongoose_1.SchemaFactory.createForClass(LeadHistory);
let Lead = class Lead {
    _id;
    name;
    email;
    phone;
    company;
    message;
    source;
    sourcePage;
    status;
    assignedTo;
    priority;
    tags;
    value;
    notes;
    history;
    syncVersion;
    createdAt;
    updatedAt;
};
exports.Lead = Lead;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Lead.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true, index: true }),
    __metadata("design:type", String)
], Lead.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Lead.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Lead.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Lead.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'website' }),
    __metadata("design:type", String)
], Lead.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Lead.prototype, "sourcePage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: LeadStatus, default: LeadStatus.NEW, index: true }),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: LeadPriority, default: LeadPriority.MEDIUM }),
    __metadata("design:type", String)
], Lead.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Lead.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.LeadNoteSchema], default: [] }),
    __metadata("design:type", Array)
], Lead.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.LeadHistorySchema], default: [] }),
    __metadata("design:type", Array)
], Lead.prototype, "history", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Lead.prototype, "syncVersion", void 0);
exports.Lead = Lead = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'leads' })
], Lead);
exports.LeadSchema = mongoose_1.SchemaFactory.createForClass(Lead);
exports.LeadSchema.index({ status: 1, assignedTo: 1 });
exports.LeadSchema.index({ createdAt: -1 });
exports.LeadSchema.index({ source: 1, status: 1 });
exports.LeadSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=lead.schema.js.map