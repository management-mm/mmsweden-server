import { Controller, Get } from '@nestjs/common';
import { Category } from 'src/schemas/category.schema';

import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.findAll();
  }
}
