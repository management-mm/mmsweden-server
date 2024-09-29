import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/category.schema';
import { TranslationService } from 'src/translation/translation.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
    private readonly translationService: TranslationService,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOrCreate(name: string, sourceLanguage: 'sv' | 'en'): Promise<Category> {
    let category = await this.categoryModel.findOne({ [`name.${sourceLanguage}`]: name }).exec();

    if (!category) {
      const categoryTranslations = await this.translationService.translateText(name, sourceLanguage);
      category = new this.categoryModel({ name: categoryTranslations }, { versionKey: false });
      category.save();
    }

    return category;
  }
}
