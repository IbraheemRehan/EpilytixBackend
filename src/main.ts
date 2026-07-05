import * as dotenv from 'dotenv';
dotenv.config(); // Ensure process.env is populated BEFORE anything else runs

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

// ---------------------------------------------------------------------------
// Initialize Firebase Admin globally — BEFORE Nest builds the module tree.
// This must run before NestFactory.create(AppModule), because that call
// instantiates every provider (including NotificationsService's constructor,
// which checks getApps().length synchronously). If Firebase is initialized
// after NestFactory.create(), that check always fails even with valid env vars.
// ---------------------------------------------------------------------------
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    console.log('🔥 Firebase Admin globally initialized');
  } else {
    console.warn(
      '⚠️ Firebase env vars missing at bootstrap — push notifications disabled',
    );
  }
}

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
        pubClient = new Redis({ host, port, password: upstashToken, tls: {}, maxRetriesPerRequest: null });
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

  // Security & Performance Middlewares
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // Secure CORS — allow configured origins, allow mobile apps (no origin header), and allow all in development
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || corsOrigins.includes(origin) || configService.get<string>('app.nodeEnv') === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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