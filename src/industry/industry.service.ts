import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import { LanguageKeys } from 'src/common/types/language.types';
import { Industry } from 'src/schemas/industry.schema';
import { TranslationService } from 'src/translation/translation.service';

@Injectable()
export class IndustryService {
  constructor(
    @InjectModel(Industry.name)
    private industryModel: Model<Industry>,
    private readonly translationService: TranslationService
  ) {}

  async findAll(query: Query): Promise<Industry[]> {
    const lang: LanguageKeys = query.lang as LanguageKeys;
    const keywordCondition =
      query.keyword && query.lang
        ? {
            [`name.${lang}`]: {
              $regex: query.keyword,
              $options: 'i',
            },
          }
        : {};
    return this.industryModel.find(keywordCondition).exec();
  }

  async findOrCreate(
    names: string[],
    sourceLanguage: 'en' | 'sv'
  ): Promise<Industry[]> {
    return await Promise.all(
      names.map(async name => {
        let industry = await this.industryModel
          .findOne({ [`name.${sourceLanguage}`]: name })
          .exec();
        if (!industry) {
          const industriesTranslations =
            await this.translationService.translateText(name, sourceLanguage);

          industry = new this.industryModel(
            { name: industriesTranslations },
            { versionKey: false }
          );
          await industry.save();
        }

        return industry;
      })
    );
  }
}
