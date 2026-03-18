import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Counter, CounterDocument } from '../schemas/counters.schema';

@Injectable()
export class CountersService {
  constructor(
    @InjectModel(Counter.name)
    private counterModel: Model<CounterDocument>
  ) {}

  async getCurrentSequence(name: string): Promise<number> {
    const counter = await this.counterModel.findOne({ _id: name });

    return counter?.seq ?? 0;
  }

  async getNextSequence(name: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    return counter.seq;
  }

  async updateSequence(name: string, seq: number) {
    const counter = await this.counterModel.findOneAndUpdate(
      { name },
      { seq },
      { new: true, upsert: true }
    );

    return counter.seq;
  }
}
