import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user.enums';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

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
}
