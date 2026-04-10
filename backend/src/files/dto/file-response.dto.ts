import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID файла',
  })
  id: string;

  @ApiProperty({
    example: '/public/file-1700000000000-123456789.jpg',
    description: 'Публичная ссылка на файл',
  })
  url: string;

  @ApiProperty({
    example: 'avatar.jpg',
    description: 'Оригинальное имя файла',
  })
  filename: string;
}
