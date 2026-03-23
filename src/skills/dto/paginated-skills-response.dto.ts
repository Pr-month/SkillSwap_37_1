import { ApiProperty } from '@nestjs/swagger';
import { SkillResponseDto } from './skill-response.dto';

export class PaginatedSkillsResponseDto {
  @ApiProperty({ type: [SkillResponseDto] })
  data: SkillResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  totalCount: number;
}
