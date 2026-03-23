import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SkillResponseDto } from '../dto/skill-response.dto';
import { PaginatedSkillsResponseDto } from '../dto/paginated-skills-response.dto';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { UpdateSkillDto } from '../dto/update-skill.dto';

// Создание навыка
export function ApiCreateSkill() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Создать новый навык' }),
    ApiBody({ type: CreateSkillDto }),
    ApiResponse({
      status: 201,
      description: 'Навык успешно создан',
      type: SkillResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Ошибка валидации' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

// Получить все навыки (с пагинацией и поиском)
export function ApiGetAllSkills() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiOperation({ summary: 'Получить все навыки с пагинацией и поиском' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      example: 'Frontend',
    }),
    ApiResponse({
      status: 200,
      description: 'Список навыков',
      type: PaginatedSkillsResponseDto,
    }),
  );
}

// Добавить в избранное
export function ApiAddToFavorite() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Добавить навык в избранное' }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 201,
      description: 'Навык добавлен в избранное',
      schema: {
        example: {
          message: 'Навык успешно добавлен в избранное',
          favoriteSkills: [{ id: 'uuid', title: 'Frontend разработка' }],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
    ApiResponse({ status: 409, description: 'Навык уже в избранном' }),
  );
}

// Удалить из избранного
export function ApiRemoveFromFavorite() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Удалить навык из избранного' }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Навык удален из избранного',
      schema: {
        example: {
          message: 'Навык успешно удален из избранного',
          favoriteSkills: [],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 404, description: 'Навык не найден в избранном' }),
  );
}

// Получить навык по ID
export function ApiGetSkillById() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiOperation({ summary: 'Получить навык по ID' }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Навык найден',
      type: SkillResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
  );
}

// Обновить навык
export function ApiUpdateSkill() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Обновить навык' }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiBody({ type: UpdateSkillDto }),
    ApiResponse({
      status: 200,
      description: 'Навык обновлен',
      type: SkillResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 403,
      description: 'Можно обновлять только свои навыки',
    }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
  );
}

// Удалить навык
export function ApiDeleteSkill() {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Удалить навык' }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({ status: 200, description: 'Навык удален' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 403,
      description: 'Можно удалять только свои навыки',
    }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
  );
}
