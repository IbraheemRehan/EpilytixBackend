import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserSchema } from '../src/users/schemas/user.schema';
import appConfig from '../src/config/app.config';
import databaseConfig from '../src/config/database.config';
import { getModelToken } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
class SeedModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const configService = app.get(ConfigService);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const email = configService.get<string>('app.ceo.email');
  const password = configService.get<string>('app.ceo.defaultPassword');
  const firstName = configService.get<string>('app.ceo.firstName');
  const lastName = configService.get<string>('app.ceo.lastName');

  const existingCeo = await userModel.findOne({ role: UserRole.CEO });

  if (existingCeo) {
    console.log(`CEO already exists with email: ${existingCeo.email}`);
  } else {
    const passwordHash = await bcrypt.hash(password || 'EpilytixCEO@2024!', 10);
    const ceo = new userModel({
      email,
      passwordHash,
      role: UserRole.CEO,
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
