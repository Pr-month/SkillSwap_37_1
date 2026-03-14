import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedSkillsResultDto } from './dto/paginated-skills-result.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto, userId: string): Promise<Skill> {
    const skill = this.skillsRepository.create(
      { ...createSkillDto, owner: { id: userId } },
    );
    return this.skillsRepository.save(skill);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedSkillsResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit;
    const { page, limit, search } = paginationDto;

    const query = this.skillsRepository.createQueryBuilder('skill');

    if (search) {
      query.where('skill.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    query.orderBy('skill.title', 'DESC');

    const [skills, totalCount] = await query
      .skip(skippedItems)
      .take(paginationDto.limit)
      .getManyAndCount();

    const lastPage = Math.ceil(totalCount / limit);

    if (page > lastPage) {
      throw new NotFoundException(
        `Страница ${page} не найдена. Всего страниц: ${lastPage}`,
      );
    }

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

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    userId: string,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    if (!skill.owner || skill.owner.id !== userId) {
      throw new ForbiddenException('Можно обновлять только свои навыки');
    }

    Object.assign(skill, updateSkillDto);
    return this.skillsRepository.save(skill);
  }

  async remove(id: string, userId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    if (!skill.owner || skill.owner.id !== userId) {
      throw new ForbiddenException('Можно удалять только свои навыки');
    }

    await this.skillsRepository.remove(skill);
  }
}
