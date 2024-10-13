import { Address } from 'nodemailer/lib/mailer';

import { SellToUsRequestDto } from './sell-to-us-request.dto';

export interface Product {
  name: string;
  idNumber: string;
  photo: string;
}

export interface SellToUsData {
  name: string;
  email: string;
  phone: string;
  countryPhone: string;
  price: string;
  description: string;
  photos: string[];
}

export interface ContactUsData {
  name: string;
  email: string;
  phone: string;
  countryPhone: string;
  subject: string;
  message: string;
}

export interface RequestQuoteData {
  name: string;
  email: string;
  phone: string;
  countryPhone: string;
  country: string;
  company: string;
  products: Product[];
}

export class SendEmailDto {
  readonly recipients: Address[];
  readonly subject: string;
  readonly templateName: 'sell-to-us' | 'contact-us' | 'request-quote';
  readonly templateData: SellToUsData | ContactUsData | RequestQuoteData;
}
