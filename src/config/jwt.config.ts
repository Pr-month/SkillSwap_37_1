import { registerAs, ConfigType } from '@nestjs/config';

export const jwtConfig = registerAs('JWT_CONFIG', () => {
  return {
    secret: process.env.JWT_SECRET ?? 'default-secret-change-me',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  };
});

export type TJwtConfig = ConfigType<typeof jwtConfig>;
