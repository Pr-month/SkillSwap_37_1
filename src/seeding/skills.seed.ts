import * as dotenv from 'dotenv';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { skillNames } from './skills.data';
import { UserRole } from '../users/entities/user.enums';

dotenv.config();

export async function seedSkills() {
  const userRepository = AppDataSource.getRepository(User);
  const skillRepository = AppDataSource.getRepository(Skill);

  const users = await userRepository.find({
    where: { role: UserRole.USER },
  });

  if (users.length === 0) {
    console.log('No users found. Please run users seeding first.');
    process.exit(0);
  }

  console.log(`Found ${users.length} users. Starting skills seeding...`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const skillName of skillNames) {
    const existingSkill = await skillRepository.findOne({
      where: { title: skillName },
    });

    if (existingSkill) {
      skippedCount++;
      continue;
    }

    const randomUser = users[Math.floor(Math.random() * users.length)];

    const skill = new Skill();
    skill.title = skillName;
    skill.owner = randomUser;
    skill.description = '';
    skill.images = [];

    await skillRepository.save(skill);
    createdCount++;
    console.log(
      `Skill "${skillName}" created and assigned to ${randomUser.name}`,
    );
  }

  console.log(
    `Skills seeding completed. Created: ${createdCount}, Skipped (already exist): ${skippedCount}`,
  );
}

seedSkills().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
