import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    example: 'Frontend разработка',
    description: 'Название навыка',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'React, TypeScript, Next.js',
    description: 'Описание навыка',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'Изображения навыка',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
