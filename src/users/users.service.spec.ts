import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import { UserRole, Gender } from '../users/enums/user.enums';
import * as bcrypt from 'bcrypt';
import { appConfig, AppConfig } from 'src/config/app.config';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Skill } from 'src/skills/entities/skill.entity';

// Мокаем bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    about: 'Software developer',
    birthdate: new Date('1990-01-01'),
    city: 'New York',
    gender: Gender.MALE,
    avatar: 'avatar.jpg',
    role: UserRole.USER,
    refreshToken: null,
    skills: [],
    favoriteSkills: [],
  };

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAppConfig: AppConfig = {
    port: 3000,
    hashSalt: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: appConfig.KEY,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersRepository.create.mockReturnValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginationDto: PaginationUsersDto = {
        page: 1,
        limit: 10,
      };

      const mockUsers = [mockUser];
      const mockTotalCount = 1;

      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockUsers, mockTotalCount]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual({
        totalCount: mockTotalCount,
        page: paginationDto.page,
        limit: paginationDto.limit,
        data: mockUsers,
      });
      expect(mockUsersRepository.createQueryBuilder).toHaveBeenCalledWith(
        'user',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.name');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(paginationDto.limit);
    });

    it('should throw NotFoundException when page exceeds last page', async () => {
      const paginationDto: PaginationUsersDto = {
        page: 5,
        limit: 10,
      };

      const mockTotalCount = 20;
      const mockUsers = [];

      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockUsers, mockTotalCount]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.findAll(paginationDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Пользователь с ID non-existent-id не найден',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should return null when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('should update user refresh token', async () => {
      const refreshToken = 'new-refresh-token';
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateRefreshToken(mockUser.id, refreshToken);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, {
        refreshToken,
      });
    });

    it('should set refresh token to null', async () => {
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateRefreshToken(mockUser.id, null);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, {
        refreshToken: null,
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
        city: 'San Francisco',
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockUsersRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockUsersRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toBeDefined();
      expect(result).toEqual(updatedUser);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found during update', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      // Мокаем update, чтобы он вернул affected: 0
      mockUsersRepository.update.mockResolvedValue({ affected: 0 } as any);
      // Мокаем findOne, чтобы он вернул null (пользователь не найден)
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUser.id, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword456';

    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockReset();
      (bcrypt.hash as jest.Mock).mockReset();
    });

    it('should change password successfully', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedOldPassword',
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.changePassword(
        mockUser.id,
        currentPassword,
        newPassword,
      );

      expect(result).toEqual({
        success: true,
        message: 'Пароль успешно изменен',
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: ['id', 'password'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        'hashedOldPassword',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        newPassword,
        mockAppConfig.hashSalt,
      );
      expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: 'hashedNewPassword',
      });
    });

    it('should throw BadRequestException when passwords are missing', async () => {
      await expect(
        service.changePassword(mockUser.id, '', newPassword),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.changePassword(mockUser.id, currentPassword, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when new password equals current password', async () => {
      await expect(
        service.changePassword(mockUser.id, currentPassword, currentPassword),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(mockUser.id, currentPassword, currentPassword),
      ).rejects.toThrow('Новый пароль должен отличаться от текущего');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent-id', currentPassword, newPassword),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedOldPassword',
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, 'wrongPassword', newPassword),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword(mockUser.id, 'wrongPassword', newPassword),
      ).rejects.toThrow('Неверный текущий пароль');
    });
  });

  describe('addFavoriteSkill', () => {
    const skillId = 'skill-1';

    it('should add favorite skill successfully', async () => {
      const userWithoutFavorite = {
        ...mockUser,
        favoriteSkills: [],
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithoutFavorite);
      mockUsersRepository.save.mockResolvedValue({
        ...userWithoutFavorite,
        favoriteSkills: [{ id: skillId }],
      });

      const result = await service.addFavoriteSkill(mockUser.id, skillId);

      expect(result.favoriteSkills).toHaveLength(1);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['favoriteSkills'],
      });
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addFavoriteSkill('non-existent-id', skillId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when skill already in favorites', async () => {
      const userWithFavorite = {
        ...mockUser,
        favoriteSkills: [{ id: skillId } as Skill],
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithFavorite);

      await expect(
        service.addFavoriteSkill(mockUser.id, skillId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addFavoriteSkill(mockUser.id, skillId),
      ).rejects.toThrow('Навык уже добавлен в избранное');
    });
  });

  describe('removeFavoriteSkill', () => {
    const skillId = 'skill-1';

    it('should remove favorite skill successfully', async () => {
      const userWithFavorite = {
        ...mockUser,
        favoriteSkills: [{ id: skillId } as Skill],
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithFavorite);
      mockUsersRepository.save.mockResolvedValue({
        ...userWithFavorite,
        favoriteSkills: [],
      });

      const result = await service.removeFavoriteSkill(mockUser.id, skillId);

      expect(result.favoriteSkills).toHaveLength(0);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['favoriteSkills'],
      });
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeFavoriteSkill('non-existent-id', skillId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when skill not in favorites', async () => {
      const userWithoutFavorite = {
        ...mockUser,
        favoriteSkills: [],
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithoutFavorite);

      await expect(
        service.removeFavoriteSkill(mockUser.id, skillId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.removeFavoriteSkill(mockUser.id, skillId),
      ).rejects.toThrow('Навык не найден в избранном');
    });
  });

  describe('remove', () => {
    it('should return removal message', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a user');
    });
  });
});
