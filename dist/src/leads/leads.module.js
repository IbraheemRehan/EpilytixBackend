"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const leads_service_1 = require("./leads.service");
const leads_controller_1 = require("./leads.controller");
const lead_schema_1 = require("./schemas/lead.schema");
const deletion_request_schema_1 = require("./schemas/deletion-request.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const audit_module_1 = require("../audit-logs/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
const newsletter_module_1 = require("../newsletter/newsletter.module");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: lead_schema_1.Lead.name, schema: lead_schema_1.LeadSchema },
                { name: deletion_request_schema_1.LeadDeletionRequest.name, schema: deletion_request_schema_1.LeadDeletionRequestSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            audit_module_1.AuditLogModule,
            notifications_module_1.NotificationsModule,
            newsletter_module_1.NewsletterModule,
        ],
        controllers: [leads_controller_1.LeadsController],
        providers: [leads_service_1.LeadsService],
        exports: [leads_service_1.LeadsService],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map