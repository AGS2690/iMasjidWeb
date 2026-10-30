import { useContext } from 'react';
import { LocaleContext } from '../context/localeContextStore';

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};

export const useTranslation = () => {
  const { t, currentLocale, setLocale, locales, language } = useLocale();
  return { t, currentLocale, setLocale, locales, language };
};
