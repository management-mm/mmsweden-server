import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ type: Object })
  name: MultiLanguageString;

  @Prop({ type: Number })
  idNumber: number;

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
  industry: MultiLanguageString[];

  @Prop({ type: String })
  condition: 'used' | 'new';
}

export const ProductSchema = SchemaFactory.createForClass(Product);
