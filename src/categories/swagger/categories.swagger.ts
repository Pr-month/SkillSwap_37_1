import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';

// Для создания категории
export function ApiCreateCategory() {
  return applyDecorators(
    ApiTags('Categories'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Создать новую категорию' }),
    ApiBody({ type: CreateCategoryDto }),
    ApiResponse({
      status: 201,
      description: 'Категория успешно создана',
      type: CategoryResponseDto,
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
      type: [CategoryResponseDto],
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
      type: CategoryResponseDto,
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
    ApiBody({ type: UpdateCategoryDto }),
    ApiResponse({
      status: 200,
      description: 'Категория обновлена',
      type: CategoryResponseDto,
    }),
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
