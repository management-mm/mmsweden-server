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
import { Manufacturer } from 'src/schemas/manufacturer.schema';

import { ManufacturerService } from './manufacturer.service';
import { UpdateManufacturerDto } from './update-manufacturer.dto';

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

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateManufacturer(
    @Param('id')
    id: string,
    @Body()
    manufacturer: UpdateManufacturerDto
  ): Promise<Manufacturer> {
    return this.manufacturerService.updateById(id, manufacturer);
  }
}
