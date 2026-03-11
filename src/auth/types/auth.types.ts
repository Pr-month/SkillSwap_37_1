import { Request } from 'express';
import { UserRole } from 'src/users/entities/user.enums';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type RefreshPayload = {
  sub: string;
};

export type AuthRequest = Request & {
  user: JwtPayload;
};

export type RefreshRequest = Request & {
  user: RefreshPayload;
  token: string;
};
