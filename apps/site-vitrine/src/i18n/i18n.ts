/**
 * Configuration i18n avec react-i18next
 * Supporte FR (defaut) et EN, extensible pour ES
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from '../locales/fr.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

export const locales = ['fr', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'FR',
  en: 'ENG',
  es: 'ESP',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: defaultLocale,
    supportedLngs: locales as unknown as string[],
    interpolation: {
      escapeValue: false, // React echappe deja
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'shinkofa-lang',
    },
  });

export default i18n;
