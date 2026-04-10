import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const mockCategoryRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'uuid-1',
  name: 'IT',
  parent: null as unknown as Category,
  children: [],
  ...overrides,
});

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: MockRepository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useFactory: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<MockRepository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('сервис должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = { name: 'IT и программирование' };

    it('должен создать корневую категорию без родителя', async () => {
      const saved = makeCategory({ name: dto.name });

      repository.create!.mockReturnValue(saved);
      repository.save!.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.findOne).not.toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith({ name: dto.name });
      expect(repository.save).toHaveBeenCalledWith(saved);
      expect(result).toEqual(saved);
    });

    it('должен создать дочернюю категорию при валидном parentId', async () => {
      const parent = makeCategory({ id: 'parent-uuid', name: 'Технологии' });
      const child = makeCategory({ id: 'child-uuid', name: dto.name, parent });

      repository.findOne!.mockResolvedValue(parent);
      repository.create!.mockReturnValue(child);
      repository.save!.mockResolvedValue(child);

      const result = await service.create({ ...dto, parentId: parent.id });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: parent.id },
      });
      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        parent,
      });
      expect(result).toEqual(child);
    });

    it('должен выбросить NotFoundException если parentId не найден', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Sub', parentId: 'non-existent-uuid' }),
      ).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('должен вернуть корневые категории с вложенными детьми', async () => {
      const categories: Category[] = [
        makeCategory({
          id: 'uuid-1',
          name: 'Технологии',
          children: [
            makeCategory({ id: 'uuid-2', name: 'IT' }),
            makeCategory({ id: 'uuid-3', name: 'AI' }),
          ],
        }),
      ];

      repository.find!.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { parent: expect.anything() },
        relations: ['children'],
      });
      expect(result).toEqual([
        {
          name: 'Технологии',
          children: [{ name: 'IT' }, { name: 'AI' }],
        },
      ]);
    });

    it('должен вернуть пустой массив если категорий нет', async () => {
      repository.find!.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('должен вернуть категорию с пустым массивом children', async () => {
      repository.find!.mockResolvedValue([makeCategory({ name: 'Дизайн' })]);
      const result = await service.findAll();
      expect(result).toEqual([{ name: 'Дизайн', children: [] }]);
    });
  });

  describe('findOne', () => {
    it('должен вернуть категорию по id', async () => {
      const category = makeCategory();

      repository.findOne!.mockResolvedValue(category);

      const result = await service.findOne('uuid-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        relations: ['children'],
      });
      expect(result).toEqual(category);
    });

    it('должен выбросить NotFoundException если категория не найдена', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен передать id в текст ошибки', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('missing-id')).rejects.toThrow(
        'Category with ID missing-id not found',
      );
    });
  });

  describe('update', () => {
    it('должен обновить название категории', async () => {
      const existing = makeCategory({ name: 'Старое название' });
      const updated = makeCategory({ name: 'Новое название' });

      repository.findOne!.mockResolvedValue({ ...existing });
      repository.save!.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'Новое название' });

      expect(result.name).toBe('Новое название');
      expect(repository.save).toHaveBeenCalled();
    });

    it('должен назначить нового родителя при корректном parentId', async () => {
      const existing = makeCategory({ name: 'Дочерняя' });
      const parent = makeCategory({ id: 'parent-uuid', name: 'Технологии' });
      const withParent = makeCategory({ parent });

      repository
        .findOne!.mockResolvedValueOnce({ ...existing })
        .mockResolvedValueOnce(parent);
      repository.save!.mockResolvedValue(withParent);

      const result = await service.update('uuid-1', {
        parentId: 'parent-uuid',
      });

      expect(result.parent).toEqual(parent);
    });

    it('должен обнулить родителя при parentId равном null', async () => {
      const parent = makeCategory({ id: 'p', name: 'P' });
      const withParent = makeCategory({ parent });
      const withoutParent = makeCategory();

      repository.findOne!.mockResolvedValue({ ...withParent });
      repository.save!.mockResolvedValue(withoutParent);

      await service.update('uuid-1', { parentId: null as unknown as string });

      const savedArg = repository.save!.mock.calls[0][0] as Category;
      expect(savedArg.parent).toBeNull();
    });

    it('не должен менять название если name не передан', async () => {
      const existing = makeCategory({ name: 'Старое название' });

      repository.findOne!.mockResolvedValue({ ...existing });
      repository.save!.mockResolvedValue({ ...existing });

      await service.update('uuid-1', {});

      const savedArg = repository.save!.mock.calls[0][0] as Category;
      expect(savedArg.name).toBe('Старое название');
    });

    it('должен выбросить NotFoundException если категория не найдена', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.update('bad-uuid', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить NotFoundException если новый parentId не найден', async () => {
      repository
        .findOne!.mockResolvedValueOnce(makeCategory())
        .mockResolvedValueOnce(null);

      await expect(
        service.update('uuid-1', { parentId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен удалить категорию', async () => {
      const category = makeCategory({ name: 'IT' });

      repository.findOne!.mockResolvedValue(category);
      repository.remove!.mockResolvedValue(category);

      const result = await service.remove('uuid-1');

      expect(repository.remove).toHaveBeenCalledWith(category);
      expect(result).toEqual({ message: 'Категория "IT" успешно удалена' });
    });

    it('должен выбросить NotFoundException если категория не найдена', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.remove('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
