import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

export class SkillResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Frontend разработка' })
  title: string;

  @ApiPropertyOptional({ example: 'React, TypeScript, Next.js' })
  description: string | null;

  @ApiPropertyOptional({ example: ['image1.jpg'], type: [String] })
  images: string[];

  @ApiPropertyOptional({
    description: 'Категория навыка',
    type: () => Category,
  })
  category: Category | null;

  @ApiProperty({ description: 'Владелец навыка', type: () => User })
  owner: User;
}
