import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CountersService } from './counters.service';
import { UpdateCounterDto } from './dto/update-counter.dto';

@Controller('counters')
export class CountersController {
  constructor(private countersService: CountersService) {}

  @Get(':name')
  @UseGuards(AuthGuard('jwt'))
  async getCounter(@Param('name') name: string) {
    const seq = await this.countersService.getCurrentSequence(name);
    return { seq };
  }

  @Patch(':name')
  @UseGuards(AuthGuard('jwt'))
  async updateCounter(
    @Param('name') name: string,
    @Body() dto: UpdateCounterDto
  ) {
    const updated = await this.countersService.updateSequence(name, dto.seq);

    return { seq: updated };
  }
}
