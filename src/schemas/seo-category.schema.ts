import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';

export type SeoCategoryDocument = HydratedDocument<SeoCategory>;

@Schema({ _id: false })
export class SeoMetadata {
  @Prop({ type: Object, default: {} })
  title?: MultiLanguageString;

  @Prop({ type: Object, default: {} })
  description?: MultiLanguageString;
}

const SeoMetadataSchema = SchemaFactory.createForClass(SeoMetadata);

@Schema({
  timestamps: true,
  collection: 'seoCategories',
})
export class SeoCategory {
  @Prop({ type: Object, required: true })
  name: MultiLanguageString;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({
    type: Types.ObjectId,
    ref: SeoCategory.name,
    default: null,
    index: true,
  })
  parentId: Types.ObjectId | null;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0, index: true })
  sortOrder: number;

  @Prop({ type: SeoMetadataSchema, default: {} })
  seo?: SeoMetadata;
}

export const SeoCategorySchema = SchemaFactory.createForClass(SeoCategory);

SeoCategorySchema.index({ parentId: 1, sortOrder: 1 });
SeoCategorySchema.index({ parentId: 1, slug: 1 });
SeoCategorySchema.index({ isActive: 1, parentId: 1 });
