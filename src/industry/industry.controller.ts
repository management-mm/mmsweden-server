import { Controller, Get, Query } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Industry } from 'src/schemas/industry.schema';

import { IndustryService } from './industry.service';

@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Get()
  async getAllIndustries(
    @Query()
    query: ExpressQuery
  ): Promise<Industry[]> {
    return this.industryService.findAll(query);
  }
}
