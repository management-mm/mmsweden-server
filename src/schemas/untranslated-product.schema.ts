import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UntranslatedProduct {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  idNumber: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  dimensions: string;

  @Prop({ type: [File] })
  photos: File[];

  @Prop({ type: String })
  video: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: [String] })
  industries: string;

  @Prop({ type: String })
  condition: 'used' | 'new';
}

export const ProductSchema = SchemaFactory.createForClass(UntranslatedProduct);
