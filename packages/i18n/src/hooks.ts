/**
 * React hooks for i18n
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import type { Locale } from './types';
import {
  changeLanguage,
  getCurrentLanguage,
  loadLocalePreference,
  detectBrowserLanguage,
} from './config';

/**
 * Hook for translations (re-export with type safety)
 */
export function useTranslation(namespace?: string) {
  return useI18nTranslation(namespace);
}

/**
 * Hook for locale management
 */
export function useLocale() {
  const [locale, setLocale] = useState<Locale>(getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved preference or detect browser language on mount
    const savedLocale = loadLocalePreference();
    const initialLocale = savedLocale || detectBrowserLanguage();

    if (initialLocale !== locale) {
      changeLanguageWithState(initialLocale);
    }
  }, []);

  const changeLanguageWithState = async (newLocale: Locale) => {
    setIsLoading(true);
    try {
      await changeLanguage(newLocale);
      setLocale(newLocale);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locale,
    changeLanguage: changeLanguageWithState,
    isLoading,
  };
}

/**
 * Hook for formatted date
 */
export function useFormattedDate() {
  const { locale } = useLocale();

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const localeMap: Record<Locale, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    };

    return new Intl.DateTimeFormat(localeMap[locale], options).format(date);
  };

  return { formatDate };
}

/**
 * Hook for formatted number
 */
export function useFormattedNumber() {
  const { locale } = useLocale();

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    const localeMap: Record<Locale, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    };

    return new Intl.NumberFormat(localeMap[locale], options).format(num);
  };

  return { formatNumber };
}

/**
 * Hook for formatted currency
 */
export function useFormattedCurrency() {
  const { locale } = useLocale();

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    const localeMap: Record<Locale, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    };

    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return { formatCurrency };
}
