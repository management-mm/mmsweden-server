import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  ProductCategory,
  ProductCategoryDocument,
} from 'src/schemas/product-category.schema';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategoryDocument>
  ) {}

  async findAll(activeOnly = true) {
    const filter: FilterQuery<ProductCategoryDocument> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    return this.productCategoryModel
      .find(filter)
      .sort({ sortOrder: 1, 'name.en': 1 })
      .lean();
  }

  async findById(id: string) {
    const category = await this.productCategoryModel.findById(id).lean();

    if (!category) {
      throw new NotFoundException(`Product category with id "${id}" not found`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.productCategoryModel.findOne({ slug }).lean();

    if (!category) {
      throw new NotFoundException(
        `Product category with slug "${slug}" not found`
      );
    }

    return category;
  }
}
