import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationDbService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user: { id: dto.userId },
      type: dto.type,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata,
    });

    return this.notificationsRepository.save(notification);
  }

  async getUnread(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: {
        user: { id: userId },
        isRead: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }
}
