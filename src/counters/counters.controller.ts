import { Controller, Get, Param } from '@nestjs/common';
import { CountersService } from './counters.service';

@Controller('counters')
export class CountersController {
  constructor(private countersService: CountersService) {}

  @Get(':name')
  async getCounter(@Param('name') name: string) {
    const seq = await this.countersService.getCurrentSequence(name);

    return { seq };
  }
}