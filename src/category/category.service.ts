import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';
import { Category } from 'src/schemas/category.schema';
import { TranslationService } from 'src/translation/translation.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
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

  async deleteByName(name: MultiLanguageString): Promise<Category> {
    return await this.categoryModel.findOneAndDelete({
      [`name.${LanguageKeys.EN}`]: {
        $regex: name.en,
        $options: 'i',
      },
    });
  }
}
