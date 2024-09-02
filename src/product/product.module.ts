import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { IndustryModule } from 'src/industry/industry.module';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { ProductSchema } from 'src/schemas/product.schema';
import { Product } from 'src/schemas/product.schema';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    AuthModule,
    CategoryModule,
    IndustryModule,
    ManufacturerModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
