import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'IT и программирование (обновлено)',
    description: 'Новое название категории',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID новой родительской категории',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
