import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/user-change-password.dto';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import { PaginatedUsersResultDto } from './dto/paginated-users-result.dto';
import { UserRole, Gender } from '../users/enums/user.enums';
import { AuthRequest } from '../auth/types/auth.types';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const mockRequest: AuthRequest = {
    user: {
      sub: mockUser.id,
      email: mockUser.email,
    },
  } as AuthRequest;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginationDto: PaginationUsersDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult: PaginatedUsersResultDto = {
        data: [mockUser],
        totalCount: 1,
        page: 1,
        limit: 10,
      };

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(result).toEqual(expectedResult);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty pagination params', async () => {
      const paginationDto: PaginationUsersDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult: PaginatedUsersResultDto = {
        data: [],
        totalCount: 0,
        page: 1,
        limit: 10,
      };

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(result).toEqual(expectedResult);
      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle pagination with custom values', async () => {
      const paginationDto: PaginationUsersDto = {
        page: 2,
        limit: 5,
      };

      const expectedResult: PaginatedUsersResultDto = {
        data: [mockUser],
        totalCount: 6,
        page: 2,
        limit: 5,
      };

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('Пользователь с ID non-existent-id не найден'),
      );

      await expect(controller.getMe(mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('updateMe', () => {
    it('should update current user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
        about: 'Senior developer',
        city: 'San Francisco',
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockRequest, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    });

    it('should handle partial update', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      const updatedUser = {
        ...mockUser,
        name: 'Jane Doe',
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockRequest, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(result?.name).toBe('Jane Doe');
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
    });

    it('should handle update errors', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      mockUsersService.update.mockRejectedValue(
        new NotFoundException('Пользователь не найден'),
      );

      await expect(
        controller.updateMe(mockRequest, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeMyPassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    };

    it('should change user password successfully', async () => {
      const expectedResponse = {
        success: true,
        message: 'Пароль успешно изменен',
      };

      mockUsersService.changePassword.mockResolvedValue(expectedResponse);

      const result = await controller.changeMyPassword(
        mockRequest,
        changePasswordDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      expect(mockUsersService.changePassword).toHaveBeenCalledTimes(1);
    });

    it('should throw error when current password is incorrect', async () => {
      mockUsersService.changePassword.mockRejectedValue(
        new UnauthorizedException('Неверный текущий пароль'),
      );

      await expect(
        controller.changeMyPassword(mockRequest, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
    });

    it('should throw error when passwords are same', async () => {
      const invalidDto: ChangePasswordDto = {
        currentPassword: 'samePassword',
        newPassword: 'samePassword',
      };

      mockUsersService.changePassword.mockRejectedValue(
        new UnauthorizedException('Новый пароль должен отличаться от текущего'),
      );

      await expect(
        controller.changeMyPassword(mockRequest, invalidDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      const userId = 'non-existent-id';

      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException(`Пользователь с ID ${userId} не найден`),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-id';

      mockUsersService.findOne.mockRejectedValue(new Error('Invalid UUID'));

      await expect(controller.findOne(invalidId)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove user by id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResult = 'This action removes a #123 user';

      mockUsersService.remove.mockResolvedValue(expectedResult);

      const result = controller.remove(userId);

      // Используем resolves для проверки Promise
      await expect(result).resolves.toEqual(expectedResult);
      expect(mockUsersService.remove).toHaveBeenCalledWith(+userId);
      expect(mockUsersService.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle string to number conversion', async () => {
      const userId = '123';
      const expectedResult = 'This action removes a #123 user';

      mockUsersService.remove.mockResolvedValue(expectedResult);

      const result = controller.remove(userId);

      await expect(result).resolves.toEqual(expectedResult);
      expect(mockUsersService.remove).toHaveBeenCalledWith(123);
    });
  });

  // Интеграционные сценарии
  describe('Integration scenarios', () => {
    it('should chain multiple service calls correctly', async () => {
      // Получаем пользователя
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const user = await controller.findOne(mockUser.id);
      expect(user).toEqual(mockUser);

      // Обновляем пользователя
      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateDto });
      const updatedUser = await controller.updateMe(mockRequest, updateDto);
      expect(updatedUser?.name).toBe('Updated Name');

      // Проверяем, что все методы были вызваны
      expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
      expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    });
  });
});
