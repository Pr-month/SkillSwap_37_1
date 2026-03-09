import { RequestStatus } from '../entities/request.enums';
import { IsEnum } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
