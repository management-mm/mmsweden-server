import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import { Manufacturer } from 'src/schemas/manufacturer.schema';
import { Product } from 'src/schemas/product.schema';

import { UpdateManufacturerDto } from './update-manufacturer.dto';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectModel(Manufacturer.name)
    private manufacturerModel: Model<Manufacturer>,
    @InjectModel(Product.name)
    private productModel: Model<Product>
  ) {}

  async findAll(query: Query): Promise<Manufacturer[]> {
    const keywordCondition = query.keyword
      ? {
          name: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};
    return this.manufacturerModel.find(keywordCondition).exec();
  }

  async findOrCreate(name: string): Promise<Manufacturer> {
    if (name === 'Not mentioned') return { name: 'Not mentioned' };
    let manufacturer = await this.manufacturerModel.findOne({ name }).exec();

    if (!manufacturer) {
      manufacturer = new this.manufacturerModel(
        { name },
        { versionKey: false }
      );
      manufacturer.save();
    }

    return manufacturer;
  }

  async updateById(
    id: string,
    manufacturer: UpdateManufacturerDto
  ): Promise<void> {
    const manufacturerName = (await this.manufacturerModel.findById(id)).name;
    await this.manufacturerModel.findByIdAndUpdate(id, {
      $set: {
        name: manufacturer.name,
      },
    });
    const productsToUpdate = await this.productModel.find({
      ['manufacturer']: {
        $regex: manufacturerName,
        $options: 'i',
      },
    });
    await Promise.all(
      productsToUpdate.map(product =>
        this.productModel.findByIdAndUpdate(product._id, {
          $set: { manufacturer: manufacturer.name },
        })
      )
    );
  }

  async deleteByName(name: string): Promise<Manufacturer> {
    return await this.manufacturerModel.findOneAndDelete({
      ['name']: {
        $regex: name,
        $options: 'i',
      },
    });
  }
}
