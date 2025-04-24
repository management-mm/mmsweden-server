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
import { Industry } from 'src/schemas/industry.schema';

import { IndustryService } from './industry.service';
import { UpdateIndustryDto } from './update-industry.dto';

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

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateIndustry(
    @Param('id')
    id: string,
    @Body()
    industry: UpdateIndustryDto
  ): Promise<Industry> {
    return this.industryService.updateById(id, industry);
  }
}
