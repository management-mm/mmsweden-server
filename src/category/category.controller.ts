import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Category } from 'src/schemas/category.schema';

import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(
    @Query()
    query: ExpressQuery
  ): Promise<Category[]> {
    return this.categoryService.findAll(query);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateCategory(
    @Param('id')
    id: string,
    @Body()
    category: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoryService.updateById(id, category);
  }
}
