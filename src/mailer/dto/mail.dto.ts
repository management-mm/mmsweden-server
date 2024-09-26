import { Address } from "nodemailer/lib/mailer";
import { SellToUsRequestDto } from "./sell-to-us-request.dto";

export interface TemplateData {
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  price: string;
  description: string;
  photos: string[]; 
}

export class SendEmailDto {
  readonly recipients: Address[];
  readonly subject: string;
  readonly templateName: 'sell-to-us' | 'contact-us' | 'request-quote';
  readonly templateData: TemplateData;
}