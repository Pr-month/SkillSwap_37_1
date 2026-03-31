import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Gender } from '../enums/user.enums';

export class CreateUserDto {
  @ApiProperty({ example: 'Иван Петров', description: 'Имя пользователя' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (мин. 8 символов)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Дата рождения',
  })
  @IsDateString()
  @IsOptional()
  birthdate?: Date;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Пол',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'Москва',
    description: 'Город',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    example: 'Люблю программировать',
    description: 'О себе',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({
    example: 'avatar.jpg',
    description: 'Аватар',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsArray()
  @IsUUID()
  @IsOptional()
  wantToLearn?: string[];
}
