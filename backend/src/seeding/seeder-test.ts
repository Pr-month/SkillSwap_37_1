import { AppDataSource } from '../config/ormconfig';
import { seedCategories } from './categories.seed';
import { seedUsers } from './users.seed';
import { seedSkills } from './skills.seed';
import { seedAdmin } from './admin.seed';

async function seederTest() {
  try {
    console.log('Запускаем сидер для тестов');

    // Инициализируем подключение к БД
    await AppDataSource.initialize();
    console.log('База данных подключена');

    // Очищаем БД
    await AppDataSource.synchronize(true);
    console.log('База данных очищена');

    // Запускаем сиды
    console.log('Заполнение тестовыми данными:');
    await seedCategories(AppDataSource);
    await seedUsers(AppDataSource);
    await seedAdmin(AppDataSource);
    await seedSkills(AppDataSource);

    console.log('Тестовые данные загружены');
  } catch (error) {
    console.error('Ошибка при загрузке тестовых данных:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Подключение к БД закрыто');
    }
  }
}

seederTest().catch((error) => {
  console.error('Ошибка:', error);
  process.exit(1);
});
