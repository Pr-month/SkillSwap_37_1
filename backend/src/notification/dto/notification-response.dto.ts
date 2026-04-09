export class NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: any;
  isRead: boolean;
  createdAt: Date;
}
