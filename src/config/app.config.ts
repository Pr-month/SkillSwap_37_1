import { registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT ?? 10),
  hashSalt: Number(process.env.HASH_SALT ?? 10),
}));

export type AppConfig = ConfigType<typeof appConfig>;
