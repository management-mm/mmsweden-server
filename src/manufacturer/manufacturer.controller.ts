import { Controller, Get } from '@nestjs/common';
import { Manufacturer } from 'src/schemas/manufacturer.schema';

import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Get()
  async getAllManufacturers(): Promise<Manufacturer[]> {
    return this.manufacturerService.findAll();
  }
}
