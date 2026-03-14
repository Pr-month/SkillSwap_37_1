import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/auth/types/auth.types';
import {
  ApiCreateCategory,
  ApiGetAllCategories,
  ApiGetCategoryById,
  ApiUpdateCategory,
  ApiDeleteCategory,
} from './swagger/categories.swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // мне кажется сюда тоже нужно добавить гарду - @UseGuards(JwtAuthGuard)
  @ApiCreateCategory()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiGetAllCategories()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiGetCategoryById()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  // и сюда тоже можно добавить - @UseGuards(JwtAuthGuard)
  @ApiUpdateCategory()
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDeleteCategory()
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.categoriesService.remove(id, req.user.role);
  }
}
