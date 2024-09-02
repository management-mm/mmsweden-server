import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';
import { Industry } from 'src/schemas/industry.schema';

@Injectable()
export class IndustryService {
  constructor(
    @InjectModel(Industry.name)
    private industryModel: Model<Industry>
  ) {}

  async findAll(): Promise<Industry[]> {
    return this.industryModel.find().exec();
  }

  async findOrCreate(name: MultiLanguageString): Promise<Industry> {
    let industry = await this.industryModel.findOne({ name }).exec();

    if (!industry) {
      industry = new this.industryModel({ name });
      return industry.save();
    }

    return industry;
  }
}
