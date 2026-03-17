import { Request } from 'express';
import { UserRole } from 'src/users/enums/user.enums';

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
  user: {
    sub: string;
    refreshToken: string;
  };
};
