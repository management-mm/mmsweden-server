import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Object })
  name: MultiLanguageString;

  @Prop({ type: String })
  idNumber: string;

  @Prop({ type: Object })
  description: MultiLanguageString;

  @Prop({ type: String })
  dimensions: string;

  @Prop({ type: [String] })
  photos: string[];

  @Prop({ type: String })
  video: string;

  @Prop({ type: Object })
  category: MultiLanguageString;

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: [Object] })
  industries: MultiLanguageString[];

  @Prop({ type: String })
  condition: 'used' | 'new';

  @Prop({ type: Date })
  deletionDate?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'ProductCategory',
    required: true,
    index: true,
  })
  productCategoryId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'SeoCategory',
    required: true,
    index: true,
  })
  seoCategoryId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'SeoSubcategory',
    default: null,
    index: true,
  })
  seoSubcategoryId?: Types.ObjectId | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
