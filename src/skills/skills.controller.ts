import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedSkillsResultDto } from './dto/paginated-skills-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../auth/types/auth.types';
import { UsersService } from 'src/users/users.service';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async addToFavorite(
    @Param('id') skillId: string,
    @Request() req: AuthRequest,
  ) {
    const user = await this.usersService.addFavoriteSkill(
      req.user.sub,
      skillId,
    );

    return {
      message: 'Навык успешно добавлен в избранное',
      favoriteSkills: user.favoriteSkills,
    };
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeFromFavorite(
    @Param('id') skillId: string,
    @Request() req: AuthRequest,
  ) {
    const user = await this.usersService.removeFavoriteSkill(
      req.user.sub,
      skillId,
    );

    return {
      message: 'Навык успешно удален из избранного',
      favoriteSkills: user.favoriteSkills,
    };
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedSkillsResultDto> {
    return this.skillsService.findAll({
      ...paginationDto,
      limit: paginationDto.limit > 10 ? 10 : paginationDto.limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(+id);
  }
}
