import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';

@Schema({ timestamps: true })
export class Employee {
  @Prop({ type: Map, of: String, required: true })
  name: MultiLanguageString;

  @Prop({ type: Map, of: String, required: true })
  description: MultiLanguageString;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  additionalInfo?: string;

  @Prop({ required: true, default: 0 })
  order: number;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
