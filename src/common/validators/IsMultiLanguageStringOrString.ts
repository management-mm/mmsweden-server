import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';

function isMultiLangObject(v: any): v is MultiLanguageString {
  if (!v || typeof v !== 'object') return false;

  return Object.values(LanguageKeys).every(key => {
    const val = v[key as LanguageKeys];
    return val === undefined || typeof val === 'string';
  });
}

function canParseJsonObject(value: string) {
  const t = value.trim();
  return t.startsWith('{') && t.endsWith('}');
}

export function IsMultiLanguageStringOrString(
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMultiLanguageStringOrString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null) return true;

          if (typeof value === 'string') {
            if (!canParseJsonObject(value)) return true;

            try {
              const parsed = JSON.parse(value);
              return isMultiLangObject(parsed);
            } catch {
              return false;
            }
          }

          return isMultiLangObject(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a string or a MultiLanguageString (or JSON-string of it)`;
        },
      },
    });
  };
}
