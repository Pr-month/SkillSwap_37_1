import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  AuthResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
} from '../dto/auth-response.dto';

// Регистрация
export function ApiRegister() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Регистрация нового пользователя' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно зарегистрирован',
      type: AuthResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Ошибка валидации' }),
    ApiResponse({
      status: 409,
      description: 'Пользователь с таким email уже существует',
    }),
  );
}

// Логин
export function ApiLogin() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Вход в систему' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Успешный вход',
      type: AuthResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Неверный email или пароль' }),
  );
}

// Логаут
export function ApiLogout() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Выход из системы' }),
    ApiResponse({
      status: 200,
      description: 'Успешный выход',
      type: LogoutResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

// Обновление токенов
export function ApiRefresh() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Обновление JWT токенов' }),
    ApiResponse({
      status: 200,
      description: 'Токены успешно обновлены',
      type: RefreshResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Невалидный refresh token' }),
  );
}
