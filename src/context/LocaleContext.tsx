import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { SupportedLocale } from '../types';
import { localesApi } from '../api/localesApi';
import { translate, resolveLanguageCode } from '../utils/i18n';
import { LocaleContext } from './localeContextStore';

const STORAGE_KEY = 'imasjid_selected_locale';

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
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.cultureCode || parsed.id)) {
          return parsed;
        }
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

      if (list.length > 0) {
        setLocales(list);

        setCurrentLocale((prev) => {
          // Reconcile saved locale with latest backend database records
          if (prev) {
            const matched = list.find(
              (l) =>
                (prev.id && l.id === prev.id) ||
                (prev.cultureCode && l.cultureCode?.toLowerCase() === prev.cultureCode.toLowerCase())
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
            return defaultLocale;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Could not fetch supported locales from database service:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let retries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const init = async () => {
      await fetchLocales();
      if (retries < 3) {
        retries++;
        timer = setTimeout(init, 3000);
      }
    };
    init();

    const onRefetch = () => {
      fetchLocales();
    };
    window.addEventListener('focus', onRefetch);
    window.addEventListener('imasjid_auth_login', onRefetch);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', onRefetch);
      window.removeEventListener('imasjid_auth_login', onRefetch);
    };
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
