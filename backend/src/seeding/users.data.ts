import { Gender } from '../users/enums/user.enums';

// Данные тестовых пользователей
export const testUsers = [
  {
    name: 'Иван Иванов',
    email: 'ivan.ivanov@example.com',
    password: 'Test1234',
    about: 'Люблю программировать и путешествовать',
    city: 'Москва',
    gender: Gender.MALE,
  },
  {
    name: 'Мария Петрова',
    email: 'maria.petrova@example.com',
    password: 'Test1234',
    about: 'Дизайнер, учусь новому',
    city: 'Санкт-Петербург',
    gender: Gender.FEMALE,
  },
  {
    name: 'Алексей Смирнов',
    email: 'alexey.smirnov@example.com',
    password: 'Test1234',
    about: 'Фронтенд-разработчик, увлекаюся игрой на гитаре',
    city: 'Казань',
    gender: Gender.MALE,
  },
  {
    name: 'Елена Соколова',
    email: 'elena.sokolova@example.com',
    password: 'Test1234',
    about: 'Маркетолог, люблю читать и заниматься йогой',
    city: 'Екатеринбург',
    gender: Gender.FEMALE,
  },
];
