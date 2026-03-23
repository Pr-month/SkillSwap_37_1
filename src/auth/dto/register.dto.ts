import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Gender } from 'src/users/enums/user.enums';

export class RegisterDto {
  @ApiProperty({ example: 'Иван Петров', description: 'Имя пользователя' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email для входа' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (мин. 8 символов)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Дата рождения',
    required: false,
  })
  @IsDateString()
  birthdate: Date;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Пол',
    required: false,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: 'Москва',
    description: 'Город',
    required: false,
  })
  @IsString()
  city: string;

  @ApiProperty({
    example: 'Люблю программировать',
    description: 'О себе',
    required: false,
  })
  @IsString()
  about: string;

  @ApiProperty({
    example: 'avatar.jpg',
    description: 'Аватар',
    required: false,
  })
  @IsString()
  avatar: string;

  //TODO: когда скиллы будут добавить!
}
