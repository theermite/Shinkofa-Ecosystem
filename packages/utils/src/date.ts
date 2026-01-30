/**
 * Date utilities for Shinkofa ecosystem
 */

import type { Locale } from '@shinkofa/types';

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format time according to locale
 */
export function formatTime(date: Date, locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(date: Date, locale: Locale): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

/**
 * Get relative time string (e.g., "il y a 2 heures", "2 hours ago")
 */
export function getRelativeTime(date: Date, locale: Locale): string {
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
      year: 'an',
      month: 'mois',
      week: 'semaine',
      day: 'jour',
      hour: 'heure',
      minute: 'minute',
      ago: 'il y a',
      plural: 's',
    },
    en: {
      year: 'year',
      month: 'month',
      week: 'week',
      day: 'day',
      hour: 'hour',
      minute: 'minute',
      ago: 'ago',
      plural: 's',
    },
    es: {
      year: 'año',
      month: 'mes',
      week: 'semana',
      day: 'día',
      hour: 'hora',
      minute: 'minuto',
      ago: 'hace',
      plural: 's',
    },
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const t = translations[locale];
      const unitName = t[unit as keyof typeof t] as string;
      const pluralSuffix = interval > 1 ? t.plural : '';
      return `${t.ago} ${interval} ${unitName}${pluralSuffix}`;
    }
  }

  return translations[locale].ago + ' 1 ' + translations[locale].minute;
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
