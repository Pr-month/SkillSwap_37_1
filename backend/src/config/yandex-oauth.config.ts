import { registerAs, ConfigType } from '@nestjs/config';

export const yandexConfig = registerAs('YANDEX_CONFIG', () => ({
  clientID: process.env.CLIENT_ID || 'client_id',
  clientSecret: process.env.CLIENT_SECRET || 'secret',
  callbackURL: process.env.CALLBACK_URL || 'callback_url'
}))

export type YandexConfig = ConfigType<typeof yandexConfig>
