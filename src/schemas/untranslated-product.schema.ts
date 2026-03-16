import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';

@Schema({
  timestamps: true,
})
export class UntranslatedProduct {
  @Prop({ unique: true, index: true })
  slug?: string;
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  idNumber: string;

  @Prop({ type: Boolean, required: false })
  autoGenerateId?: boolean;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  dimensions: string;

  @Prop({ type: [File], required: true })
  photos: File[];

  @Prop({ type: String })
  video: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: [String], required: true })
  industries: string;

  @Prop({ type: String, required: true })
  condition: 'used' | 'new';
}

export const ProductSchema = SchemaFactory.createForClass(UntranslatedProduct);

ProductSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
