import { Repository, DataSource } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CategoriesData } from './categories.data';

async function findOrCreateCategory(
  repo: Repository<Category>,
  name: string,
  parent?: Category,
): Promise<Category> {
  let category = await repo.findOne({ where: { name } });
  if (!category) {
    category = repo.create({ name, parent });
    category = await repo.save(category);
    console.log(
      `  + Created category: ${name}${parent ? ` (child of ${parent.name})` : ''}`,
    );
  } else {
    console.log(`  = Category already exists: ${name}`);
  }
  return category;
}

export async function seedCategories(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(Category);

  console.log('Starting categories seeding...');

  for (const group of CategoriesData) {
    // Создаём/находим родительскую категорию
    const parentCategory = await findOrCreateCategory(categoryRepo, group.name);

    // Создаём дочерние категории
    for (const childName of group.children) {
      await findOrCreateCategory(categoryRepo, childName, parentCategory);
    }
  }

  console.log('Categories seeding completed successfully');
}
