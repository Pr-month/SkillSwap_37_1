import { registerAs, ConfigType } from '@nestjs/config';
import { StringValue } from 'ms';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  secret: process.env.JWT_SECRET ?? 'default-secret-change-me',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN ?? ('15m' as StringValue),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? ('7d' as StringValue),
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
