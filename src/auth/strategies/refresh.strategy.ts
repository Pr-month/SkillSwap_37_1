import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { RefreshPayload } from '../types/auth.types';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.refreshSecret,
    });
  }

  async validate(req: Request, payload: RefreshPayload) {
    const user = await this.usersService.findOne(payload.sub);

    const authHeader = req.headers?.authorization;
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : '';

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        sub: payload.sub,
      },
      token,
    };
  }
}
