import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({ type: Object })
  name: MultiLanguageString;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
