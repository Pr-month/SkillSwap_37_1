import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { NotificationType } from '../enums/notification.enums';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    skillTitle?: string;
    fromUser?: string;
    requestId?: string;
    skillId?: string;
  };
}
