import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import type { SortOrder } from 'mongoose';
import { CategoryService } from 'src/category/category.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';
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
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async findAll(query: Query): Promise<{ products: Product[]; total: number }> {
    const perPage = Number(query.perPage) || 16;
    const currentPage = Number(query.page) || 1;
    const skip = perPage * (currentPage - 1);
    const sort: Record<string, SortOrder> =
      String(query.sort) === 'latest' ? { createdAt: -1 } : {};
    const categories = ensureArray(query.category);
    const manufacturers = ensureArray(query.manufacturer);
    const industries = ensureArray(query.industry);

    function ensureArray(input) {
      return Array.isArray(input) ? input : [input];
    }

    const languages = Object.values(LanguageKeys);

    const keywordCondition = query.keyword
      ? {
          $or: [
            ...languages.map(lang => ({
              [`name.${lang}`]: {
                $regex: query.keyword,
                $options: 'i',
              },
            })),
            {
              name: {
                $regex: query.keyword,
                $options: 'i',
              },
            },
            {
              idNumber: {
                $regex: `^${query.keyword}`,
              },
            },
          ],
        }
      : {};

    const categoryCondition = query.category
      ? {
          $or: categories.map(categoryItem => ({
            [`category.${LanguageKeys.EN}`]: {
              $regex: categoryItem,
              $options: 'i',
            },
          })),
        }
      : {};

    const manufacturerCondition = query.manufacturer
      ? {
          $or: manufacturers.map(manufacturerItem => ({
            manufacturer: {
              $regex: manufacturerItem
                .replace(/\s+/g, '')
                .replace(/[+]/g, '\\+'),
            },
          })),
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
            industries: {
              $elemMatch: {
                [`${LanguageKeys.EN}`]: {
                  $regex: industryItem,
                  $options: 'i',
                },
              },
            },
          })),
        }
      : {};

    const conditionsArray = [
      keywordCondition,
      categoryCondition,
      manufacturerCondition,
      industryCondition,
      conditionCondition,
    ];

    const nonEmptyConditions = conditionsArray.filter(
      cond => Object.keys(cond).length > 0
    );

    const conditions = nonEmptyConditions.length
      ? { $and: nonEmptyConditions }
      : {};

    const products = await this.productModel
      .find({ ...conditions })
      .limit(perPage)
      .sort(sort)
      .skip(skip);

    const totalProducts = await this.productModel.countDocuments({
      ...conditions,
    });

    return {
      products,
      total: totalProducts,
    };
  }

  async findRecommendedProductsById(id: string): Promise<Product[]> {
    const product = await this.productModel.findById(id);

    const { category, industries, manufacturer } = product;
    const categoryCondition = category
      ? {
          [`category.${LanguageKeys.EN}`]: {
            $regex: category.en,
            $options: 'i',
          },
        }
      : {};

    const manufacturerCondition = manufacturer
      ? {
          manufacturer: {
            $regex: manufacturer.replace(/\s+/g, '').replace(/[+]/g, '\\+'),
            $options: 'i',
          },
        }
      : {};

    const industriesCondition =
      industries.length !== 0
        ? {
            $or: industries.map(industryItem => ({
              industries: {
                $elemMatch: {
                  [`${LanguageKeys.EN}`]: {
                    $regex: industryItem.en,
                    $options: 'i',
                  },
                },
              },
            })),
          }
        : {};

    const idCondition = { _id: { $ne: id } };

    const searchConditions = [
      [
        categoryCondition,
        manufacturerCondition,
        industriesCondition,
        idCondition,
      ],
      [categoryCondition, industriesCondition, idCondition],
      [manufacturerCondition, industriesCondition, idCondition],
      [manufacturerCondition, categoryCondition, idCondition],
      [categoryCondition, idCondition],
      [industriesCondition, idCondition],
      [manufacturerCondition, idCondition],
    ];

    const results = await Promise.all(
      searchConditions.map(condition =>
        this.productModel.find({ $and: condition }).limit(20)
      )
    );

    const allRecommendedProducts = results.flat();

    const uniqueProductsMap = new Map();

    allRecommendedProducts.forEach(product => {
      uniqueProductsMap.set(product._id.toString(), product);
    });

    return Array.from(uniqueProductsMap.values());
  }

  async create(product: UntranslatedProduct, query: Query, files: Express.Multer.File[]): Promise<Product> {
    const sourceLanguage: 'en' | 'sv' = (query.lang as 'en' | 'sv') || 'en';
    const photos: string[] = [];

    const industriesArray: string[] = product.industries
  ? product.industries.split(',').map((industry) => industry.trim())
  : [];
    let nameTranslations: MultiLanguageString | undefined;

    const shouldTranslateName: boolean = query.shouldTranslateName === "true";

    if (shouldTranslateName) {
      nameTranslations = await this.translationService.translateText(
        product.name,
        sourceLanguage
      );
    }

    const descriptionTranslations = await this.translationService.translateText(
      product.description,
      sourceLanguage
    );

    const category = await this.categoryService.findOrCreate(
      product.category,
      sourceLanguage
    );
    const manufacturer = await this.manufacturerService.findOrCreate(
      product.manufacturer
    );
    const industries = await this.industryService.findOrCreate(
      industriesArray,
      sourceLanguage
    );
    const specificDate = new Date('2024-10-01');

    const categoryFolder = category.name.en.replace(/ /g, '-').toLowerCase();

    const folderPath = `products/${categoryFolder}/${product.idNumber}`;

    for (const file of files) {
      const uploadedPhoto = await this.cloudinaryService.uploadImage(
        file,
        folderPath
      );

      photos.push(uploadedPhoto.secure_url);
    }
   

    const createdProduct = new this.productModel({
      ...product,
      name: nameTranslations || product.name,
      description: descriptionTranslations,
      category: category.name,
      manufacturer: manufacturer.name,
      photos: photos,
      industries: industries.map(
        industry => {
          return industry.name;
        },
        { versionKey: false }
      ),
      createdAt: specificDate,
    updatedAt: specificDate
    });

    return createdProduct.save();
  }

  async updatePhotos(
    id: string,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const photos: string[] = [];
    const product = await this.productModel.findById(id);
    const { category, idNumber } = product;

    const categoryFolder = category.en.replace(/ /g, '-').toLowerCase();

    const folderPath = `products/${categoryFolder}/${idNumber}`;

    for (const file of files) {
      const uploadedPhoto = await this.cloudinaryService.uploadImage(
        file,
        folderPath
      );

      photos.push(uploadedPhoto.secure_url);
    }

    return await this.productModel.findByIdAndUpdate(
      id,
      { $set: { photos: photos.reverse() } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateById(
    id: string,
    product: Product,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const photos: string[] = [];
    const { category, idNumber } = product;

    if (files && files.length > 0) {
      const categoryFolder = category.en.replace(/ /g, '-').toLowerCase();
      const folderPath = `products/${categoryFolder}/${idNumber}`;

      for (const file of files) {
        const uploadedPhoto = await this.cloudinaryService.uploadImage(
          file,
          folderPath
        );
        photos.push(uploadedPhoto.secure_url);
      }
    }

    return await this.productModel.findByIdAndUpdate(
      id,
      { $set: { ...product, photos } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async deleteById(id: string): Promise<Product> {
    return await this.productModel.findByIdAndDelete(id);
  }
}
