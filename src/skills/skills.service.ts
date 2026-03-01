import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedSkillsResultDto } from './dto/paginated-skills-result.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRespository: Repository<Skill>,
  ) {
  }

  create(createSkillDto: CreateSkillDto) {
    return 'This action adds a new skill';
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedSkillsResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit;

    const query = this.skillsRespository
      .createQueryBuilder('skill')
      .orderBy('skill.title', 'DESC');

    const [skills, totalCount] = await query
      .skip(skippedItems)
      .take(paginationDto.limit)
      .getManyAndCount();

    return {
      totalCount,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: skills,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    return `This action updates a #${id} skill`;
  }

  remove(id: number) {
    return `This action removes a #${id} skill`;
  }
}
