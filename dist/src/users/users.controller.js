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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const create_founder_dto_1 = require("./dto/create-founder.dto");
const update_founder_dto_1 = require("./dto/update-founder.dto");
const update_permissions_dto_1 = require("./dto/update-permissions.dto");
const update_me_dto_1 = require("./dto/update-me.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_schema_1 = require("./schemas/user.schema");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getMyLogins(userId) {
        return this.usersService.getMyLogins(userId);
    }
    getUnseenCounts(userId) {
        return this.usersService.getUnseenCounts(userId);
    }
    updateMyProfile(userId, updateMeDto) {
        return this.usersService.updateMyProfile(userId, updateMeDto);
    }
    updateMyPassword(userId, oldPassword, newPassword) {
        return this.usersService.updateMyPassword(userId, oldPassword, newPassword);
    }
    createFounder(createFounderDto, callerId, callerRole) {
        return this.usersService.createFounder(createFounderDto, callerId, callerRole);
    }
    findAllFounders() {
        return this.usersService.findAllFounders();
    }
    findOne(id, callerId, callerRole) {
        return this.usersService.findOne(id, callerId, callerRole);
    }
    updateFounder(id, updateFounderDto, callerId, callerRole) {
        return this.usersService.updateFounder(id, updateFounderDto, callerId, callerRole);
    }
    updatePermissions(id, updatePermissionsDto, ceoId) {
        return this.usersService.updatePermissions(id, updatePermissionsDto, ceoId);
    }
    removeFounder(id, callerId, callerRole) {
        return this.usersService.deleteFounder(id, callerId, callerRole);
    }
    createAnnouncement(title, content, user) {
        return this.usersService.createAnnouncement(title, content, user);
    }
    getAnnouncements(userId) {
        return this.usersService.getAnnouncements(userId);
    }
    acknowledgeAnnouncement(id, userId) {
        return this.usersService.acknowledgeAnnouncement(id, userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me/logins'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyLogins", null);
__decorate([
    (0, common_1.Get)('me/unseen-counts'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUnseenCounts", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_me_dto_1.UpdateMeDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)('oldPassword')),
    __param(2, (0, common_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyPassword", null);
__decorate([
    (0, common_1.Post)('founders'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_founder_dto_1.CreateFounderDto, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createFounder", null);
__decorate([
    (0, common_1.Get)('founders'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAllFounders", null);
__decorate([
    (0, common_1.Get)('founders/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('founders/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_founder_dto_1.UpdateFounderDto, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateFounder", null);
__decorate([
    (0, common_1.Patch)('founders/:id/permissions'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_permissions_dto_1.UpdatePermissionsDto, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Delete)('founders/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CEO, user_schema_1.UserRole.FOUNDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeFounder", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Body)('title')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('announcements/:id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "acknowledgeAnnouncement", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map