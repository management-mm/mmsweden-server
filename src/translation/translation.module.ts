import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { DeepLModule } from 'src/deep-l/deep-l.module';

@Module({
  imports: [DeepLModule],
  providers: [TranslationService],
  exports: [TranslationService]
})
export class TranslationModule {}
