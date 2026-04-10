import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Уникальный идентификатор категории',
  })
  id: string;

  @ApiProperty({
    example: 'IT и программирование',
    description: 'Название категории',
  })
  name: string;

  @ApiProperty({
    description: 'Родительская категория',
    nullable: true,
    type: () => CategoryResponseDto,
  })
  parent: CategoryResponseDto | null;

  @ApiProperty({
    description: 'Дочерние категории',
    type: [CategoryResponseDto],
    required: false,
  })
  children?: CategoryResponseDto[];
}
