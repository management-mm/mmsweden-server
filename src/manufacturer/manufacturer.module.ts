import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import {
  Manufacturer,
  ManufacturerSchema,
} from 'src/schemas/manufacturer.schema';

import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Manufacturer.name, schema: ManufacturerSchema }]),
    forwardRef(() => ProductModule),
  ],
  controllers: [ManufacturerController],
  providers: [ManufacturerService],
  exports: [ManufacturerService],
})
export class ManufacturerModule {}
