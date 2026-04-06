import { User } from 'src/users/entities/user.entity';

export type OAuthRequest = Request & {
  user: User;
};
