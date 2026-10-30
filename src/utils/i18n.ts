import idTranslations from '../locales/id.json';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

export type SupportedLanguageCode = 'id' | 'en' | 'ar';

export const translations: Record<SupportedLanguageCode, Record<string, any>> = {
  id: idTranslations,
  en: enTranslations,
  ar: arTranslations,
};

/**
 * Resolves culture code, language name or direction into standard language key ('id' | 'en' | 'ar').
 * Defaults to 'id' (Bahasa Indonesia) as requested.
 */
export const resolveLanguageCode = (cultureCodeOrLang?: string): SupportedLanguageCode => {
  if (!cultureCodeOrLang) return 'id';
  const lower = cultureCodeOrLang.toLowerCase();
  if (lower.startsWith('id') || lower === 'bahasa' || lower === 'indonesia') return 'id';
  if (lower.startsWith('ar') || lower === 'arabic') return 'ar';
  if (lower.startsWith('en') || lower === 'english') return 'en';
  return 'id'; // Default language is Bahasa Indonesia
};

/**
 * Translates a dot-notated key (e.g. 'LeftMenu.allRightsReserved')
 * with fallback chain: Current Lang -> English -> Bahasa -> fallback argument -> key.
 */
export const translate = (
  key: string,
  lang: SupportedLanguageCode = 'id',
  fallback?: string
): string => {
  const dict = translations[lang] || translations.id;
  const parts = key.split('.');
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === 'string') return current;

  // Fallback to English
  if (lang !== 'en') {
    let enCurrent: any = translations.en;
    for (const part of parts) {
      if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
        enCurrent = enCurrent[part];
      } else {
        enCurrent = undefined;
        break;
      }
    }
    if (typeof enCurrent === 'string') return enCurrent;
  }

  // Fallback to Bahasa
  if (lang !== 'id') {
    let idCurrent: any = translations.id;
    for (const part of parts) {
      if (idCurrent && typeof idCurrent === 'object' && part in idCurrent) {
        idCurrent = idCurrent[part];
      } else {
        idCurrent = undefined;
        break;
      }
    }
    if (typeof idCurrent === 'string') return idCurrent;
  }

  return fallback !== undefined ? fallback : key;
};
