import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Gender } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsDateString()
  birthdate: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  city: string;

  @IsString()
  about: string;

  @IsString()
  avatar: string;

  //TODO: когда скиллы будут добавить!
}
