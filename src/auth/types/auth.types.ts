import { Request } from 'express';
import { UserRole } from '../../users/entities/user.entity';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthRequest = Request & {
  user: JwtPayload;
};
