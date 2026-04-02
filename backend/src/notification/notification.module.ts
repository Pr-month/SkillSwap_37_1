import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationDbService } from './notification-db.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotificationsGateway, NotificationDbService, WsJwtGuard],
  exports: [NotificationsGateway, NotificationDbService],
})
export class NotificationModule {}
