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
exports.NotificationSchema = exports.Notification = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var NotificationType;
(function (NotificationType) {
    NotificationType["NEW_LEAD"] = "NEW_LEAD";
    NotificationType["LEAD_ASSIGNED"] = "LEAD_ASSIGNED";
    NotificationType["LEAD_STATUS_CHANGED"] = "LEAD_STATUS_CHANGED";
    NotificationType["NEW_MESSAGE"] = "NEW_MESSAGE";
    NotificationType["FOUNDER_INVITED"] = "FOUNDER_INVITED";
    NotificationType["SYSTEM_ALERT"] = "SYSTEM_ALERT";
    NotificationType["TASK_ASSIGNED"] = "TASK_ASSIGNED";
    NotificationType["DELETION_REQUEST"] = "DELETION_REQUEST";
    NotificationType["DELETION_APPROVED"] = "DELETION_APPROVED";
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
    _id;
    recipientId;
    type;
    title;
    body;
    resourceId;
    resourceType;
    isRead;
    readAt;
    createdAt;
    updatedAt;
};
exports.Notification = Notification;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Notification.prototype, "recipientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: NotificationType }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "body", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "resourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'notifications' })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
exports.NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
exports.NotificationSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=notification.schema.js.map