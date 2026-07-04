import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
const compression = require('compression');
import cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Custom Redis IoAdapter
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(configService: ConfigService): Promise<void> {
    const upstashUrl = configService.get<string>('redis.url');
    const upstashToken = configService.get<string>('redis.token');
    let pubClient: Redis;
    if (upstashUrl && upstashToken) {
      try {
        const urlObj = new URL(upstashUrl);
        const host = urlObj.hostname;
        const port = Number(urlObj.port) || 6379;
        // Using TLS (rediss) as Upstash requires secure connections
        pubClient = new Redis({ host, port, password: upstashToken, tls: {} , maxRetriesPerRequest: null});
        console.log('✅ Using Upstash Redis (TLS)');
      } catch (e) {
        console.error('⚠️ Failed to parse Upstash URL, falling back to standard config', e);
        const host = configService.get<string>('redis.host');
        const port = configService.get<number>('redis.port');
        const password = configService.get<string>('redis.password');
        pubClient = new Redis({ host, port, password, maxRetriesPerRequest: null });
      }
    } else {
      const host = configService.get<string>('redis.host');
      const port = configService.get<number>('redis.port');
      const password = configService.get<string>('redis.password');
      pubClient = new Redis({ host, port, password, maxRetriesPerRequest: null });
    }

    pubClient.on('error', (err) => {
      console.error('Redis PubClient error:', err);
    });
    const subClient = pubClient.duplicate();
    subClient.on('error', (err) => {
      console.error('Redis SubClient error:', err);
    });

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Initialize Firebase Admin globally
  if (!getApps().length) {
    const projectId = configService.get<string>('app.firebase.projectId');
    const clientEmail = configService.get<string>('app.firebase.clientEmail');
    const privateKey = configService.get<string>('app.firebase.privateKey');
    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      console.log('🔥 Firebase Admin globally initialized');
    }
  }

  // Security & Performance Middlewares
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  
  // CORS — allow all origins in development for mobile app access
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // API Prefix
  const prefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  app.setGlobalPrefix(prefix);

  // Global Pipes, Filters, Interceptors, Guards
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Notice we don't bind JwtAuthGuard globally here if we do it in modules or controllers,
  // but it's cleaner to bind it globally and use @Public()
  // Actually, we bound it in controllers in this architecture.

  // Redis Socket.io Adapter
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(configService);
  app.useWebSocketAdapter(redisIoAdapter);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Epilytix Enterprise API')
    .setDescription('The API for Epilytix CRM, Chat, and Content Management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  // Start Server
  const port = configService.get<number>('app.port') || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Epilytix Enterprise Server running on port ${port}`);
}
bootstrap();
