import { Controller, Get } from '@nestjs/common';
import { Industry } from 'src/schemas/industry.schema';

import { IndustryService } from './industry.service';

@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Get()
  async getAllIndustries(): Promise<Industry[]> {
    return this.industryService.findAll();
  }
}
