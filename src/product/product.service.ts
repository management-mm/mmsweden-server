import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TargetLanguageCode } from 'deepl-node';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import type { SortOrder } from 'mongoose';
import { CategoryService } from 'src/category/category.service';
import { LanguageKeys } from 'src/common/types/language.types';
import { DeepLService } from 'src/deep-l/deep-l.service';
import { IndustryService } from 'src/industry/industry.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { Product } from 'src/schemas/product.schema';
import { UntranslatedProduct } from 'src/schemas/untranslated-product.schema';
import { TranslationService } from 'src/translation/translation.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    private readonly categoryService: CategoryService,
    private readonly manufacturerService: ManufacturerService,
    private readonly industryService: IndustryService,
    private readonly translationService: TranslationService,
  ) {}

  async findAll(query: Query): Promise<{products: Product[], total: number}> {
    
    const perPage = Number(query.perPage) || 15;
    const currentPage = Number(query.page) || 1;
    const skip = perPage * (currentPage - 1);
    const sort: Record<string, SortOrder> = String(query.sort) === 'latest' ? { createdAt: -1 } : {};
    const categories = ensureArray(query.category) 
    const manufacturers = ensureArray(query.manufacturer)
    const industries = ensureArray(query.industry);

    function ensureArray(input) {
      return Array.isArray(input)
      ? input
      : [input];
    }

    const keywordCondition = query.keyword
      ? {
        $or: [
          {
            [`name.${LanguageKeys.EN}`]: {
            $regex: query.keyword,
            $options: 'i',
          }
          },
          {
            idNumber: {
              $regex: `^${query.keyword}`
            }
          }
        ]
      }
      : {};

    const categoryCondition = query.category
      ? {
        $or: categories.map(categoryItem => ({
            [`category.${LanguageKeys.EN}`]: { $regex: categoryItem, $options: 'i' },
          })),
        }
      : {};

    const manufacturerCondition = query.manufacturer
      ? {
        $or: manufacturers.map(manufacturerItem => ({
            'manufacturer': { $regex: manufacturerItem }
          }))
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

    const industryCondition = query.industry
      ? {
        $or: industries.map(industryItem => ({
        'industries': {
          $elemMatch: {
            [`${LanguageKeys.EN}`]: {
              $regex: industryItem,
              $options: 'i'
            }
          }
        }
      }))
        }
      : {};
    
    const conditionsArray = [
      keywordCondition,
      categoryCondition,
      manufacturerCondition,
      industryCondition,
      conditionCondition,
    ];

    const nonEmptyConditions = conditionsArray.filter(cond => Object.keys(cond).length > 0);

    const conditions = nonEmptyConditions.length
      ? { $and: nonEmptyConditions }
      : {};

    const products = await this.productModel
      .find({ ...conditions })
      .limit(perPage)
      .sort(sort)
  .skip(skip);
      
  const totalProducts = await this.productModel.countDocuments({ ...conditions });
    
return {
  products,
  total: totalProducts
    };
  }

  async findRecommendedProductsById(id: string): Promise<Product[]> {
    const product = await this.productModel.findById(id);
    const { category, industries, manufacturer } = product;

    const categoryCondition = {
      [`category.${LanguageKeys.EN}`]: { $regex: category.en, $options: 'i' }
    };

    const manufacturerCondition = {
      'manufacturer': { $regex: manufacturer.replace(/\s+/g, '').replace(/[+]/g, '\\+'), $options: 'i' }
    };

    const industriesCondition = {
      $or: industries.map(industryItem => ({
        'industries': {
          $elemMatch: {
            [`${LanguageKeys.EN}`]: {
              $regex: industryItem.en,
              $options: 'i'
            }
          }
        }
      }))
    };

    const idCondition = {'_id': {$ne: id}}

    const searchConditions = [
      [categoryCondition, manufacturerCondition, industriesCondition, idCondition],
      [categoryCondition, industriesCondition, idCondition],
      [manufacturerCondition, industriesCondition, idCondition],
      [manufacturerCondition, categoryCondition, idCondition],       
      [categoryCondition, idCondition],                        
      [industriesCondition, idCondition],                         
      [manufacturerCondition, idCondition]                     
    ];
  
    const results = await Promise.all(
      searchConditions.map(condition => this.productModel.find({ $and: condition }))
    );

    const allRecommendedProducts = results.flat();

    const uniqueProductsMap = new Map();

    allRecommendedProducts.forEach(product => {
      uniqueProductsMap.set(product._id.toString(), product);
    });

    return Array.from(uniqueProductsMap.values());
  }

  async create(product: UntranslatedProduct): Promise<Product> {
    const targetLanguages: TargetLanguageCode[] = [
      "sv",
      "de",
      "fr",
      "es",
      "ru",
      "uk"
    ];

    const nameTranslations = await this.translationService.translateText(product.name, targetLanguages);
    const descriptionTranslations = await this.translationService.translateText(product.description, targetLanguages);
    const categoryTranslations = await this.translationService.translateText(product.category, targetLanguages);
    const industriesTranslations = await this.translationService.translateIndustries(product.industries, targetLanguages);
    console.log(nameTranslations)

    // const category = await this.categoryService.findOrCreate(product.category);
    // const manufacturer = await this.manufacturerService.findOrCreate(
    //   product.manufacturer
    // );
    // const industryRecords = await Promise.all(
    //   product.industries.map(async industry => {
    //     return this.industryService.findOrCreate(industry);
    //   })
    // );

    // const translatedData = await Promise.all(
    //   ['EN', 'DE', 'FR'].map(lang => this.deepLService.translateText(product.description, lang))
    // );

    const createdProduct = new this.productModel({
      ...product,
      name: nameTranslations,
      description: descriptionTranslations,
      category: categoryTranslations,
      // manufacturer: manufacturer,
      industry: industriesTranslations,
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
