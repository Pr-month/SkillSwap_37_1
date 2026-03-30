import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Request, Get, Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { YandexAuthGuard } from 'src/auth/guards/yandex-auth.guard';

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

  @Get('yandex/login')
  @UseGuards(YandexAuthGuard)
  oauthLoginYandex() {}

  @Get('yandex/callback')
  @UseGuards(YandexAuthGuard)
  async oauthYandexCallback(@Req() req, @Res() res:Response) {
    const user = req.user

    const tokens = await this.authService.loginOAuth(user);

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
