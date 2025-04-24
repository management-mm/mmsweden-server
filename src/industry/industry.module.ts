import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from 'src/product/product.module';
import { Industry, IndustrySchema } from 'src/schemas/industry.schema';
import { TranslationModule } from 'src/translation/translation.module';

import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';

@Module({
  imports: [
    AuthModule,
    TranslationModule,
    MongooseModule.forFeature([
      { name: Industry.name, schema: IndustrySchema },
    ]),
    forwardRef(() => ProductModule),
  ],
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}
