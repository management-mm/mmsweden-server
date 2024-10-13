import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}
