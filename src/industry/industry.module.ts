import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Industry, IndustrySchema } from 'src/schemas/industry.schema';

import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import { TranslationModule } from 'src/translation/translation.module';

@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: Industry.name, schema: IndustrySchema },
    ]),
  ],
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}
