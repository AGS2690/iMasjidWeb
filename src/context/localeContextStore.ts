import { createContext } from 'react';
import { SupportedLocale } from '../types';
import { SupportedLanguageCode } from '../utils/i18n';

export interface LocaleContextType {
  locales: SupportedLocale[];
  currentLocale: SupportedLocale | null;
  setLocale: (locale: SupportedLocale) => void;
  isLoading: boolean;
  refreshLocales: () => Promise<void>;
  t: (key: string, fallback?: string) => string;
  language: SupportedLanguageCode;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);
