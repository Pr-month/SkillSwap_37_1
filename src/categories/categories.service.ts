import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { IsNull, Repository } from 'typeorm';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;

    let parent: Category | null = null;

    if (parentId) {
      parent = await this.categoriesRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Родительская категория не найдена');
      }
    }

    const category = this.categoriesRepository.create({
      name,
      ...(parent && { parent }),
    });

    return this.categoriesRepository.save(category);
  }

  async findAll() {
    const parentCategories = await this.categoriesRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });

    return parentCategories.map((category) => ({
      name: category.name,
      children: category.children.map((child) => ({
        name: child.name,
      })),
    }));
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORIES_NOT_FOUND);
    }

    if (dto.name) {
      category.name = dto.name;
    }

    if (dto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(ERROR_MESSAGES.PARENT_CATEGORIES_NOT_FOUND);
      }

      category.parent = parent;
    }

    if (dto.parentId === null) {
      category.parent = dto.parentId;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: string, userRole: string) {
    // Проверка прав администратора
    if (userRole !== 'admin') {
      throw new ForbiddenException(
        'Только администратор может удалять категории',
      );
    }

    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);

    return { message: `Категория "${category.name}" успешно удалена` };
  }
}
