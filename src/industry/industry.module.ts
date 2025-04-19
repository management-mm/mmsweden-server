import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Industry, IndustrySchema } from 'src/schemas/industry.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { TranslationModule } from 'src/translation/translation.module';

import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';

@Module({
  imports: [
    AuthModule,
    TranslationModule,
    MongooseModule.forFeature([
      { name: Industry.name, schema: IndustrySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}
