import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategoriesService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: ReturnType<typeof mockCategoriesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useFactory: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get(CategoriesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('контроллер должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('должен вызвать service.create и вернуть результат', async () => {
      const dto: CreateCategoryDto = { name: 'IT и программирование' };
      const expected = {
        id: 'uuid-1',
        name: dto.name,
        parent: null,
        children: [],
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('должен создать дочернюю категорию при наличии parentId', async () => {
      const dto: CreateCategoryDto = {
        name: 'Backend',
        parentId: 'parent-uuid',
      };
      const expected = {
        id: 'child-uuid',
        name: dto.name,
        parent: { id: 'parent-uuid', name: 'IT' },
        children: [],
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('должен пробросить NotFoundException от сервиса', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Родительская категория не найдена'),
      );

      await expect(
        controller.create({ name: 'Sub', parentId: 'bad-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('должен вернуть список всех категорий', async () => {
      const expected = [{ name: 'Технологии', children: [{ name: 'IT' }] }];

      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it('должен вернуть пустой массив если категорий нет', async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('должен вернуть категорию по id', async () => {
      const expected = { id: 'uuid-1', name: 'IT', parent: null, children: [] };

      service.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('uuid-1');

      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(expected);
    });

    it('должен пробросить NotFoundException от сервиса', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Category with ID bad-uuid not found'),
      );

      await expect(controller.findOne('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('должен обновить категорию и вернуть результат', async () => {
      const dto: UpdateCategoryDto = { name: 'Обновлённое название' };
      const expected = {
        id: 'uuid-1',
        name: dto.name,
        parent: null,
        children: [],
      };

      service.update.mockResolvedValue(expected);

      const result = await controller.update('uuid-1', dto);

      expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual(expected);
    });

    it('должен пробросить NotFoundException если категория не найдена', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('bad-uuid', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен пробросить NotFoundException при невалидном parentId', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('uuid-1', { parentId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('должен удалить категорию', async () => {
      const expected = { message: 'Категория "IT" успешно удалена' };

      service.remove.mockResolvedValue(expected);

      const result = await controller.remove('uuid-1');

      expect(service.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(expected);
    });

    it('должен пробросить NotFoundException если категория не найдена', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
