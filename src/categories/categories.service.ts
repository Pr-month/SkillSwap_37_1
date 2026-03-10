import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { IsNull, Repository } from 'typeorm';

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

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
