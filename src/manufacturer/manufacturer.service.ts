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
    manufacturerDto: UpdateManufacturerDto
  ): Promise<Manufacturer | null> {
    const oldManufacturer = await this.manufacturerModel.findById(id);
    if (!oldManufacturer) return null;

    const updatedManufacturer = await this.manufacturerModel.findByIdAndUpdate(
      id,
      { $set: { name: manufacturerDto.name } },
      { new: true }
    );

    if (!updatedManufacturer) return null;

    let skip = 0;
    const limit = 50;
    let productsToUpdate;

    do {
      productsToUpdate = await this.productModel
        .find({
          manufacturer: oldManufacturer.name,
        })
        .skip(skip)
        .limit(limit)
        .lean();

      const bulkOperations = productsToUpdate.map(product => ({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { manufacturer: manufacturerDto.name } },
        },
      }));

      if (bulkOperations.length > 0) {
        await this.productModel.bulkWrite(bulkOperations);
      }

      skip += limit;
    } while (productsToUpdate.length === limit);

    return updatedManufacturer;
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
