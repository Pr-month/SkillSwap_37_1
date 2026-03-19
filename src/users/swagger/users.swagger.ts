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
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginatedUsersResponseDto } from '../dto/paginated-users-response.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/user-change-password.dto';

// Получить всех пользователей (с пагинацией)
export function ApiGetAllUsers() {
  return applyDecorators(
    ApiTags('Users'),
    ApiOperation({ summary: 'Получить всех пользователей с пагинацией' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiResponse({
      status: 200,
      description: 'Список пользователей',
      type: PaginatedUsersResponseDto,
    }),
  );
}

// Получить текущего пользователя
export function ApiGetMe() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Получить информацию о текущем пользователе' }),
    ApiResponse({
      status: 200,
      description: 'Информация о пользователе',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

// Обновить текущего пользователя
export function ApiUpdateMe() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Обновить информацию о текущем пользователе' }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: 200,
      description: 'Пользователь обновлен',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
  );
}

// Сменить пароль
export function ApiChangePassword() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Сменить пароль' }),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Пароль успешно изменен',
      schema: {
        example: {
          success: true,
          message: 'Пароль успешно изменен',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Ошибка валидации' }),
    ApiResponse({ status: 401, description: 'Неверный текущий пароль' }),
  );
}

// Получить пользователя по ID
export function ApiGetUserById() {
  return applyDecorators(
    ApiTags('Users'),
    ApiOperation({ summary: 'Получить пользователя по ID' }),
    ApiParam({
      name: 'id',
      description: 'UUID пользователя',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Пользователь найден',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
  );
}
