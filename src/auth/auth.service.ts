import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { appConfig, AppConfig } from '../config/app.config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(appConfig.KEY)
    private readonly appConfig: AppConfig,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async register(registerDto: RegisterDto) {
    try {
      const salt = this.appConfig.hashSalt;
      const hashedPassword = await bcrypt.hash(registerDto.password, salt);

      const newUser = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });

      const tokens = await this.generateTokens({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        user: newUser,
        ...tokens,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password, refreshToken, ...result } = user;
    return result;
  }
}
