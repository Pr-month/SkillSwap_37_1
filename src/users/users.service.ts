import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<UserResponseDto[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        birthdate: true,
        city: true,
        gender: true,
        avatar: true,
        role: true,
      },
    });
  }

  async findOne(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Валидация
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Текущий и новый пароль обязательны');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('Новый пароль должен отличаться от текущего');
    }
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.appConfig.hashSalt,
    );

    // Обновляем пароль
    await this.usersRepository.update(id, {
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Пароль успешно изменен',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
