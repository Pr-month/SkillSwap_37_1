import { registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT ?? 3000),
  hashSalt: Number(process.env.HASH_SALT ?? 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

export type AppConfig = ConfigType<typeof appConfig>;
