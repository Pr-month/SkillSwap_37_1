import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { PassportModule } from '@nestjs/passport';
import { yandexConfig } from 'src/config/yandex-oauth.config';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { YandexStrategy } from 'src/auth/strategies/yandex.strategy';

@Module({
  imports: [UsersModule, PassportModule.register({ defaultStrategy: 'jwt' }), ConfigModule.forRoot({
    isGlobal: true,
    load: [yandexConfig]
  })],
  controllers: [AuthController],
  providers: [AuthService, YandexStrategy, JwtStrategy, RefreshStrategy],
  exports: [JwtStrategy, RefreshStrategy, PassportModule, AuthService],
})
export class AuthModule {}
