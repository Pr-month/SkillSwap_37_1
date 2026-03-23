import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/types/auth.types';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    await this.validateToken(client);

    return true;
  }

  async validateToken(client: Socket): Promise<JwtPayload> {
    const token = this.getTokenFromClient(client);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;

      return payload;
    } catch {
      throw new WsException(ERROR_MESSAGES.WS_UNAUTHORIZED);
    }
  }

  private getTokenFromClient(client: Socket): string {
    const token = client.handshake.query?.token;

    if (!token || Array.isArray(token)) {
      throw new WsException(ERROR_MESSAGES.WS_TOKEN_MISSING);
    }

    return token;
  }
}
