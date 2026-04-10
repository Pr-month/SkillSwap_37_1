import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationDbService } from './notification-db.service';
import { NOTIFICATION_EVENTS } from './constants/notification-events';
import { NOTIFICATION_MESSAGES } from './constants/notification-messages';
import { NotificationType } from './enums/notification.enums';

type NotificationPayload = {
  type: 'newRequest' | 'requestAccepted' | 'requestRejected';
  message: string;
  skillTitle: string;
  fromUser: string;
};

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly notificationDbService: NotificationDbService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = await this.wsJwtGuard.validateToken(client);
      await client.join(payload.sub);
    } catch {
      client.disconnect();
    }
  }

  private async sendAndSave(
    userId: string,
    type: NotificationType,
    title: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): Promise<void> {
    await this.notificationDbService.create({
      userId,
      type,
      title,
      message: payload.message,
      metadata: {
        skillTitle: payload.skillTitle,
        fromUser: payload.fromUser,
      },
    });

    const eventMap = {
      [NotificationType.NEW_REQUEST]: NOTIFICATION_EVENTS.NEW_REQUEST,
      [NotificationType.REQUEST_ACCEPTED]: NOTIFICATION_EVENTS.REQUEST_ACCEPTED,
      [NotificationType.REQUEST_REJECTED]: NOTIFICATION_EVENTS.REQUEST_REJECTED,
    };

    this.server.to(userId).emit(eventMap[type], {
      type:
        type === NotificationType.NEW_REQUEST
          ? 'newRequest'
          : type === NotificationType.REQUEST_ACCEPTED
            ? 'requestAccepted'
            : 'requestRejected',
      ...payload,
    });
  }

  async notifyNewRequest(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): Promise<void> {
    await this.sendAndSave(
      userId,
      NotificationType.NEW_REQUEST,
      NOTIFICATION_MESSAGES.NEW_REQUEST(payload.fromUser),
      payload,
    );
  }

  async notifyRequestAccepted(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): Promise<void> {
    await this.sendAndSave(
      userId,
      NotificationType.REQUEST_ACCEPTED,
      NOTIFICATION_MESSAGES.REQUEST_ACCEPTED(payload.fromUser),
      payload,
    );
  }

  async notifyRequestRejected(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): Promise<void> {
    await this.sendAndSave(
      userId,
      NotificationType.REQUEST_REJECTED,
      NOTIFICATION_MESSAGES.REQUEST_REJECTED(payload.fromUser),
      payload,
    );
  }
}
