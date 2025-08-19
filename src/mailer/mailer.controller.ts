import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { ContactUsRequestDto } from './dto/contacts-us-request.dto';
import { SendEmailDto } from './dto/mail.dto';
import { RequestQuoteDto } from './dto/request-quote.dto';
import { SellToUsRequestDto } from './dto/sell-to-us-request.dto';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post('sell-to-us')
  @UseInterceptors(FilesInterceptor('photos'))
  async sellToUs(
    @Body() sellToUsRequest: SellToUsRequestDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const photos: string[] = [];

    for (const file of files) {
      const uploadedPhoto = await this.cloudinaryService.uploadImage(
        file,
        `sell-to-us-products/${sellToUsRequest.name}`
      );
      photos.push(uploadedPhoto.secure_url);
    }

    const dto: SendEmailDto = {
      recipients: [
        { name: 'Artem', address: 'artem@mmsweden.se' },
        { name: 'Hampus', address: 'hampus@mmsweden.se' },
      ],
      subject: 'Sell to Us Request',
      templateData: {
        ...sellToUsRequest,
        photos,
      },
      templateName: 'sell-to-us',
    };

    try {
      const result = await this.mailerService.sendMail(dto);
      return {
        success: true,
        message:
          'Your request has been successfully sent. It is going to be processed',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send Sell to us message',
        error: error.message,
      };
    }
  }
  @Post('contact-us')
  async contactUs(@Body() contactUsRequest: ContactUsRequestDto) {
    const dto: SendEmailDto = {
      recipients: [
        { name: 'Artem', address: 'artem@mmsweden.se' },
        { name: 'Hampus', address: 'hampus@mmsweden.se' },
      ],
      subject: 'Contact Us Request',
      templateData: contactUsRequest,
      templateName: 'contact-us',
    };

    try {
      const result = await this.mailerService.sendMail(dto);
      return {
        success: true,
        message:
          'Your request has been successfully sent. It is going to be processed',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send Sell to us message',
        error: error.message,
      };
    }
  }

  @Post('request-quote')
  async requestQuote(@Body() requestQuoteRequest: RequestQuoteDto) {
    const dto: SendEmailDto = {
      recipients: [
        { name: 'Artem', address: 'artem@mmsweden.se' },
        { name: 'Hampus', address: 'hampus@mmsweden.se' },
      ],
      subject: 'Request Price Quote',
      templateData: requestQuoteRequest,
      templateName: 'request-quote',
    };

    try {
      const result = await this.mailerService.sendMail(dto);
      return {
        success: true,
        message: {
          en: 'Your request has been successfully sent. It is going to be processed.',
          sv: 'Din förfrågan har skickats framgångsrikt. Den kommer att behandlas.',
          de: 'Ihre Anfrage wurde erfolgreich gesendet. Sie wird bearbeitet.',
          es: 'Su solicitud ha sido enviada con éxito. Se procesará.',
          fr: 'Votre demande a été envoyée avec succès. Elle sera traitée.',
          ru: 'Ваш запрос был успешно отправлен. Он будет обработан.',
          uk: 'Ваш запит був успішно надісланий. Він буде оброблений.',
        },
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send Request a price quote message',
        error: error.message,
      };
    }
  }
}
