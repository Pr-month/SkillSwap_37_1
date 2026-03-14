import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

// Для создания категории
export function ApiCreateCategory() {
  return applyDecorators(
    ApiTags('Categories'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Создать новую категорию' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'IT и программирование',
            description: 'Название категории',
          },
          parentId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
            description: 'ID родительской категории (если это подкатегория)',
            nullable: true,
          },
        },
        required: ['name'],
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Категория успешно создана',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'IT и программирование',
          parent: null,
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Ошибка валидации' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 409,
      description: 'Категория с таким именем уже существует',
    }),
  );
}

// Для получения всех категорий
export function ApiGetAllCategories() {
  return applyDecorators(
    ApiTags('Categories'),
    ApiOperation({ summary: 'Получить все категории' }),
    ApiResponse({
      status: 200,
      description: 'Список категорий с дочерними элементами',
      schema: {
        example: [
          {
            name: 'IT и программирование',
            children: [
              { name: 'Frontend' },
              { name: 'Backend' },
              { name: 'DevOps' },
            ],
          },
          {
            name: 'Дизайн и UX/UI',
            children: [
              { name: 'Графический дизайн' },
              { name: 'UX/UI' },
              { name: 'Web-дизайн' },
            ],
          },
        ],
      },
    }),
  );
}

// Для получения категории по ID
export function ApiGetCategoryById() {
  return applyDecorators(
    ApiTags('Categories'),
    ApiOperation({ summary: 'Получить категорию по ID' }),
    ApiParam({
      name: 'id',
      description: 'UUID категории',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Категория найдена',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'IT и программирование',
          parent: null,
          children: [{ id: 'uuid-2', name: 'Frontend' }],
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}

// Для обновления категории
export function ApiUpdateCategory() {
  return applyDecorators(
    ApiTags('Categories'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Обновить категорию' }),
    ApiParam({
      name: 'id',
      description: 'UUID категории',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'IT и программирование (обновлено)',
            description: 'Новое название категории',
          },
          parentId: {
            type: 'string',
            example: 'uuid-родителя',
            description: 'Новый родитель',
            nullable: true,
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Категория обновлена' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}

// Для удаления категории
export function ApiDeleteCategory() {
  return applyDecorators(
    ApiTags('Categories'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Удалить категорию' }),
    ApiParam({
      name: 'id',
      description: 'UUID категории',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({ status: 200, description: 'Категория удалена' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 403,
      description: 'Недостаточно прав (только ADMIN)',
    }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}
