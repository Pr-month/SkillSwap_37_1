import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Номер страницы' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Количество на странице' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    example: 'Frontend',
    description: 'Поиск по названию',
  })
  @IsOptional()
  search?: string;
}
