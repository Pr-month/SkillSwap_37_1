import { Gender, UserRole } from "../entities/user.enums";

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
