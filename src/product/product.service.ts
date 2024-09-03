import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import type { SortOrder } from 'mongoose';
import { CategoryService } from 'src/category/category.service';
import { LanguageKeys } from 'src/common/types/language.types';
import { IndustryService } from 'src/industry/industry.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { Product } from 'src/schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    private readonly categoryService: CategoryService,
    private readonly manufacturerService: ManufacturerService,
    private readonly industryService: IndustryService
  ) {}

  async findAll(query: Query): Promise<Product[]> {
    
    const perPage = Number(query.perPage) || 15;
    const currentPage = Number(query.page) || 1;
    const skip = perPage * (currentPage - 1);
    const sort: Record<string, SortOrder> = String(query.sort) === 'latest' ? { createdAt: -1 } : {};

    const keywordCondition = query.keyword
      ? {
          $or: Object.values(LanguageKeys).map(key => ({
            [`name.${key}`]: { $regex: query.keyword, $options: 'i' },
          })),
        }
      : {};

    const categoryCondition = query.category
      ? {
          $or: Object.values(LanguageKeys).map(key => ({
            [`category.${key}`]: { $regex: query.category, $options: 'i' },
          })),
        }
      : {};

    const manufacturerCondition = query.manufacturer
      ? {
          manufacturer: {
            $regex: query.manufacturer,
            $options: 'i',
          },
        }
      : {};

    const idNumberCondition = query.idNumber
      ? {
          idNumber: {
            $regex: query.idNumber,
            $options: 'i',
          },
        }
      : {};

    const conditionCondition = query.condition
      ? {
          condition: {
            $regex: query.condition,
            $options: 'i',
          },
        }
      : {};

    const industries = Array.isArray(query.industry)
      ? query.industry
      : [query.industry];

    const validIndustries = industries.filter(
      (industryItem): industryItem is string => typeof industryItem === 'string'
    );

    const industryCondition = validIndustries.length
      ? {
          $and: validIndustries.map(industryItem => ({
            industry: {
              $elemMatch: {
                $or: Object.values(LanguageKeys).map(key => ({
                  [key]: { $regex: industryItem, $options: 'i' },
                })),
              },
            },
          })),
        }
      : {};

    const conditions = {
      ...keywordCondition,
      ...idNumberCondition,
      ...categoryCondition,
      ...manufacturerCondition,
      ...industryCondition,
      ...conditionCondition,
    };

    const products = await this.productModel
      .find({ ...conditions })
      .limit(perPage)
      .sort(sort)
      .skip(skip);
    return products;
  }

  async create(product: Product): Promise<Product> {
    const category = await this.categoryService.findOrCreate(product.category);
    const manufacturer = await this.manufacturerService.findOrCreate(
      product.manufacturer
    );
    const industryRecords = await Promise.all(
      product.industry.map(async industry => {
        return this.industryService.findOrCreate(industry);
      })
    );
    const createdProduct = new this.productModel({
      ...product,
      category: category,
      manufacturer: manufacturer,
      industry: industryRecords,
    });

    return createdProduct.save();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateById(id: string, product: Product): Promise<Product> {
    return await this.productModel.findByIdAndUpdate(id, product, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<Product> {
    return await this.productModel.findByIdAndDelete(id);
  }
}
