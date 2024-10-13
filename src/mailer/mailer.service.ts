import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';

import { SendEmailDto } from './dto/mail.dto';

@Injectable()
export class MailerService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  private getHtmlTemplate(templateName: string, data: any): string {
    const filePath = path.join(
      process.cwd(),
      'src',
      'templates',
      `${templateName}.hbs`
    );
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(data);
  }

  async sendMail({
    recipients,
    subject,
    templateName,
    templateData,
  }: SendEmailDto): Promise<any> {
    const html = this.getHtmlTemplate(templateName, templateData);

    const msg = {
      from: process.env.MAIL_USER,
      to: recipients.map(recipient => recipient.address),
      subject: subject,
      html: html,
    };

    try {
      const result = await sgMail.send(msg);
      console.log('Email sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
