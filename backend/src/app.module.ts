import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from './config/app.config';
import { jwtConfig, TJwtConfig } from './config/jwt.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { dbConfig, DbConfig } from './config/ormconfig';
import { StringValue } from 'ms';
import { SkillsModule } from './skills/skills.module';
import { FilesModule } from './files/files.module';
import { RequestsModule } from './requests/requests.module';
import { CategoriesModule } from './categories/categories.module';
import { NotificationModule } from './notification/notification.module';
import { yandexConfig } from 'src/config/yandex-oauth.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, dbConfig, yandexConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: DbConfig) => ({ ...db }),
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfig: TJwtConfig) => {
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn as StringValue,
          },
        };
      },
    }),

    AuthModule,
    UsersModule,
    SkillsModule,
    FilesModule,
    RequestsModule,
    CategoriesModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
