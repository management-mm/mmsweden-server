import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Industry } from 'src/schemas/industry.schema';
import { TranslationService } from 'src/translation/translation.service';

@Injectable()
export class IndustryService {
  constructor(
    @InjectModel(Industry.name)
    private industryModel: Model<Industry>,
    private readonly translationService: TranslationService
  ) {}

  async findAll(): Promise<Industry[]> {
    return this.industryModel.find().exec();
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
