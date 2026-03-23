import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../enums/request.enums';
import { IsEnum } from 'class-validator';

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.ACCEPTED,
    description: 'Новый статус запроса',
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
