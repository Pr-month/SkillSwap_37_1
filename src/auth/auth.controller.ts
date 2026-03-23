import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { AuthRequest, RefreshRequest } from './types/auth.types';
import {
  ApiRegister,
  ApiLogin,
  ApiLogout,
  ApiRefresh,
} from './swagger/auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiRegister()
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiLogout()
  logout(@Req() req: AuthRequest) {
    return this.authService.logout(req.user.sub);
  }

  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @ApiRefresh()
  async refresh(@Request() req: RefreshRequest) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }
}
