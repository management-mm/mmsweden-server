import { Controller, Get, Query } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Category } from 'src/schemas/category.schema';

import { CategoryService } from './category.service';

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
}
