import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  requestedSkillId: string;

  @IsUUID()
  offeredSkillId: string;
}
