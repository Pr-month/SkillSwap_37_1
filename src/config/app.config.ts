import { registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT ?? 3000),
}));

export type AppConfig = ConfigType<typeof appConfig>;
