import { registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT ?? 3000),

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'skillswap',
  },

  typeorm: {
    synchronize: (process.env.TYPEORM_SYNCHRONIZE ?? 'true') === 'true',
    logging: (process.env.TYPEORM_LOGGING ?? 'false') === 'true',
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
