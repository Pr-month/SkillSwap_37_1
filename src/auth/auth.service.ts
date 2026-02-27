
import {
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { appConfig, AppConfig } from '../config/app.config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(appConfig.KEY)
    private readonly appConfig: AppConfig,
  ) {}

  async register(registerDto: RegisterDto) {
    const salt = this.appConfig.hashSalt;
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
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
