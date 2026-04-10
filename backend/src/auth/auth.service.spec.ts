import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { appConfig } from '../config/app.config';
import { jwtConfig } from '../config/jwt.config';
import { UserRole, Gender } from '../users/enums/user.enums';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE_SPEC';

const mockUsersService = () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  updateRefreshToken: jest.fn(),
});

const mockJwtService = () => ({
  signAsync: jest.fn(),
});

const mockAppConfig = { hashSalt: 10 };

const mockJwtConfig = {
  secret: 'test-secret',
  refreshSecret: 'test-refresh-secret',
  expiresIn: '15m',
  refreshExpiresIn: '7d',
};

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-uuid',
  name: 'Иван Петров',
  email: 'ivan@example.com',
  password: 'hashed-password',
  role: UserRole.USER,
  refreshToken: 'hashed-refresh-token',
  birthdate: new Date('1990-01-01'),
  gender: Gender.MALE,
  city: 'Москва',
  about: 'О себе',
  avatar: 'avatar.jpg',
  skills: [],
  favoriteSkills: [],
  ...overrides,
});

describe('AuthService', () => {
  let module: TestingModule;
  let usersService: ReturnType<typeof mockUsersService>;
  let jwtService: ReturnType<typeof mockJwtService>;

  beforeEach(async () => {
    const { AuthService } = await import('./auth.service');

    module = await Test.createTestingModule({
      providers: [
        { provide: AUTH_SERVICE_TOKEN, useClass: AuthService },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: appConfig.KEY, useValue: mockAppConfig },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
      ],
    }).compile();

    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  const getService = () => module.get(AUTH_SERVICE_TOKEN);

  it('сервис должен быть определён', () => {
    expect(getService()).toBeDefined();
  });

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      password: 'password123',
      birthdate: new Date('1990-01-01'),
      gender: Gender.MALE,
      city: 'Москва',
      about: 'О себе',
      avatar: 'avatar.jpg',
    };

    it('должен зарегистрировать пользователя и вернуть токены', async () => {
      const user = makeUser();

      usersService.create.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await getService().register(dto);

      expect(usersService.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('должен хешировать пароль перед сохранением', async () => {
      const user = makeUser();

      usersService.create.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      await getService().register(dto);

      const createCallArg = usersService.create.mock.calls[0][0];
      expect(createCallArg.password).not.toBe(dto.password);
    });

    it('должен выбросить ConflictException при дублировании email', async () => {
      usersService.create.mockRejectedValue({ code: '23505' });

      await expect(getService().register(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('должен пробросить неизвестную ошибку без изменений', async () => {
      const error = new Error('Неизвестная ошибка');
      usersService.create.mockRejectedValue(error);

      await expect(getService().register(dto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'ivan@example.com',
      password: 'password123',
    };

    it('должен выполнить вход и вернуть токены', async () => {
      const user = makeUser({
        password: await bcrypt.hash('password123', 10),
      });

      usersService.findByEmail.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await getService().login(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(getService().login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException при неверном пароле', async () => {
      const user = makeUser({
        password: await bcrypt.hash('other-password', 10),
      });

      usersService.findByEmail.mockResolvedValue(user);

      await expect(getService().login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('должен очистить refresh token пользователя', async () => {
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      await getService().logout('user-uuid');

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-uuid',
        null,
      );
    });
  });

  describe('refreshTokens', () => {
    it('должен обновить токены при валидном refresh token', async () => {
      const rawRefreshToken = 'raw-refresh-token';
      const user = makeUser({
        refreshToken: await bcrypt.hash(rawRefreshToken, 10),
      });

      usersService.findOne.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await getService().refreshTokens(
        'user-uuid',
        rawRefreshToken,
      );

      expect(result).toMatchObject({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(
        getService().refreshTokens('bad-uuid', 'some-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('должен выбросить UnauthorizedException если refreshToken у пользователя отсутствует', async () => {
      usersService.findOne.mockResolvedValue(
        makeUser({ refreshToken: null as unknown as string }),
      );

      await expect(
        getService().refreshTokens('user-uuid', 'some-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('должен выбросить UnauthorizedException если refresh token не совпадает', async () => {
      const user = makeUser({
        refreshToken: await bcrypt.hash('correct-token', 10),
      });

      usersService.findOne.mockResolvedValue(user);

      await expect(
        getService().refreshTokens('user-uuid', 'wrong-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
