import { Controller, Get, Param, Query } from '@nestjs/common';

import { GetProductCategoriesQueryDto } from './dto/get-product-categories.query.dto';
import { ProductCategoriesService } from './product-categories.service';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService
  ) {}

  @Get()
  findAll(@Query() query: GetProductCategoriesQueryDto) {
    return this.productCategoriesService.findAll(query.activeOnly);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productCategoriesService.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productCategoriesService.findById(id);
  }
}
