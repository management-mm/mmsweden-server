import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Counter, CounterSchema } from '../schemas/counters.schema';
import { CountersController } from './counters.controller';
import { CountersService } from './counters.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
  ],
  controllers: [CountersController],
  providers: [CountersService],
  exports: [CountersService],
})
export class CountersModule {}
