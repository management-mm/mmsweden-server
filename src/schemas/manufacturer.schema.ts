import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Manufacturer {
  @Prop({ type: String })
  name: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
