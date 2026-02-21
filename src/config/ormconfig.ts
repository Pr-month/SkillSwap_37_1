import 'dotenv/config';
import { registerAs, ConfigType } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs(
  'DB_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'skillswap',

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],

    synchronize: (process.env.TYPEORM_SYNCHRONIZE ?? 'true') === 'true',
    logging: (process.env.TYPEORM_LOGGING ?? 'false') === 'true',
  }),
);

export type DbConfig = ConfigType<typeof dbConfig>;

export const AppDataSource = new DataSource(dbConfig());
