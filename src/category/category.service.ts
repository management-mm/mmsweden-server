import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';
import { Category } from 'src/schemas/category.schema';
import { Product } from 'src/schemas/product.schema';
import { TranslationService } from 'src/translation/translation.service';

import { UpdateCategoryDto } from './update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    private readonly translationService: TranslationService
  ) {}

  async findAll(query: Query): Promise<Category[]> {
    const lang: LanguageKeys = query.lang as LanguageKeys;
    const keywordCondition =
      query.keyword && query.lang
        ? {
            [`name.${lang}`]: {
              $regex: query.keyword,
              $options: 'i',
            },
          }
        : {};
    return this.categoryModel.find(keywordCondition).exec();
  }

  async findOrCreate(
    name: string,
    sourceLanguage: 'sv' | 'en'
  ): Promise<Category> {
    let category = await this.categoryModel
      .findOne({ [`name.${sourceLanguage}`]: name })
      .exec();

    if (!category) {
      const categoryTranslations = await this.translationService.translateText(
        name,
        sourceLanguage
      );
      category = new this.categoryModel(
        { name: categoryTranslations },
        { versionKey: false }
      );
      category.save();
    }

    return category;
  }

  async updateById(id: string, categoryDto: UpdateCategoryDto): Promise<void> {
    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) return;

    await this.categoryModel.findByIdAndUpdate(id, {
      $set: { name: categoryDto.name },
    });

    const productsToUpdate = await this.productModel.find({
      [`category.${LanguageKeys.EN}`]: {
        $regex: oldCategory.name.en,
        $options: 'i',
      },
    }).limit(50);

    await Promise.all(
      productsToUpdate.map(product =>
        this.productModel.findByIdAndUpdate(product._id, {
          $set: { category: categoryDto.name },
        })
      )
    );
  }

  async deleteByName(name: MultiLanguageString): Promise<Category> {
    return await this.categoryModel.findOneAndDelete({
      [`name.${LanguageKeys.EN}`]: {
        $regex: name.en,
        $options: 'i',
      },
    });
  }
}
