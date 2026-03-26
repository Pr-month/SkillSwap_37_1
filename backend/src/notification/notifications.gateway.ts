import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NOTIFICATION_EVENTS } from 'src/notification/constants/notification-events';

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

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = await this.wsJwtGuard.validateToken(client);
      await client.join(payload.sub);
    } catch {
      client.disconnect();
    }
  }

  notifyNewRequest(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): void {
    this.server.to(userId).emit(NOTIFICATION_EVENTS.NEW_REQUEST, {
      type: 'newRequest',
      ...payload,
    });
  }

  notifyRequestAccepted(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): void {
    this.server.to(userId).emit(NOTIFICATION_EVENTS.REQUEST_ACCEPTED, {
      type: 'requestAccepted',
      ...payload,
    });
  }

  notifyRequestRejected(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ): void {
    this.server.to(userId).emit(NOTIFICATION_EVENTS.REQUEST_REJECTED, {
      type: 'requestRejected',
      ...payload,
    });
  }
}
