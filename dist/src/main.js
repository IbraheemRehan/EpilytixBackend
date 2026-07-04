"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression = require('compression');
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = require("ioredis");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const app_1 = require("firebase-admin/app");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    adapterConstructor;
    async connectToRedis(configService) {
        const upstashUrl = configService.get('redis.url');
        const upstashToken = configService.get('redis.token');
        let pubClient;
        if (upstashUrl && upstashToken) {
            try {
                const urlObj = new URL(upstashUrl);
                const host = urlObj.hostname;
                const port = Number(urlObj.port) || 6379;
                pubClient = new ioredis_1.Redis({ host, port, password: upstashToken, tls: {}, maxRetriesPerRequest: null });
                console.log('✅ Using Upstash Redis (TLS)');
            }
            catch (e) {
                console.error('⚠️ Failed to parse Upstash URL, falling back to standard config', e);
                const host = configService.get('redis.host');
                const port = configService.get('redis.port');
                const password = configService.get('redis.password');
                pubClient = new ioredis_1.Redis({ host, port, password, maxRetriesPerRequest: null });
            }
        }
        else {
            const host = configService.get('redis.host');
            const port = configService.get('redis.port');
            const password = configService.get('redis.password');
            pubClient = new ioredis_1.Redis({ host, port, password, maxRetriesPerRequest: null });
        }
        pubClient.on('error', (err) => {
            console.error('Redis PubClient error:', err);
        });
        const subClient = pubClient.duplicate();
        subClient.on('error', (err) => {
            console.error('Redis SubClient error:', err);
        });
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const reflector = app.get(core_1.Reflector);
    if (!(0, app_1.getApps)().length) {
        const projectId = configService.get('app.firebase.projectId');
        const clientEmail = configService.get('app.firebase.clientEmail');
        const privateKey = configService.get('app.firebase.privateKey');
        if (projectId && clientEmail && privateKey) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({ projectId, clientEmail, privateKey }),
            });
            console.log('🔥 Firebase Admin globally initialized');
        }
    }
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.use((0, cookie_parser_1.default)());
    const corsOrigins = configService.get('app.corsOrigins') || [];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || corsOrigins.includes(origin) || configService.get('app.nodeEnv') === 'development') {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    const prefix = configService.get('app.apiPrefix') || 'api/v1';
    app.setGlobalPrefix(prefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis(configService);
    app.useWebSocketAdapter(redisIoAdapter);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Epilytix Enterprise API')
        .setDescription('The API for Epilytix CRM, Chat, and Content Management')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${prefix}/docs`, app, document);
    const port = configService.get('app.port') || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Epilytix Enterprise Server running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map