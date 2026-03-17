import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { UsersService } from '../users/users.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Skill } from './entities/skill.entity';
import { AuthRequest } from '../auth/types/auth.types';

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

const makeAuthRequest = (userId = 'user-uuid-1'): AuthRequest =>
  ({ user: { sub: userId } }) as AuthRequest;

const makePaginatedResult = (skills: Skill[]) => ({
  data: skills,
  page: 1,
  limit: 10,
  totalCount: skills.length,
});

const makeSkillsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const makeUsersService = () => ({
  addFavoriteSkill: jest.fn(),
  removeFavoriteSkill: jest.fn(),
});

describe('SkillsController', () => {
  let controller: SkillsController;
  let skillsService: ReturnType<typeof makeSkillsService>;
  let usersService: ReturnType<typeof makeUsersService>;

  beforeEach(async () => {
    skillsService = makeSkillsService();
    usersService = makeUsersService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        { provide: SkillsService, useValue: skillsService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('контроллер должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  describe('create: создание навыка', () => {
    it('передаёт dto и userId из JWT в skillsService.create', async () => {
      const dto: CreateSkillDto = { title: 'TypeScript' };
      const req = makeAuthRequest();
      const skill = makeSkill();

      skillsService.create.mockResolvedValue(skill);

      const result = await controller.create(dto, req);

      expect(skillsService.create).toHaveBeenCalledWith(dto, 'user-uuid-1');
      expect(result).toEqual(skill);
    });
  });

  describe('addToFavorite: добавление навыка в избранное', () => {
    it('вызывает usersService.addFavoriteSkill и возвращает сообщение со списком', async () => {
      const skillId = 'skill-uuid-1';
      const req = makeAuthRequest();
      const favoriteSkills = [makeSkill()];

      usersService.addFavoriteSkill.mockResolvedValue({ favoriteSkills });

      const result = await controller.addToFavorite(skillId, req);

      expect(usersService.addFavoriteSkill).toHaveBeenCalledWith(
        'user-uuid-1',
        skillId,
      );
      expect(result).toEqual({
        message: 'Навык успешно добавлен в избранное',
        favoriteSkills,
      });
    });
  });

  describe('removeFromFavorite: удаление навыка из избранного', () => {
    it('вызывает usersService.removeFavoriteSkill и возвращает сообщение со списком', async () => {
      const skillId = 'skill-uuid-1';
      const req = makeAuthRequest();
      const favoriteSkills: Skill[] = [];

      usersService.removeFavoriteSkill.mockResolvedValue({ favoriteSkills });

      const result = await controller.removeFromFavorite(skillId, req);

      expect(usersService.removeFavoriteSkill).toHaveBeenCalledWith(
        'user-uuid-1',
        skillId,
      );
      expect(result).toEqual({
        message: 'Навык успешно удален из избранного',
        favoriteSkills,
      });
    });
  });

  describe('findAll: получение списка навыков', () => {
    it('передаёт параметры пагинации в skillsService.findAll', async () => {
      const skills = [makeSkill()];
      const paginated = makePaginatedResult(skills);
      const paginationDto: PaginationDto = { page: 1, limit: 5 };

      skillsService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(paginationDto);

      expect(skillsService.findAll).toHaveBeenCalledWith({ page: 1, limit: 5 });
      expect(result).toEqual(paginated);
    });

    it('ограничивает limit до 10, если передано значение больше', async () => {
      skillsService.findAll.mockResolvedValue(makePaginatedResult([]));

      await controller.findAll({ page: 1, limit: 50 });

      expect(skillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 }),
      );
    });

    it('передаёт строку поиска в skillsService.findAll', async () => {
      skillsService.findAll.mockResolvedValue(makePaginatedResult([]));

      await controller.findAll({ page: 1, limit: 5, search: 'Node' });

      expect(skillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Node' }),
      );
    });
  });

  describe('findOne: получение навыка по id', () => {
    it('преобразует строковый id в число и передаёт в skillsService.findOne', () => {
      skillsService.findOne.mockReturnValue('This action returns a #1 skill');

      const result = controller.findOne('1');

      expect(skillsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe('This action returns a #1 skill');
    });
  });

  describe('update: обновление навыка', () => {
    it('передаёт skillId, dto и userId в skillsService.update', async () => {
      const dto: UpdateSkillDto = { title: 'Updated' };
      const req = makeAuthRequest();
      const updated = makeSkill({ title: 'Updated' });

      skillsService.update.mockResolvedValue(updated);

      const result = await controller.update('skill-uuid-1', dto, req);

      expect(skillsService.update).toHaveBeenCalledWith(
        'skill-uuid-1',
        dto,
        'user-uuid-1',
      );
      expect(result).toEqual(updated);
    });
  });

  describe('remove: удаление навыка', () => {
    it('передаёт skillId и userId в skillsService.remove', async () => {
      const req = makeAuthRequest();
      skillsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('skill-uuid-1', req);

      expect(skillsService.remove).toHaveBeenCalledWith(
        'skill-uuid-1',
        'user-uuid-1',
      );
      expect(result).toBeUndefined();
    });
  });
});
