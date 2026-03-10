import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  async findAll() {
    const parentCategories = await this.categoriesRepository.find({
      where: { parent: null },
      relations: ['children'],
    });

    return parentCategories.map((category) => ({
      name: category.name,
      children: category.children.map((child) => ({
        name: child.name,
      })),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
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

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
