/**
 * i18next configuration for Shinkofa ecosystem
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Locale } from './types';

export const DEFAULT_LOCALE: Locale = 'fr';
export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'es'];

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

export interface I18nConfig {
  defaultLocale?: Locale;
  fallbackLocale?: Locale;
  debug?: boolean;
  resources?: Record<Locale, Record<string, any>>;
}

/**
 * Initialize i18next with custom configuration
 */
export async function initI18n(config: I18nConfig = {}): Promise<typeof i18n> {
  const {
    defaultLocale = DEFAULT_LOCALE,
    fallbackLocale = DEFAULT_LOCALE,
    debug = false,
    resources = {},
  } = config;

  await i18n.use(initReactI18next).init({
    lng: defaultLocale,
    fallbackLng: fallbackLocale,
    debug,
    resources,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: true,
    },
  });

  return i18n;
}

/**
 * Add translation resources dynamically
 */
export function addResources(
  locale: Locale,
  namespace: string,
  translations: Record<string, any>
): void {
  i18n.addResourceBundle(locale, namespace, translations, true, true);
}

/**
 * Change current language
 */
export async function changeLanguage(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);

  // Save preference to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('shinkofa_locale', locale);
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Locale {
  return i18n.language as Locale;
}

/**
 * Load locale preference from localStorage
 */
export function loadLocalePreference(): Locale | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('shinkofa_locale');
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }

  return null;
}

/**
 * Detect browser language
 */
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return DEFAULT_LOCALE;
}

export { i18n };
