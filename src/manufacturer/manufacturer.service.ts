import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Manufacturer } from 'src/schemas/manufacturer.schema';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectModel(Manufacturer.name)
    private manufacturerModel: Model<Manufacturer>
  ) {}

  async findAll(): Promise<Manufacturer[]> {
    return this.manufacturerModel.find().exec();
  }

  async findOrCreate(name: string): Promise<Manufacturer> {
    let manufacturer = await this.manufacturerModel.findOne({ name }).exec();

    if (!manufacturer) {
      manufacturer = new this.manufacturerModel({ name }, { versionKey: false });
      manufacturer.save();
    }

    return manufacturer;
  }
}
