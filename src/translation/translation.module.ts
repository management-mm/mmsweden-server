import { Module } from '@nestjs/common';
import { DeepLModule } from 'src/deep-l/deep-l.module';

import { TranslationService } from './translation.service';
import { OpenAIModule } from 'src/openai/openai.module';

@Module({
  imports: [OpenAIModule],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
