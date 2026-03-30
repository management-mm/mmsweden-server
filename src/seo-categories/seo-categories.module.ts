import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SeoCategory,
  SeoCategorySchema,
} from 'src/schemas/seo-category.schema';

import { SeoCategoriesController } from './seo-categories.controller';
import { SeoCategoriesService } from './seo-categories.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeoCategory.name, schema: SeoCategorySchema },
    ]),
  ],
  controllers: [SeoCategoriesController],
  providers: [SeoCategoriesService],
  exports: [SeoCategoriesService],
})
export class SeoCategoriesModule {}
