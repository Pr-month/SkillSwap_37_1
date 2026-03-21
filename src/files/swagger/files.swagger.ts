import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileResponseDto } from '../dto/file-response.dto';

// Загрузка файла
export function ApiUploadFile() {
  return applyDecorators(
    ApiTags('Files'),
    ApiOperation({ summary: 'Загрузить файл (изображение)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Файл изображения (JPEG, PNG, GIF, до 2MB)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Файл успешно загружен',
      type: FileResponseDto,
    }),
    ApiResponse({
      status: 400,
      description:
        'Ошибка валидации: неверный формат файла или превышен размер',
      schema: {
        example: {
          statusCode: 400,
          message: 'Only image files are allowed!',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}
