import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  SeoCategory,
  SeoCategoryDocument,
} from 'src/schemas/seo-category.schema';

@Injectable()
export class SeoCategoriesService {
  constructor(
    @InjectModel(SeoCategory.name)
    private readonly seoCategoryModel: Model<SeoCategoryDocument>
  ) {}

  async findTopLevel(activeOnly = true) {
    const filter: FilterQuery<SeoCategoryDocument> = {
      parentId: null,
    };

    if (activeOnly) {
      filter.isActive = true;
    }

    return this.seoCategoryModel
      .find(filter)
      .sort({ sortOrder: 1, 'name.en': 1 })
      .lean();
  }

  async findChildren(parentId: string, activeOnly = true) {
    const filter: FilterQuery<SeoCategoryDocument> = {
      parentId: new Types.ObjectId(parentId),
    };

    if (activeOnly) {
      filter.isActive = true;
    }

    return this.seoCategoryModel
      .find(filter)
      .sort({ sortOrder: 1, 'name.en': 1 })
      .lean();
  }

  async findBySlug(slug: string) {
    const category = await this.seoCategoryModel.findOne({ slug }).lean();

    if (!category) {
      throw new NotFoundException(`SEO category with slug "${slug}" not found`);
    }

    return category;
  }

  async findSubcategoryByPath(parentSlug: string, childSlug: string) {
    const parent = await this.seoCategoryModel.findOne({
      slug: parentSlug,
      parentId: null,
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent category with slug "${parentSlug}" not found`
      );
    }

    const child = await this.seoCategoryModel
      .findOne({
        slug: childSlug,
        parentId: parent._id,
      })
      .lean();

    if (!child) {
      throw new NotFoundException(
        `Subcategory "${childSlug}" under "${parentSlug}" not found`
      );
    }

    return child;
  }

  async findTree(activeOnly = true) {
    const filter: FilterQuery<SeoCategoryDocument> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    const categories = await this.seoCategoryModel
      .find(filter)
      .sort({ sortOrder: 1, 'name.en': 1 })
      .lean();

    const topLevel = categories.filter(item => item.parentId === null);
    const children = categories.filter(item => item.parentId !== null);

    return topLevel.map(parent => ({
      ...parent,
      subcategories: children.filter(
        child => String(child.parentId) === String(parent._id)
      ),
    }));
  }
}
