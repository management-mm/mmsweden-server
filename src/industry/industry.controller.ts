import { Controller } from '@nestjs/common';
import { IndustryService } from './industry.service';

@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}
}
