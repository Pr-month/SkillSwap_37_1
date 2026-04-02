import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationDbService } from './notification-db.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../auth/types/auth.types';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationDbService: NotificationDbService) {}

  @Get('unread')
  async getUnread(
    @Request() req: AuthRequest,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationDbService.getUnread(
      req.user.sub,
    );
    return notifications.map((notification) =>
      this.toResponseDto(notification),
    );
  }

  @Get()
  async getAll(
    @Request() req: AuthRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: NotificationResponseDto[]; total: number }> {
    const { data, total } = await this.notificationDbService.getAll(
      req.user.sub,
      page,
      limit,
    );
    return {
      data: data.map((notification) => this.toResponseDto(notification)),
      total,
    };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationDbService.markAsRead(
      id,
      req.user.sub,
    );
    return this.toResponseDto(notification);
  }

  @Patch('mark-all-read')
  async markAllAsRead(
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    await this.notificationDbService.markAllAsRead(req.user.sub);
    return { message: 'Все уведомления отмечены как прочитанные' };
  }

  private toResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
