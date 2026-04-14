import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CountersModule } from 'src/counters/counters.module';
import { IndustryModule } from 'src/industry/industry.module';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { OpenAIModule } from 'src/openai/openai.module';
import {
  ProductCategory,
  ProductCategorySchema,
} from 'src/schemas/product-category.schema';
import { ProductSchema } from 'src/schemas/product.schema';
import { Product } from 'src/schemas/product.schema';
import {
  SeoCategory,
  SeoCategorySchema,
} from 'src/schemas/seo-category.schema';
import { SeoCategoriesModule } from 'src/seo-categories/seo-categories.module';
import { TranslationModule } from 'src/translation/translation.module';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => CategoryModule),
    forwardRef(() => IndustryModule),
    forwardRef(() => ManufacturerModule),
    TranslationModule,
    CloudinaryModule,
    OpenAIModule,
    CountersModule,

    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: SeoCategory.name, schema: SeoCategorySchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [MongooseModule],
})
export class ProductModule {}
