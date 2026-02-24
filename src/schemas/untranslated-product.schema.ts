import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UntranslatedProduct {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  idNumber: string;

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
