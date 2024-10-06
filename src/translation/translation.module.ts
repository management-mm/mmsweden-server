import { Module } from '@nestjs/common';
import { DeepLModule } from 'src/deep-l/deep-l.module';

import { TranslationService } from './translation.service';

@Module({
  imports: [DeepLModule],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
