import * as dotenv from 'dotenv';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user.enums';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function seedAdmin() {
  try {
    await AppDataSource.initialize();
    console.log(' Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Получаем данные из .env (или используем значения по умолчанию)
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.ru';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
    const saltRounds = parseInt(process.env.HASH_SALT || '10', 10);

    // Проверяем, существует ли пользователь с таким email
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Создаём администратора
    const admin = userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepository.save(admin);
    console.log(`Admin user created with email: ${adminEmail}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

seedAdmin().catch((error) => {
  console.error('Unhandled error during seeding:', error);
  process.exit(1);
});
