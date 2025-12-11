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
import { Category } from 'src/schemas/category.schema';
import { Industry } from 'src/schemas/industry.schema';
import { Manufacturer } from 'src/schemas/manufacturer.schema';
import { Product } from 'src/schemas/product.schema';
import { UntranslatedProduct } from 'src/schemas/untranslated-product.schema';
import { UpdateProduct } from 'src/schemas/update-product';
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

  private async deleteProductFolder(product: Product): Promise<void> {
    const { category, idNumber } = product;
    const categoryFolder = category.en.replace(/ /g, '-').toLowerCase();

    await this.cloudinaryService.deleteFolder(categoryFolder, idNumber);
  }

  private sanitizeFolderName(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async handleProductDependencies(product: Product): Promise<void> {
    const otherProductsWithSameCategory = await this.productModel.findOne({
      [`category.${LanguageKeys.EN}`]: {
        $regex: product.category.en,
        $options: 'i',
      },
    });

    let otherProductsWithSameManufacturer: Product | null = null;
    if (product.manufacturer) {
      otherProductsWithSameManufacturer = await this.productModel.findOne({
        ['manufacturer']: {
          $regex: product.manufacturer,
          $options: 'i',
        },
      });
    }

    if (!otherProductsWithSameCategory) {
      await this.categoryService.deleteByName(product.category);
    }

    if (!otherProductsWithSameManufacturer && product.manufacturer) {
      await this.manufacturerService.deleteByName(product.manufacturer);
    }
  }

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
            [`category.${LanguageKeys.EN}`]: categoryItem,
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

  async create(
    product: UntranslatedProduct,
    query: Query,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const shouldTranslateName: boolean = query.shouldTranslateName === 'true';
    const sourceLanguage: 'en' | 'sv' = (query.lang as 'en' | 'sv') || 'en';
    const photos: string[] = [];
    let nameTranslations: MultiLanguageString | undefined;
    let category: Category;
    let manufacturer: Manufacturer;
    let industries: Industry[];

    const industriesArray: string[] = product.industries
      ? product.industries.split(',').map(industry => industry.trim())
      : [];

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

    if (product.category) {
      category = await this.categoryService.findOrCreate(
        product.category,
        sourceLanguage
      );
    }

    if (product.manufacturer) {
      manufacturer = await this.manufacturerService.findOrCreate(
        product.manufacturer
      );
    }

    if (product.industries) {
      industries = await this.industryService.findOrCreate(
        industriesArray,
        sourceLanguage
      );
    }

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
      ...(manufacturer && { manufacturer: manufacturer.name }),
      photos: photos,
      industries: industries.map(
        industry => {
          return industry.name;
        },
        { versionKey: false }
      ),
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

  async uploadProductPhotos(
    id: string,
    files: Express.Multer.File[]
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const { category, idNumber } = product;
    const categoryFolder = this.sanitizeFolderName(category.en);
    const folderPath = `products/${categoryFolder}/${idNumber}`;

    const uploadPromises = files.map(file =>
      this.cloudinaryService
        .uploadImage(file, folderPath)
        .then(uploadedPhoto => uploadedPhoto.secure_url)
    );

    return await Promise.all(uploadPromises);
  }

  async deleteExpiredProducts(): Promise<void> {
    const now = new Date();

    now.setHours(0, 0, 0, 0);

    const productsToDelete = await this.productModel.find({
      deletionDate: { $lte: now },
    });

    productsToDelete.forEach(async product => {
      await this.handleProductDependencies(product);
      await this.deleteProductFolder(product);
    });

    await this.productModel.deleteMany({
      deletionDate: { $lte: now },
    });
  }

  async updateById(
    id: string,
    query: Query,
    product: UpdateProduct,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const shouldTranslateName: boolean = query.shouldTranslateName === 'true';
    let nameTranslations: MultiLanguageString | undefined;
    let descriptionTranslations: MultiLanguageString | undefined;
    const sourceLanguage: 'en' | 'sv' = (query.lang as 'en' | 'sv') || 'en';

    const urlsThatWereFiles: string[] = await this.uploadProductPhotos(
      id,
      files
    );
    const photos = product.photoQueue
      ? product.photoQueue.split(',').map(photo => photo.trim())
      : [];

    let j = 0;
    let name = product.name;
    let description = product.description;
    let deletionDate;

    function tryParseJSON(value: any): any {
      try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null ? parsed : value;
      } catch (error) {
        return value;
      }
    }

    for (let i = 0; i < photos.length; i++) {
      if (photos[i] === 'file' && j < urlsThatWereFiles.length) {
        photos[i] = urlsThatWereFiles[j];
        j++;
      }
    }

    const industriesArray: string[] = product.industries
      ? product.industries.split(',').map(industry => industry.trim())
      : [];
    const category = await this.categoryService.findOrCreate(
      product.category,
      'en'
    );
    const manufacturer = await this.manufacturerService.findOrCreate(
      product.manufacturer
    );
    const industries = await this.industryService.findOrCreate(
      industriesArray,
      'en'
    );

    name = tryParseJSON(product.name);
    if (shouldTranslateName) {
      nameTranslations = await this.translationService.translateText(
        product.name,
        sourceLanguage
      );
    }
    description = tryParseJSON(product.description);

    if (typeof description === 'string') {
      descriptionTranslations = await this.translationService.translateText(
        product.description,
        sourceLanguage
      );
    }

    if (product.deletionDate === 'null') {
      deletionDate = null;
    } else {
      deletionDate = product.deletionDate
        ? new Date(product.deletionDate)
        : null;
    }

    if (deletionDate) {
      deletionDate.setHours(0, 0, 0, 0);
    }
    return await this.productModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name: nameTranslations || name,
          idNumber: product.idNumber,
          dimensions: product.dimensions,
          description: descriptionTranslations || description,
          category: category.name,
          manufacturer: manufacturer.name,
          industries: industries.map(industry => industry.name),
          photos,
          condition: product.condition,
          video: product.video,
          deletionDate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async deleteById(id: string): Promise<Product | null> {
    const product = await this.productModel.findByIdAndDelete(id);
    await this.handleProductDependencies(product);

    await this.deleteProductFolder(product);

    return product;
  }
}
