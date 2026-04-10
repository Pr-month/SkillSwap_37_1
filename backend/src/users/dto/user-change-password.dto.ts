import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Текущий пароль' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description:
      'Новый пароль (минимум 8 символов, заглавные, строчные и цифры)',
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль должен содержать заглавные буквы, строчные буквы и цифры',
  })
  newPassword: string;
}
