export const ERROR_MESSAGES = {
  ENTITY_NOT_FOUND: 'Сущность не найдена',
  DUPLICATE: 'Запись с такими данными уже существует',
  FILE_TOO_LARGE: 'Слишком большой файл',
  INTERNAL: 'Internal server error',
  USER_NOT_FOUND: 'Пользователь не найден',
  REQUESTED_SKILL_NOT_FOUND: 'Запрашиваемый навык не найден',
  OFFERED_SKILL_NOT_FOUND: 'Предлагаемый навык не найден',
  REQUESTED_SKILL_OWNER_MISSING: 'У запрашиваемого навыка отсутствует владелец',
  OFFERED_SKILL_NOT_OWNED: 'Нельзя предлагать навык другого пользователя',
  CANNOT_SEND_REQUEST_TO_SELF: 'Нельзя отправить заявку самому себе',
} as const;
