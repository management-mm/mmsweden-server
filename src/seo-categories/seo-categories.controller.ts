import { Controller, Get, Param, Query } from '@nestjs/common';

import { GetSeoCategoriesQueryDto } from './dto/get-seo-categories.query.dto';
import { SeoCategoriesService } from './seo-categories.service';

@Controller('seo-categories')
export class SeoCategoriesController {
  constructor(private readonly seoCategoriesService: SeoCategoriesService) {}

  @Get()
  findTopLevel(@Query() query: GetSeoCategoriesQueryDto) {
    return this.seoCategoriesService.findTopLevel(query.activeOnly);
  }

  @Get('tree')
  findTree(@Query() query: GetSeoCategoriesQueryDto) {
    return this.seoCategoriesService.findTree(query.activeOnly);
  }

  @Get('parent/:parentId/children')
  findChildren(
    @Param('parentId') parentId: string,
    @Query() query: GetSeoCategoriesQueryDto
  ) {
    return this.seoCategoriesService.findChildren(parentId, query.activeOnly);
  }

  @Get(':parentSlug/:childSlug')
  findSubcategoryByPath(
    @Param('parentSlug') parentSlug: string,
    @Param('childSlug') childSlug: string
  ) {
    return this.seoCategoriesService.findSubcategoryByPath(
      parentSlug,
      childSlug
    );
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.seoCategoriesService.findBySlug(slug);
  }
}
