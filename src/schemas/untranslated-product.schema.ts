import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UntranslatedProduct {
  @Prop({ type: Object })
  name: string;

  @Prop({ type: String })
  idNumber: string;

  @Prop({ type: Object })
  description: string;

  @Prop({ type: String })
  dimensions: string;

  @Prop({ type: [String] })
  photos: string[];

  @Prop({ type: String })
  video: string;

  @Prop({ type: Object })
  category: string;

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: [Object] })
  industries: string[];

  @Prop({ type: String })
  condition: 'used' | 'new';
}

export const ProductSchema = SchemaFactory.createForClass(UntranslatedProduct);
