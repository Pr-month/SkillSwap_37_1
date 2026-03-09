import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

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
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  async remove(id: number, userRole: string) {
    // Проверка прав администратора
    if (userRole !== 'admin') {
      throw new ForbiddenException('Только администратор может удалять категории');
    }

    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);
    
    return { message: `Категория "${category.name}" успешно удалена` };
  }
}
