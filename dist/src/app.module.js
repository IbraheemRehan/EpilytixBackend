"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const leads_module_1 = require("./leads/leads.module");
const newsletter_module_1 = require("./newsletter/newsletter.module");
const content_module_1 = require("./content-management/content.module");
const audit_module_1 = require("./audit-logs/audit.module");
const notifications_module_1 = require("./notifications/notifications.module");
const sync_module_1 = require("./sync-engine/sync.module");
const upload_module_1 = require("./file-upload/upload.module");
const health_module_1 = require("./health/health.module");
const tasks_module_1 = require("./tasks/tasks.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, jwt_config_1.default, redis_config_1.default],
                envFilePath: ['.env'],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('database.uri'),
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('app.throttle.ttl') || 60000,
                        limit: config.get('app.throttle.limit') || 60,
                    },
                ],
            }),
            audit_module_1.AuditLogModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            leads_module_1.LeadsModule,
            content_module_1.ContentModule,
            newsletter_module_1.NewsletterModule,
            notifications_module_1.NotificationsModule,
            sync_module_1.SyncModule,
            upload_module_1.UploadModule,
            health_module_1.HealthModule,
            tasks_module_1.TasksModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map