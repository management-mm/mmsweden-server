import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DeepLModule } from './deep-l/deep-l.module';
import { IndustryModule } from './industry/industry.module';
import { MailerModule } from './mailer/mailer.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { OpenAIModule } from './openai/openai.module';
import { ProductModule } from './product/product.module';
import { TranslationModule } from './translation/translation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_HOST),
    ProductModule,
    AuthModule,
    CategoryModule,
    ManufacturerModule,
    TranslationModule,
    IndustryModule,
    MailerModule,
    CloudinaryModule,
    DeepLModule,
    OpenAIModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
