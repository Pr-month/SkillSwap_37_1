import { Skill } from '../entities/skill.entity';
import { Type } from 'class-transformer';

export class PaginatedSkillsResultDto {
  data: Skill[];
  page: number;
  limit: number;
  totalCount: number;
}
