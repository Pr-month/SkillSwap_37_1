import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user.enums';
import * as bcrypt from 'bcrypt';
import { testUsers } from './users.data';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const saltRounds = parseInt(process.env.HASH_SALT || '10', 10);

  console.log('Starting test users seeding...');

  for (const userData of testUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`User with email ${userData.email} already exists, skipping`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Создаём экземпляр User и заполняем поля
    const user = new User();
    user.name = userData.name;
    user.email = userData.email;
    user.password = hashedPassword;
    user.about = userData.about;
    user.city = userData.city;
    user.gender = userData.gender;
    user.role = UserRole.USER;

    await userRepository.save(user);
    console.log(`Created user: ${userData.name} (${userData.email})`);
  }

  console.log('Users seeding completed successfully');
}
