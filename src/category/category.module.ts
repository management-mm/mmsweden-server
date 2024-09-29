import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/schemas/category.schema';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TranslationModule } from 'src/translation/translation.module';

@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
