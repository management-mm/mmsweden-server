import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
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

  private getRecipients() {
    return [
      {
        name: 'Artem',
        address: process.env.RECIPIENT_ARTEM || 'artem@mmsweden.se',
      },
      {
        name: 'Hampus',
        address: process.env.RECIPIENT_HAMPUS || 'hampus@mmsweden.se',
      },
    ];
  }

  @Post('sell-to-us')
  @UseInterceptors(FilesInterceptor('photos'))
  async sellToUs(
    @Body(new ValidationPipe({ whitelist: true }))
    sellToUsRequest: SellToUsRequestDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const folderName = `sell-to-us-products/${sellToUsRequest.name.replace(/ /g, '-').toLowerCase()}`;

    const uploadResults = await Promise.allSettled(
      files.map(file => this.cloudinaryService.uploadImage(file, folderName))
    );

    const photos: string[] = [];
    for (const result of uploadResults) {
      if (result.status === 'fulfilled' && 'secure_url' in result.value) {
        photos.push(result.value.secure_url);
      }
    }

    const dto: SendEmailDto = {
      recipients: this.getRecipients(),
      subject: 'Sell to Us Request',
      templateData: { ...sellToUsRequest, photos },
      templateName: 'sell-to-us',
    };

    try {
      const result = await this.mailerService.sendMail(dto);
      return {
        success: true,
        message: {
          en: 'Your request has been successfully sent. It is going to be processed.',
        },
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: {
          en: 'Failed to send Sell to Us message.',
        },
        error: error.message,
      };
    }
  }

  @Post('contact-us')
  async contactUs(
    @Body(new ValidationPipe({ whitelist: true }))
    contactUsRequest: ContactUsRequestDto
  ) {
    const dto: SendEmailDto = {
      recipients: this.getRecipients(),
      subject: 'Contact Us Request',
      templateData: contactUsRequest,
      templateName: 'contact-us',
    };

    try {
      const result = await this.mailerService.sendMail(dto);
      return {
        success: true,
        message: {
          en: 'Your request has been successfully sent. It is going to be processed.',
        },
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: {
          en: 'Failed to send Contact Us message.',
        },
        error: error.message,
      };
    }
  }

  @Post('request-quote')
  async requestQuote(
    @Body(new ValidationPipe({ whitelist: true }))
    requestQuoteRequest: RequestQuoteDto
  ) {
    const dto: SendEmailDto = {
      recipients: this.getRecipients(),
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
        message: {
          en: 'Failed to send Request a price quote message.',
        },
        error: error.message,
      };
    }
  }
}
