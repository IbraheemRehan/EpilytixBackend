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
exports.UserSchema = exports.User = exports.UserPermissions = exports.UserRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var UserRole;
(function (UserRole) {
    UserRole["CEO"] = "CEO";
    UserRole["FOUNDER"] = "FOUNDER";
})(UserRole || (exports.UserRole = UserRole = {}));
let UserPermissions = class UserPermissions {
    canManageLeads;
    canViewAllLeads;
    canManageContent;
    canChat;
};
exports.UserPermissions = UserPermissions;
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserPermissions.prototype, "canManageLeads", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserPermissions.prototype, "canViewAllLeads", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserPermissions.prototype, "canManageContent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], UserPermissions.prototype, "canChat", void 0);
exports.UserPermissions = UserPermissions = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserPermissions);
let User = class User {
    _id;
    email;
    passwordHash;
    role;
    firstName;
    lastName;
    avatar;
    phone;
    companyRole;
    permissions;
    twoFactorSecret;
    twoFactorEnabled;
    refreshTokenHash;
    fcmTokens;
    deviceBindings;
    isActive;
    lastLoginAt;
    lastSeenAnnouncementsAt;
    lastSeenLeadsAt;
    lastSeenTasksAt;
    resetPasswordOtp;
    resetPasswordOtpExpires;
    deleteLeadOtp;
    deleteLeadOtpExpires;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: UserRole, default: UserRole.FOUNDER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: 'Co-founder' }),
    __metadata("design:type", String)
], User.prototype, "companyRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: UserPermissions, default: () => ({}) }),
    __metadata("design:type", UserPermissions)
], User.prototype, "permissions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "fcmTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "deviceBindings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], User.prototype, "lastSeenAnnouncementsAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], User.prototype, "lastSeenLeadsAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], User.prototype, "lastSeenTasksAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "resetPasswordOtp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordOtpExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "deleteLeadOtp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "deleteLeadOtpExpires", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'users' })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ role: 1, isActive: 1 });
exports.UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshTokenHash;
        delete ret.twoFactorSecret;
        delete ret.resetPasswordOtp;
        delete ret.resetPasswordOtpExpires;
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=user.schema.js.map