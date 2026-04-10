import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';

const makeCategory = (id = 'cat-uuid-1') => ({
  id,
  name: 'Category',
});

const makeSkill = (overrides: Partial<Skill> = {}): Skill =>
  ({
    id: 'skill-uuid-1',
    title: 'TypeScript',
    description: 'TS skill',
    images: [],
    category: null,
    owner: { id: 'user-uuid-1' },
    favoritedBy: [],
    ...overrides,
  }) as Skill;

const makeQueryBuilder = (
  skills: Skill[],
  totalCount: number,
): Partial<SelectQueryBuilder<Skill>> => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([skills, totalCount]),
});

const makeSkillRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const makeCategoriesService = () => ({
  findOne: jest.fn(),
});

describe('SkillsService', () => {
  let service: SkillsService;
  let skillRepo: ReturnType<typeof makeSkillRepository>;
  let categoriesService: ReturnType<typeof makeCategoriesService>;

  beforeEach(async () => {
    skillRepo = makeSkillRepository();
    categoriesService = makeCategoriesService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: getRepositoryToken(Skill), useValue: skillRepo },
        { provide: CategoriesService, useValue: categoriesService },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('сервис должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('create: создание навыка', () => {
    const userId = 'user-uuid-1';

    it('создаёт навык без категории', async () => {
      const dto: CreateSkillDto = { title: 'TypeScript' };
      const skill = makeSkill();

      skillRepo.create.mockReturnValue(skill);
      skillRepo.save.mockResolvedValue(skill);

      const result = await service.create(dto, userId);

      expect(skillRepo.create).toHaveBeenCalledWith({
        title: 'TypeScript',
        owner: { id: userId },
        category: null,
      });
      expect(skillRepo.save).toHaveBeenCalledWith(skill);
      expect(result).toEqual(skill);
    });

    it('создаёт навык с категорией', async () => {
      const category = makeCategory();
      const dto: CreateSkillDto = { title: 'NestJS', categoryId: category.id };
      const skill = makeSkill({ category: category as any });

      categoriesService.findOne.mockResolvedValue(category);
      skillRepo.create.mockReturnValue(skill);
      skillRepo.save.mockResolvedValue(skill);

      const result = await service.create(dto, userId);

      expect(categoriesService.findOne).toHaveBeenCalledWith(category.id);
      expect(skillRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ category }),
      );
      expect(result.category).toEqual(category);
    });

    it('сохраняет опциональные поля (description, images)', async () => {
      const dto: CreateSkillDto = {
        title: 'Docker',
        description: 'Containers',
        images: ['img1.png'],
      };
      const skill = makeSkill({ ...dto });

      skillRepo.create.mockReturnValue(skill);
      skillRepo.save.mockResolvedValue(skill);

      await service.create(dto, userId);

      expect(skillRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Containers',
          images: ['img1.png'],
        }),
      );
    });
  });

  describe('findAll: получение списка навыков с пагинацией', () => {
    it('возвращает paginated-результат', async () => {
      const skills = [makeSkill()];
      const qb = makeQueryBuilder(skills, 1);
      skillRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: PaginationDto = { page: 1, limit: 10 };
      const result = await service.findAll(dto);

      expect(result).toEqual({
        data: skills,
        page: 1,
        limit: 10,
        totalCount: 1,
      });
    });

    it('применяет фильтр поиска, когда передан search', async () => {
      const qb = makeQueryBuilder([makeSkill()], 1);
      skillRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ page: 1, limit: 10, search: 'Type' });

      expect(qb.where).toHaveBeenCalledWith('skill.title ILIKE :search', {
        search: '%Type%',
      });
    });

    it('не вызывает where(), если search не передан', async () => {
      const qb = makeQueryBuilder([makeSkill()], 1);
      skillRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ page: 1, limit: 10 });

      expect(qb.where).not.toHaveBeenCalled();
    });

    it('выбрасывает NotFoundException, если запрошенная страница превышает lastPage', async () => {
      const qb = makeQueryBuilder([], 5);
      skillRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(service.findAll({ page: 2, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('корректно вычисляет skip и take для пагинации', async () => {
      const qb = makeQueryBuilder([makeSkill()], 25);
      skillRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ page: 3, limit: 5 });

      expect(qb.skip).toHaveBeenCalledWith(10);
      expect(qb.take).toHaveBeenCalledWith(5);
    });
  });

  describe('update: обновление навыка', () => {
    const userId = 'user-uuid-1';
    const skillId = 'skill-uuid-1';

    it('обновляет и возвращает навык', async () => {
      const skill = makeSkill();
      const dto: UpdateSkillDto = { title: 'Updated Title' };
      const updated = { ...skill, ...dto };

      skillRepo.findOne.mockResolvedValue(skill);
      skillRepo.save.mockResolvedValue(updated);

      const result = await service.update(skillId, dto, userId);

      expect(skillRepo.findOne).toHaveBeenCalledWith({
        where: { id: skillId },
        relations: ['owner'],
      });
      expect(skillRepo.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('выбрасывает NotFoundException, если навык не найден', async () => {
      skillRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(skillId, { title: 'X' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('выбрасывает ForbiddenException, если пользователь не является владельцем', async () => {
      const skill = makeSkill({ owner: { id: 'other-user' } as any });
      skillRepo.findOne.mockResolvedValue(skill);

      await expect(
        service.update(skillId, { title: 'X' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('обновляет категорию, если передан categoryId', async () => {
      const category = makeCategory('cat-uuid-2');
      const skill = makeSkill();
      const dto: UpdateSkillDto = { categoryId: category.id };

      skillRepo.findOne.mockResolvedValue(skill);
      categoriesService.findOne.mockResolvedValue(category);
      skillRepo.save.mockResolvedValue({ ...skill, category });

      const result = await service.update(skillId, dto, userId);

      expect(categoriesService.findOne).toHaveBeenCalledWith(category.id);
      expect(result.category).toEqual(category);
    });

    it('пропускает обновление категории, если categoryId не передан', async () => {
      const skill = makeSkill({ category: makeCategory() as any });
      skillRepo.findOne.mockResolvedValue(skill);
      skillRepo.save.mockResolvedValue(skill);

      await service.update(skillId, { categoryId: undefined }, userId);

      expect(categoriesService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('remove: удаление навыка', () => {
    const userId = 'user-uuid-1';
    const skillId = 'skill-uuid-1';

    it('успешно удаляет навык', async () => {
      const skill = makeSkill();
      skillRepo.findOne.mockResolvedValue(skill);
      skillRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove(skillId, userId)).resolves.toBeUndefined();
      expect(skillRepo.remove).toHaveBeenCalledWith(skill);
    });

    it('выбрасывает NotFoundException, если навык не найден', async () => {
      skillRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(skillId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('выбрасывает ForbiddenException, если пользователь не является владельцем', async () => {
      const skill = makeSkill({ owner: { id: 'another-user' } as any });
      skillRepo.findOne.mockResolvedValue(skill);

      await expect(service.remove(skillId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
