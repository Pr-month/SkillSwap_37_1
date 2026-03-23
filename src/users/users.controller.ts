import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../auth/types/auth.types';
import { ChangePasswordDto } from './dto/user-change-password.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import {
  ApiGetAllUsers,
  ApiGetMe,
  ApiUpdateMe,
  ApiChangePassword,
  ApiGetUserById,
} from './swagger/users.swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiGetAllUsers()
  findAll(
    @Query() paginationDto: PaginationUsersDto,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(paginationDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetMe()
  async getMe(@Request() req: AuthRequest) {
    return this.usersService.findOne(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateMe()
  async updateMe(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiChangePassword()
  async changeMyPassword(
    @Request() req: AuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get(':id')
  @ApiGetUserById()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('by-skill/:id')
  findBySkill(@Param('id') skillId: string) {
    return this.usersService.findUsersBySkill(skillId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
