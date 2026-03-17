import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { appConfig, AppConfig } from 'src/config/app.config';
import { Skill } from 'src/skills/entities/skill.entity';
import { PaginatedUsersResultDto } from './dto/paginated-users-result.dto';
import { PaginationUsersDto } from './dto/pagination-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly appConfig: AppConfig,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(
    paginationDto: PaginationUsersDto,
  ): Promise<PaginatedUsersResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit;
    const { page, limit } = paginationDto;

    const query = this.usersRepository.createQueryBuilder('user');

    query.orderBy('user.name');

    const [users, totalCount] = await query
      .skip(skippedItems)
      .take(paginationDto.limit)
      .getManyAndCount();

    const lastPage = Math.ceil(totalCount / limit);

    if (page > lastPage) {
      throw new NotFoundException(
        `Страница ${page} не найдена. Всего страниц: ${lastPage}`,
      );
    }

    return {
      totalCount,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: users,
    };
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
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
      throw new BadRequestException(
        'Новый пароль должен отличаться от текущего',
      );
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

  async addFavoriteSkill(userId: string, skillId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.favoriteSkills.some((skill) => skill.id === skillId)) {
      throw new ConflictException('Навык уже добавлен в избранное');
    }

    user.favoriteSkills.push({ id: skillId } as Skill);
    await this.usersRepository.save(user);

    return user;
  }

  async removeFavoriteSkill(userId: string, skillId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const exists = user.favoriteSkills.some((skill) => skill.id === skillId);

    if (!exists) {
      throw new NotFoundException('Навык не найден в избранном');
    }

    user.favoriteSkills = user.favoriteSkills.filter(
      (skill) => skill.id !== skillId,
    );

    await this.usersRepository.save(user);

    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
