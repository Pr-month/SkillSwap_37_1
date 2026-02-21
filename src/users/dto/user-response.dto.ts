import { Gender, UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;

  about: string | null;
  birthdate: Date | null;
  city: string | null;
  gender: Gender | null;
  avatar: string | null;
  role: UserRole;
}
