/**
 * i18n utility functions
 */

import type { Locale } from '@shinkofa/types';
import { i18n } from './config';

/**
 * Translate key without React context
 */
export function t(key: string, options?: Record<string, any>): string {
  return i18n.t(key, options);
}

/**
 * Check if translation key exists
 */
export function hasTranslation(key: string, locale?: Locale): boolean {
  return i18n.exists(key, { lng: locale });
}

/**
 * Get all translations for a namespace
 */
export function getNamespaceTranslations(
  namespace: string,
  locale?: Locale
): Record<string, any> {
  const lng = locale || (i18n.language as Locale);
  return i18n.getResourceBundle(lng, namespace) || {};
}

/**
 * Pluralize based on count
 */
export function pluralize(
  singularKey: string,
  pluralKey: string,
  count: number,
  options?: Record<string, any>
): string {
  const key = count === 1 ? singularKey : pluralKey;
  return t(key, { count, ...options });
}

/**
 * Format relative time (e.g., "il y a 2 heures")
 */
export function formatRelativeTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  const translations = {
    fr: {
      year: { singular: 'an', plural: 'ans' },
      month: { singular: 'mois', plural: 'mois' },
      week: { singular: 'semaine', plural: 'semaines' },
      day: { singular: 'jour', plural: 'jours' },
      hour: { singular: 'heure', plural: 'heures' },
      minute: { singular: 'minute', plural: 'minutes' },
      ago: 'il y a',
      justNow: "à l'instant",
    },
    en: {
      year: { singular: 'year', plural: 'years' },
      month: { singular: 'month', plural: 'months' },
      week: { singular: 'week', plural: 'weeks' },
      day: { singular: 'day', plural: 'days' },
      hour: { singular: 'hour', plural: 'hours' },
      minute: { singular: 'minute', plural: 'minutes' },
      ago: 'ago',
      justNow: 'just now',
    },
    es: {
      year: { singular: 'año', plural: 'años' },
      month: { singular: 'mes', plural: 'meses' },
      week: { singular: 'semana', plural: 'semanas' },
      day: { singular: 'día', plural: 'días' },
      hour: { singular: 'hora', plural: 'horas' },
      minute: { singular: 'minuto', plural: 'minutos' },
      ago: 'hace',
      justNow: 'ahora mismo',
    },
  };

  if (diffInSeconds < 60) {
    return translations[locale].justNow;
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const trans = translations[locale][unit as 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'];
      const unitName = interval === 1 ? trans.singular : trans.plural;

      if (locale === 'en') {
        return `${interval} ${unitName} ${translations[locale].ago}`;
      } else {
        return `${translations[locale].ago} ${interval} ${unitName}`;
      }
    }
  }

  return translations[locale].justNow;
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    fr: '🇫🇷',
    en: '🇬🇧',
    es: '🇪🇸',
  };
  return flags[locale];
}

/**
 * Get RTL (Right-to-Left) direction for locale
 */
export function isRTL(locale: Locale): boolean {
  // None of our supported locales are RTL, but this is here for future expansion
  const rtlLocales: Locale[] = [];
  return rtlLocales.includes(locale);
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
