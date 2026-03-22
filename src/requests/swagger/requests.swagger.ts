import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequestResponseDto } from '../dto/request-response.dto';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';

// Создание запроса
export function ApiCreateRequest() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Создать новый запрос на обмен навыками' }),
    ApiBody({ type: CreateRequestDto }),
    ApiResponse({
      status: 201,
      description: 'Запрос успешно создан',
      type: RequestResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации или нельзя создать запрос самому себе',
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 403,
      description: 'Предлагаемый навык не принадлежит пользователю',
    }),
    ApiResponse({
      status: 404,
      description: 'Навык или пользователь не найден',
    }),
  );
}

// Получить входящие запросы
export function ApiGetIncomingRequests() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Получить входящие запросы (запросы ко мне)' }),
    ApiResponse({
      status: 200,
      description: 'Список входящих запросов',
      type: [RequestResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

// Получить исходящие запросы
export function ApiGetOutgoingRequests() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Получить исходящие запросы (мои запросы)' }),
    ApiResponse({
      status: 200,
      description: 'Список исходящих запросов',
      type: [RequestResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

// Получить все запросы (админ)
export function ApiGetAllRequests() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({
      summary: 'Получить все запросы (только для администратора)',
    }),
    ApiResponse({
      status: 200,
      description: 'Список всех запросов',
      type: [RequestResponseDto],
    }),
    ApiResponse({ status: 403, description: 'Доступ запрещен' }),
  );
}

// Получить запрос по ID
export function ApiGetRequestById() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({ summary: 'Получить запрос по ID' }),
    ApiParam({
      name: 'id',
      description: 'UUID запроса',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Запрос найден',
      type: RequestResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Запрос не найден' }),
  );
}

// Обновить статус запроса
export function ApiUpdateRequestStatus() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Обновить статус запроса (принять/отклонить)' }),
    ApiParam({
      name: 'id',
      description: 'UUID запроса',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiBody({ type: UpdateRequestStatusDto }),
    ApiResponse({
      status: 200,
      description: 'Статус запроса обновлен',
      type: RequestResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 403,
      description: 'Обновлять статус может только получатель запроса',
    }),
    ApiResponse({ status: 404, description: 'Запрос не найден' }),
  );
}

// Удалить запрос
export function ApiDeleteRequest() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Удалить запрос (только отправитель или админ)' }),
    ApiParam({
      name: 'id',
      description: 'UUID запроса',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({ status: 200, description: 'Запрос удален' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({
      status: 403,
      description: 'Удалять можно только свои исходящие запросы',
    }),
    ApiResponse({ status: 404, description: 'Запрос не найден' }),
  );
}
