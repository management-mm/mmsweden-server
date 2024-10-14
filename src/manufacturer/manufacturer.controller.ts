import { Controller, Get, Query } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Manufacturer } from 'src/schemas/manufacturer.schema';

import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Get()
  async getAllManufacturers(
    @Query()
    query: ExpressQuery
  ): Promise<Manufacturer[]> {
    return this.manufacturerService.findAll(query);
  }
}
