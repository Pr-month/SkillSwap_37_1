import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../enums/request.enums';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { SkillResponseDto } from '../../skills/dto/skill-response.dto';

export class RequestResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Отправитель запроса',
  })
  sender: UserResponseDto;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Получатель запроса',
  })
  receiver: UserResponseDto;

  @ApiProperty({ enum: RequestStatus, example: RequestStatus.PENDING })
  status: RequestStatus;

  @ApiProperty({
    type: () => SkillResponseDto,
    description: 'Предлагаемый навык',
  })
  offeredSkill: SkillResponseDto;

  @ApiProperty({
    type: () => SkillResponseDto,
    description: 'Запрашиваемый навык',
  })
  requestedSkill: SkillResponseDto;

  @ApiProperty({ example: false })
  isRead: boolean;
}
