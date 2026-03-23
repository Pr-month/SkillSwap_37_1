import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, UserRole } from '../enums/user.enums';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Иван Петров' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Люблю программировать' })
  about: string | null;

  @ApiPropertyOptional({ example: '1990-01-01' })
  birthdate: Date | null;

  @ApiPropertyOptional({ example: 'Москва' })
  city: string | null;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  gender: Gender | null;

  @ApiPropertyOptional({ example: 'avatar.jpg' })
  avatar: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;
}
