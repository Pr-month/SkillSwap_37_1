import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, Gender } from '../users/enums/user.enums';
import { AuthRequest, RefreshRequest } from './types/auth.types';

const makeAuthRequest = (sub: string, role: UserRole): AuthRequest =>
  ({ user: { sub, email: 'ivan@example.com', role } }) as unknown as AuthRequest;

const makeRefreshRequest = (sub: string, refreshToken: string): RefreshRequest =>
  ({ user: { sub, refreshToken } }) as unknown as RefreshRequest;

describe('AuthController', () => {
  let controller: AuthController;
  let serviceMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    serviceMock = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
    };

    const { AuthService } = await import('./auth.service');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('контроллер должен быть определён', () => {
    expect(controller).toBeDefined();
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

    it('должен вызвать service.register и вернуть результат', async () => {
      const expected = {
        user: { id: 'user-uuid' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      serviceMock.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(serviceMock.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('должен пробросить ошибку от сервиса', async () => {
      serviceMock.register.mockRejectedValue(new Error('ошибка'));

      await expect(controller.register(dto)).rejects.toThrow('ошибка');
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'ivan@example.com',
      password: 'password123',
    };

    it('должен вызвать service.login и вернуть токены', async () => {
      const expected = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      serviceMock.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(serviceMock.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('должен пробросить UnauthorizedException от сервиса', async () => {
      serviceMock.login.mockRejectedValue(
        new UnauthorizedException('Неверный email или пароль'),
      );

      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('должен вызвать service.logout с sub из запроса', async () => {
      const req = makeAuthRequest('user-uuid', UserRole.USER);

      serviceMock.logout.mockResolvedValue(undefined);

      await controller.logout(req);

      expect(serviceMock.logout).toHaveBeenCalledWith('user-uuid');
    });

    it('должен пробросить UnauthorizedException от сервиса', async () => {
      const req = makeAuthRequest('user-uuid', UserRole.USER);

      serviceMock.logout.mockRejectedValue(new UnauthorizedException());

      await expect(controller.logout(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('должен вызвать service.refreshTokens с sub и refreshToken из запроса', async () => {
      const req = makeRefreshRequest('user-uuid', 'raw-refresh-token');
      const expected = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      serviceMock.refreshTokens.mockResolvedValue(expected);

      const result = await controller.refresh(req);

      expect(serviceMock.refreshTokens).toHaveBeenCalledWith(
        'user-uuid',
        'raw-refresh-token',
      );
      expect(result).toEqual(expected);
    });

    it('должен пробросить UnauthorizedException от сервиса', async () => {
      const req = makeRefreshRequest('user-uuid', 'invalid-token');

      serviceMock.refreshTokens.mockRejectedValue(new UnauthorizedException());

      await expect(controller.refresh(req)).rejects.toThrow(UnauthorizedException);
    });
  });
});