/**
 * @shinkofa/i18n
 * Multilingual system (FR/EN/ES) for Shinkofa ecosystem
 */

// Configuration
export {
  initI18n,
  addResources,
  changeLanguage,
  getCurrentLanguage,
  loadLocalePreference,
  detectBrowserLanguage,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  i18n,
} from './config';

// Hooks
export {
  useTranslation,
  useLocale,
  useFormattedDate,
  useFormattedNumber,
  useFormattedCurrency,
} from './hooks';

// Utils
export {
  t,
  hasTranslation,
  getNamespaceTranslations,
  pluralize,
  formatRelativeTime,
  getLocaleFlag,
  isRTL,
  getTextDirection,
} from './utils';

// Types
export type { I18nConfig } from './config';
