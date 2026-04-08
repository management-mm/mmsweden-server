import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import type { FilterQuery, SortOrder } from 'mongoose';
import { ParsedQs } from 'qs';
import slugify from 'slugify';
import { CategoryService } from 'src/category/category.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';
import { CountersService } from 'src/counters/counters.service';
import { IndustryService } from 'src/industry/industry.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { Category } from 'src/schemas/category.schema';
import { Industry } from 'src/schemas/industry.schema';
import { Manufacturer } from 'src/schemas/manufacturer.schema';
import { Product } from 'src/schemas/product.schema';
import { SeoCategory } from 'src/schemas/seo-category.schema';
import { UntranslatedProduct } from 'src/schemas/untranslated-product.schema';
import { TranslationService } from 'src/translation/translation.service';
import { ProductSitemapItem } from 'src/types/product-sitemap-item.type';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    @InjectModel(SeoCategory.name)
    private readonly seoCategoryModel: Model<SeoCategory>,
    private readonly categoryService: CategoryService,
    private readonly manufacturerService: ManufacturerService,
    private readonly industryService: IndustryService,
    private readonly translationService: TranslationService,
    private readonly cloudinaryService: CloudinaryService,
    private countersService: CountersService
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

  async getProductsForSitemap(): Promise<ProductSitemapItem[]> {
    const products = await this.productModel
      .find({
        slug: { $exists: true, $ne: '' },
      })
      .select('slug updatedAt seoCategoryId seoSubcategoryId')
      .populate({
        path: 'seoCategoryId',
        select: 'slug',
      })
      .populate({
        path: 'seoSubcategoryId',
        select: 'slug',
      })
      .lean();

    return products
      .map((product: any) => ({
        slug: product.slug,
        updatedAt: product.updatedAt,
        categorySlug:
          product.seoCategoryId &&
          typeof product.seoCategoryId === 'object' &&
          'slug' in product.seoCategoryId
            ? product.seoCategoryId.slug
            : undefined,
        subcategorySlug:
          product.seoSubcategoryId &&
          typeof product.seoSubcategoryId === 'object' &&
          'slug' in product.seoSubcategoryId
            ? product.seoSubcategoryId.slug
            : undefined,
      }))
      .filter(
        product =>
          typeof product.slug === 'string' &&
          product.slug.trim().length > 0 &&
          typeof product.categorySlug === 'string' &&
          product.categorySlug.trim().length > 0 &&
          typeof product.subcategorySlug === 'string' &&
          product.subcategorySlug.trim().length > 0
      );
  }

  async findAll(query: Query): Promise<{ products: any[]; total: number }> {
    const perPage = Number(query.perPage) || 16;
    const currentPage = Number(query.page) || 1;
    const skip = perPage * (currentPage - 1);

    const categorySlug =
      typeof query.categorySlug === 'string' ? query.categorySlug : undefined;

    const subcategorySlug =
      typeof query.subcategorySlug === 'string'
        ? query.subcategorySlug
        : undefined;

    const sort: Record<string, SortOrder> = { createdAt: -1, _id: -1 };

    function escapeRegex(value: string): string {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function ensureArray(
      input: string | string[] | ParsedQs | ParsedQs[] | undefined
    ): string[] {
      if (!input) return [];

      if (Array.isArray(input)) {
        return input.filter((item): item is string => typeof item === 'string');
      }

      if (typeof input === 'string') {
        return [input];
      }

      return [];
    }

    const categories = ensureArray(query.category);
    const manufacturers = ensureArray(query.manufacturer);
    const industries = ensureArray(query.industry);

    const languages = Object.values(LanguageKeys);
    const keyword = query.keyword ? escapeRegex(String(query.keyword)) : '';

    const filter: FilterQuery<Product> = {};

    if (subcategorySlug) {
      if (categorySlug) {
        const parentCategory = await this.seoCategoryModel
          .findOne({ slug: categorySlug })
          .select('_id')
          .lean();

        if (!parentCategory) {
          throw new NotFoundException('Category not found');
        }

        const subcategory = await this.seoCategoryModel
          .findOne({
            slug: subcategorySlug,
            parentId: parentCategory._id,
          })
          .select('_id')
          .lean();

        if (!subcategory) {
          throw new NotFoundException('Subcategory not found');
        }

        filter.seoCategoryId = parentCategory._id;
        filter.seoSubcategoryId = subcategory._id;
      } else {
        const subcategory = await this.seoCategoryModel
          .findOne({ slug: subcategorySlug })
          .select('_id parentId')
          .lean();

        if (!subcategory) {
          throw new NotFoundException('Subcategory not found');
        }

        filter.seoCategoryId = subcategory.parentId;
        filter.seoSubcategoryId = subcategory._id;
      }
    } else if (categorySlug) {
      const parentCategory = await this.seoCategoryModel
        .findOne({ slug: categorySlug })
        .select('_id')
        .lean();

      if (!parentCategory) {
        throw new NotFoundException('Category not found');
      }

      filter.seoCategoryId = parentCategory._id;
    }

    const keywordCondition = keyword
      ? {
          $or: [
            ...languages.map(lang => ({
              [`name.${lang}`]: {
                $regex: keyword,
                $options: 'i',
              },
            })),
            {
              name: {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              idNumber: {
                $regex: `^${keyword}`,
                $options: 'i',
              },
            },
            ...languages.map(lang => ({
              [`category.${lang}`]: {
                $regex: keyword,
                $options: 'i',
              },
            })),
            {
              manufacturer: {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              condition: {
                $regex: keyword,
                $options: 'i',
              },
            },
            ...languages.map(lang => ({
              industries: {
                $elemMatch: {
                  [lang]: {
                    $regex: keyword,
                    $options: 'i',
                  },
                },
              },
            })),
          ],
        }
      : {};

    const categoryCondition = categories.length
      ? {
          $or: categories.map(categoryItem => ({
            [`category.${LanguageKeys.EN}`]: categoryItem,
          })),
        }
      : {};

    const manufacturerCondition = manufacturers.length
      ? {
          $or: manufacturers.map(manufacturerItem => ({
            manufacturer: {
              $regex: escapeRegex(manufacturerItem),
              $options: 'i',
            },
          })),
        }
      : {};

    const conditionCondition = query.condition
      ? {
          condition: {
            $regex: `^${escapeRegex(String(query.condition))}$`,
            $options: 'i',
          },
        }
      : {};

    const industryCondition = industries.length
      ? {
          $or: industries.map(industryItem => ({
            industries: {
              $elemMatch: {
                [LanguageKeys.EN]: {
                  $regex: escapeRegex(industryItem),
                  $options: 'i',
                },
              },
            },
          })),
        }
      : {};

    const extraConditions = [
      keywordCondition,
      categoryCondition,
      manufacturerCondition,
      industryCondition,
      conditionCondition,
    ].filter(cond => Object.keys(cond).length > 0);

    const finalFilter: FilterQuery<Product> =
      Object.keys(filter).length || extraConditions.length
        ? {
            $and: [
              ...(Object.keys(filter).length ? [filter] : []),
              ...extraConditions,
            ],
          }
        : {};

    const [products, totalProducts] = await Promise.all([
      this.productModel
        .find(finalFilter)
        .populate('seoCategoryId', 'slug')
        .populate('seoSubcategoryId', 'slug')
        .populate('productCategoryId', 'name')
        .limit(perPage)
        .sort(sort)
        .skip(skip)
        .lean(),
      this.productModel.countDocuments(finalFilter),
    ]);

    const formattedProducts = products.map(product => {
      const seoCategorySlug =
        product.seoCategoryId &&
        typeof product.seoCategoryId === 'object' &&
        'slug' in product.seoCategoryId
          ? product.seoCategoryId.slug
          : null;

      const seoSubcategorySlug =
        product.seoSubcategoryId &&
        typeof product.seoSubcategoryId === 'object' &&
        'slug' in product.seoSubcategoryId
          ? product.seoSubcategoryId.slug
          : null;

      const productCategory =
        product.productCategoryId &&
        typeof product.productCategoryId === 'object' &&
        'name' in product.productCategoryId
          ? product.productCategoryId.name
          : null;

      return {
        ...product,
        seoCategorySlug,
        seoSubcategorySlug,
        productCategory,
        productCategoryId:
          product.productCategoryId &&
          typeof product.productCategoryId === 'object' &&
          '_id' in product.productCategoryId
            ? product.productCategoryId._id
            : (product.productCategoryId ?? null),
      };
    });

    return {
      products: formattedProducts,
      total: totalProducts,
    };
  }

  async findRecommendedProductsBySlug(slug: string): Promise<any[]> {
    const product = await this.productModel.findOne({ slug }).lean();

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    const { category, industries, manufacturer, _id } = product;

    function escapeRegex(value: string): string {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const categoryCondition = category?.en
      ? {
          [`category.${LanguageKeys.EN}`]: {
            $regex: escapeRegex(category.en),
            $options: 'i',
          },
        }
      : {};

    const manufacturerCondition = manufacturer
      ? {
          manufacturer: {
            $regex: escapeRegex(manufacturer),
            $options: 'i',
          },
        }
      : {};

    const industriesCondition = industries?.length
      ? {
          $or: industries
            .filter(industryItem => industryItem?.en)
            .map(industryItem => ({
              industries: {
                $elemMatch: {
                  [LanguageKeys.EN]: {
                    $regex: escapeRegex(industryItem.en),
                    $options: 'i',
                  },
                },
              },
            })),
        }
      : {};

    const idCondition = { _id: { $ne: _id } };

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
    ].map(condition => condition.filter(item => Object.keys(item).length > 0));

    const results = await Promise.all(
      searchConditions.map(condition =>
        this.productModel
          .find({ $and: condition })
          .populate('seoCategoryId', 'slug')
          .populate('seoSubcategoryId', 'slug')
          .populate('productCategoryId', 'name')
          .limit(9)
          .lean()
      )
    );

    const allRecommendedProducts = results.flat();

    const uniqueProductsMap = new Map<string, any>();

    allRecommendedProducts.forEach(productItem => {
      uniqueProductsMap.set(productItem._id.toString(), productItem);
    });

    const uniqueProducts = Array.from(uniqueProductsMap.values()).slice(0, 9);

    return uniqueProducts.map(productItem => {
      const seoCategorySlug =
        productItem.seoCategoryId &&
        typeof productItem.seoCategoryId === 'object' &&
        'slug' in productItem.seoCategoryId
          ? productItem.seoCategoryId.slug
          : null;

      const seoSubcategorySlug =
        productItem.seoSubcategoryId &&
        typeof productItem.seoSubcategoryId === 'object' &&
        'slug' in productItem.seoSubcategoryId
          ? productItem.seoSubcategoryId.slug
          : null;

      const productCategory =
        productItem.productCategoryId &&
        typeof productItem.productCategoryId === 'object' &&
        'name' in productItem.productCategoryId
          ? productItem.productCategoryId.name
          : null;

      return {
        ...productItem,
        seoCategorySlug,
        seoSubcategorySlug,
        productCategory,
        productCategoryId:
          productItem.productCategoryId &&
          typeof productItem.productCategoryId === 'object' &&
          '_id' in productItem.productCategoryId
            ? productItem.productCategoryId._id
            : (productItem.productCategoryId ?? null),
      };
    });
  }

  async create(
    product: CreateProductDto,
    query: Query,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const shouldTranslateName = query.shouldTranslateName === 'true';
    const sourceLanguage: 'en' | 'sv' = (query.lang as 'en' | 'sv') || 'en';

    const photos: string[] = [];
    let nameTranslations: MultiLanguageString | undefined;

    let category: Category | null = null;
    let manufacturer: Manufacturer | null = null;
    let industries: Industry[] = [];

    let idNumber = product.idNumber;

    if (product.autoGenerateId) {
      const seq = await this.countersService.getNextSequence('product');
      idNumber = seq.toString();
    } else {
      if (!idNumber) {
        throw new BadRequestException('idNumber is required');
      }

      const exists = await this.productModel.exists({ idNumber });
      if (exists) {
        throw new BadRequestException('idNumber already exists');
      }
    }

    if (!product.seoCategoryId) {
      throw new BadRequestException('seoCategoryId is required');
    }

    if (!product.seoSubcategoryId) {
      throw new BadRequestException('seoSubcategoryId is required');
    }

    if (!product.productCategoryId) {
      throw new BadRequestException('productCategoryId is required');
    }

    const industriesArray: string[] = product.industries
      ? product.industries
          .split(',')
          .map(industry => industry.trim())
          .filter(Boolean)
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

    if (product.manufacturer) {
      manufacturer = await this.manufacturerService.findOrCreate(
        product.manufacturer
      );
    }

    if (industriesArray.length) {
      industries = await this.industryService.findOrCreate(
        industriesArray,
        sourceLanguage
      );
    }
    const seoSubcategory = await this.seoCategoryModel.findById(
      product.seoSubcategoryId
    );

    if (!seoSubcategory) {
      throw new BadRequestException('Seo subcategory not found');
    }
    const subcategoryFolder = this.sanitizeFolderName(seoSubcategory.name.en);

    const folderPath = `products/${subcategoryFolder}/${idNumber}`;

    for (const file of files) {
      const uploadedPhoto = await this.cloudinaryService.uploadImage(
        file,
        folderPath
      );
      photos.push(uploadedPhoto.secure_url);
    }

    let slug = slugify(product.name, { lower: true, strict: true });

    const existing = await this.productModel.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const createdProduct = new this.productModel({
      ...product,
      slug,
      name: nameTranslations ?? product.name,
      idNumber,
      description: descriptionTranslations,
      manufacturer: manufacturer ? manufacturer.name : null,
      industries: industries.map(industry => industry.name),
      photos,
      video: product.video ?? null,
      seoCategoryId: product.seoCategoryId,
      seoSubcategoryId: product.seoSubcategoryId,
      productCategoryId: product.productCategoryId,
    });

    return createdProduct.save();
  }

  async findBySlug(slug: string): Promise<any> {
    const product = await this.productModel
      .findOne({ slug })
      .populate('productCategoryId', '_id name')
      .populate('seoCategoryId', '_id slug')
      .populate('seoSubcategoryId', '_id slug')
      .lean();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const rawSeoCategoryId = product.seoCategoryId;
    const rawSeoSubcategoryId = product.seoSubcategoryId;
    const rawProductCategoryId = product.productCategoryId;

    return {
      ...product,

      seoCategoryId:
        rawSeoCategoryId &&
        typeof rawSeoCategoryId === 'object' &&
        '_id' in rawSeoCategoryId
          ? String(rawSeoCategoryId._id)
          : rawSeoCategoryId
            ? String(rawSeoCategoryId)
            : null,

      seoCategorySlug:
        rawSeoCategoryId &&
        typeof rawSeoCategoryId === 'object' &&
        'slug' in rawSeoCategoryId
          ? rawSeoCategoryId.slug
          : null,

      seoSubcategoryId:
        rawSeoSubcategoryId &&
        typeof rawSeoSubcategoryId === 'object' &&
        '_id' in rawSeoSubcategoryId
          ? String(rawSeoSubcategoryId._id)
          : rawSeoSubcategoryId
            ? String(rawSeoSubcategoryId)
            : null,

      seoSubcategorySlug:
        rawSeoSubcategoryId &&
        typeof rawSeoSubcategoryId === 'object' &&
        'slug' in rawSeoSubcategoryId
          ? rawSeoSubcategoryId.slug
          : null,

      productCategoryId:
        rawProductCategoryId &&
        typeof rawProductCategoryId === 'object' &&
        '_id' in rawProductCategoryId
          ? String(rawProductCategoryId._id)
          : rawProductCategoryId
            ? String(rawProductCategoryId)
            : null,

      productCategory:
        rawProductCategoryId &&
        typeof rawProductCategoryId === 'object' &&
        'name' in rawProductCategoryId
          ? rawProductCategoryId.name
          : null,
    };
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
    product: UpdateProductDto,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const shouldTranslateName = query.shouldTranslateName === 'true';
    const sourceLanguage: 'en' | 'sv' = (query.lang as 'en' | 'sv') || 'en';

    const tryParseArrayCsv = (value?: string | null): string[] => {
      if (!value || typeof value !== 'string') return [];
      return value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    };

    const tryParseJSON = (value: any): any => {
      if (typeof value !== 'string') return value;

      const trimmed = value.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;

      try {
        const parsed = JSON.parse(trimmed);
        return typeof parsed === 'object' && parsed !== null ? parsed : value;
      } catch {
        return value;
      }
    };

    const pickText = (value: any): string | null => {
      if (value === null || value === undefined) return null;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
      }

      if (typeof value === 'object') {
        const localized = value?.[sourceLanguage] ?? value?.en;
        if (typeof localized === 'string') {
          const trimmed = localized.trim();
          return trimmed ? trimmed : null;
        }
      }

      return null;
    };

    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (!product.seoCategoryId) {
      throw new BadRequestException('seoCategoryId is required');
    }

    if (!product.seoSubcategoryId) {
      throw new BadRequestException('seoSubcategoryId is required');
    }

    if (!product.productCategoryId) {
      throw new BadRequestException('productCategoryId is required');
    }

    const newUrls: string[] = files?.length
      ? await this.uploadProductPhotos(id, files)
      : [];

    const queue = tryParseArrayCsv(product.photoQueue);
    let finalPhotos: string[] = [];

    if (queue.length) {
      let fileIndex = 0;

      finalPhotos = queue
        .map(token => {
          if (token === 'file') {
            const nextUrl = newUrls[fileIndex];
            fileIndex += 1;
            return nextUrl;
          }

          return token;
        })
        .filter((url): url is string => Boolean(url));
    } else {
      finalPhotos = [...(existingProduct.photos ?? []), ...newUrls];
    }

    const rawName = tryParseJSON(product.name);
    const rawDescription = tryParseJSON(product.description);

    const manufacturerText = pickText(product.manufacturer);
    const industriesArray = tryParseArrayCsv(product.industries).filter(
      Boolean
    );

    const manufacturer = manufacturerText
      ? await this.manufacturerService.findOrCreate(manufacturerText)
      : null;

    const industries = industriesArray.length
      ? await this.industryService.findOrCreate(industriesArray, sourceLanguage)
      : [];

    let nameTranslations: MultiLanguageString | undefined;
    let descriptionTranslations: MultiLanguageString | undefined;

    if (shouldTranslateName) {
      const nameToTranslate = pickText(rawName);

      if (nameToTranslate) {
        nameTranslations = await this.translationService.translateText(
          nameToTranslate,
          sourceLanguage
        );
      }
    }

    if (typeof rawDescription === 'string' && rawDescription.trim()) {
      descriptionTranslations = await this.translationService.translateText(
        rawDescription.trim(),
        sourceLanguage
      );
    }

    const finalName = nameTranslations ?? rawName;
    const finalDescription = descriptionTranslations ?? rawDescription;

    let deletionDate: Date | null = null;

    if (product.deletionDate === 'null') {
      deletionDate = null;
    } else if (product.deletionDate) {
      deletionDate = new Date(product.deletionDate);
    }

    if (deletionDate) {
      deletionDate.setHours(0, 0, 0, 0);
    }

    const nameForSlug = pickText(finalName);
    let newSlug = existingProduct.slug;

    if (nameForSlug) {
      const baseSlug = slugify(nameForSlug, { lower: true, strict: true });

      if (baseSlug && baseSlug !== existingProduct.slug) {
        newSlug = baseSlug;
        let counter = 1;

        while (
          await this.productModel.findOne({
            slug: newSlug,
            _id: { $ne: id },
          })
        ) {
          newSlug = `${baseSlug}-${counter}`;
          counter += 1;
        }
      }
    }

    const setData: any = {
      slug: newSlug,
      name: finalName,
      idNumber: product.idNumber,
      description: finalDescription,
      manufacturer: manufacturer ? manufacturer.name : null,
      industries: industries.map(ind => ind.name),
      photos: finalPhotos,
      condition: product.condition,
      deletionDate,
      seoCategoryId: product.seoCategoryId,
      seoSubcategoryId: product.seoSubcategoryId,
      productCategoryId: product.productCategoryId,
    };

    if (product.dimensions !== undefined) {
      setData.dimensions = product.dimensions;
    }

    if (product.video !== undefined) {
      setData.video = product.video;
    }

    const result = await this.productModel.findByIdAndUpdate(
      id,
      { $set: setData },
      { new: true, runValidators: true }
    );

    if (!result) {
      throw new NotFoundException('Product not found after update');
    }

    return result;
  }

  async deleteById(id: string): Promise<Product | null> {
    const product = await this.productModel.findByIdAndDelete(id);
    await this.handleProductDependencies(product);

    await this.deleteProductFolder(product);

    return product;
  }
}
