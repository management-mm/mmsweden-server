import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

@Schema({
  timestamps: true,
  collection: 'productCategories',
})
export class ProductCategory {
  @Prop({ type: Object, required: true })
  name: MultiLanguageString;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  slug: string;

  @Prop({ type: [String], default: [] })
  synonyms: string[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0, index: true })
  sortOrder: number;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);

ProductCategorySchema.index({ isActive: 1, sortOrder: 1 });
ProductCategorySchema.index({ slug: 1 }, { unique: true });
