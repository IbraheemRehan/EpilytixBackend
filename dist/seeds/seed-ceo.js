"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../src/users/schemas/user.schema");
const app_config_1 = __importDefault(require("../src/config/app.config"));
const database_config_1 = __importDefault(require("../src/config/database.config"));
const mongoose_2 = require("@nestjs/mongoose");
let SeedModule = class SeedModule {
};
SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default],
                envFilePath: ['.env'],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('database.uri'),
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
        ],
    })
], SeedModule);
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(SeedModule);
    const configService = app.get(config_1.ConfigService);
    const userModel = app.get((0, mongoose_2.getModelToken)(user_schema_1.User.name));
    const email = configService.get('app.ceo.email');
    const password = configService.get('app.ceo.defaultPassword');
    const firstName = configService.get('app.ceo.firstName');
    const lastName = configService.get('app.ceo.lastName');
    const existingCeo = await userModel.findOne({ role: user_schema_1.UserRole.CEO });
    if (existingCeo) {
        console.log(`CEO already exists with email: ${existingCeo.email}`);
    }
    else {
        const passwordHash = await bcrypt.hash(password || 'EpilytixCEO@2024!', 10);
        const ceo = new userModel({
            email,
            passwordHash,
            role: user_schema_1.UserRole.CEO,
            firstName,
            lastName,
            permissions: {
                canManageLeads: true,
                canViewAllLeads: true,
                canManageContent: true,
                canChat: true,
            },
        });
        await ceo.save();
        console.log(`CEO created successfully with email: ${email}`);
        console.log(`Default password: ${password}`);
        console.log('Please login and enable 2FA immediately.');
    }
    await app.close();
    process.exit(0);
}
bootstrap();
//# sourceMappingURL=seed-ceo.js.map