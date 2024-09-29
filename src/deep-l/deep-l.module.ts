import { Module } from '@nestjs/common';
import { DeepLService } from './deep-l.service';

@Module({
  providers: [DeepLService],
  exports: [DeepLService]
})
export class DeepLModule {}
