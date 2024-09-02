import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';
import { Category } from 'src/schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOrCreate(name: MultiLanguageString): Promise<Category> {
    let category = await this.categoryModel.findOne({ name }).exec();

    if (!category) {
      category = new this.categoryModel({ name });
      return category.save();
    }

    return category;
  }
}
