import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'IT и программирование',
    description: 'Название категории',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID родительской категории (если это подкатегория)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
