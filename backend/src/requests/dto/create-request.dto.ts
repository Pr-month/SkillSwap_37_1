import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID навыка, который хочет получить пользователь',
  })
  @IsUUID()
  requestedSkillId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID навыка, который предлагает пользователь в обмен',
  })
  @IsUUID()
  offeredSkillId: string;
}
