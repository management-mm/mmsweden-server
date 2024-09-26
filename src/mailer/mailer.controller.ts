import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SellToUsRequestDto } from './dto/sell-to-us-request.dto';
import { SendEmailDto } from './dto/mail.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService,
    private readonly cloudinaryService: CloudinaryService
  ) { }
  
  @Post('sell-to-us')
  @UseInterceptors(FilesInterceptor('photos'))
  async sellToUs(@Body() sellToUsRequest: SellToUsRequestDto, @UploadedFiles() files: Express.Multer.File[]) {
    const photos: string[] = [];

    for (const file of files) {
      const uploadedPhoto = await this.cloudinaryService.uploadImage(file, sellToUsRequest.name)
      photos.push(uploadedPhoto.secure_url);
    }

    const dto: SendEmailDto = {
      recipients: [{ name: 'Artem', address: 'artem@mmsweden.se' }],
      subject: 'Sell to Us Request',
      templateData: {
        ...sellToUsRequest,
        photos,
      },
      templateName: 'sell-to-us',
    };

    console.log(dto.templateData);

    try {
      const result = await this.mailerService.sendMail(dto);
      return { success: true, message: 'Sell to us message sent successfully', result };
    } catch (error) {
      return { success: false, message: 'Failed to send Sell to us message', error: error.message };
    }
  }
}