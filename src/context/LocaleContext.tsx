import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SupportedLocale } from '../types';
import { localesApi } from '../api/localesApi';
import { translate, resolveLanguageCode, SupportedLanguageCode } from '../utils/i18n';

interface LocaleContextType {
  locales: SupportedLocale[];
  currentLocale: SupportedLocale | null;
  setLocale: (locale: SupportedLocale) => void;
  isLoading: boolean;
  refreshLocales: () => Promise<void>;
  t: (key: string, fallback?: string) => string;
  language: SupportedLanguageCode;
}

const STORAGE_KEY = 'imasjid_selected_locale';

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const applyDocumentAttributes = (locale: SupportedLocale | null) => {
  if (!locale) return;
  document.documentElement.lang = locale.cultureCode;
  document.documentElement.dir = locale.direction?.toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
};

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locales, setLocales] = useState<SupportedLocale[]>([]);
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync document language and RTL direction whenever currentLocale changes
  useEffect(() => {
    applyDocumentAttributes(currentLocale);
  }, [currentLocale]);

  const fetchLocales = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch supported locales dynamically from database service
      const res = await localesApi.getSupportedLanguages(false);
      const list: SupportedLocale[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? (res as unknown as SupportedLocale[])
        : [];

      setLocales(list);

      if (list.length > 0) {
        setCurrentLocale((prev) => {
          // Reconcile saved locale with latest backend database records
          if (prev) {
            const matched = list.find(
              (l) => l.cultureCode?.toLowerCase() === prev.cultureCode?.toLowerCase() || l.id === prev.id
            );
            if (matched) {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(matched));
              } catch {
                // Ignore storage errors
              }
              return matched;
            }
          }

          // Default selection from database: prefer Indonesian ('id-ID') or the first active locale
          const defaultLocale =
            list.find((l) => l.cultureCode?.toLowerCase().startsWith('id') && l.isActive) ||
            list.find((l) => l.isActive) ||
            list[0];

          if (defaultLocale) {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLocale));
            } catch {
              // Ignore storage errors
            }
          }
          return defaultLocale;
        });
      }
    } catch (err) {
      console.warn('Could not fetch supported locales from service API:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let retries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const init = async () => {
      await fetchLocales();
      if (retries < 2) {
        retries++;
        timer = setTimeout(init, 2500);
      }
    };
    init();
    return () => clearTimeout(timer);
  }, [fetchLocales]);

  const setLocale = (locale: SupportedLocale) => {
    setCurrentLocale(locale);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locale));
      window.dispatchEvent(new CustomEvent('imasjid_locale_changed', { detail: locale }));
    } catch {
      // Storage unavailable
    }
    applyDocumentAttributes(locale);
  };

  // Resolved language code: 'id' | 'en' | 'ar'
  const language = resolveLanguageCode(currentLocale?.cultureCode);

  // Translation function reactive to the active language
  const t = useCallback(
    (key: string, fallback?: string): string => {
      return translate(key, language, fallback);
    },
    [language]
  );

  return (
    <LocaleContext.Provider
      value={{
        locales,
        currentLocale,
        setLocale,
        isLoading,
        refreshLocales: fetchLocales,
        t,
        language,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

// Convenience hook for components focusing solely on translation
export const useTranslation = () => {
  const { t, currentLocale, setLocale, locales, language } = useLocale();
  return { t, currentLocale, setLocale, locales, language };
};
