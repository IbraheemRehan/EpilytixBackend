import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '60', 10),
  },
  loginThrottle: {
    ttl: parseInt(process.env.LOGIN_THROTTLE_TTL || '900000', 10),
    limit: parseInt(process.env.LOGIN_THROTTLE_LIMIT || '5', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  ceo: {
    email: process.env.CEO_EMAIL || 'ibrahimrehan1230@gmail.com',
    defaultPassword: process.env.CEO_DEFAULT_PASSWORD || 'EpilytixCEO@2024!',
    firstName: process.env.CEO_FIRST_NAME || 'Ibraheem',
    lastName: process.env.CEO_LAST_NAME || 'Rehan',
  },
  twoFactor: {
    appName: process.env.TWO_FACTOR_APP_NAME || 'Epilytix',
    otpExpirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10),
  },
}));
