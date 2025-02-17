import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UpdateProduct {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  idNumber: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  dimensions: string;

  @Prop({ type: String })
  photoQueue: string;

  @Prop({ type: [File] })
  photos: File[];

  @Prop({ type: String })
  video: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: String })
  manufacturer: string;

  @Prop({ type: String })
  industries: string;

  @Prop({ type: String })
  condition: 'used' | 'new';

  @Prop({ type: String })
  deletionDate?: string;
}

export const UpdateProductSchema = SchemaFactory.createForClass(UpdateProduct);
