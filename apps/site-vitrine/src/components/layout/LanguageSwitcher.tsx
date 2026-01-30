/**
 * Composant de changement de langue avec drapeaux SVG
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { locales, type Locale, localeNames } from '../../i18n/i18n';

// Drapeau France SVG
function FranceFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#fff" />
      <rect width="213.3" height="480" fill="#002654" />
      <rect x="426.7" width="213.3" height="480" fill="#ce1126" />
    </svg>
  );
}

// Drapeau UK SVG
function UKFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
      <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
      <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
      <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
    </svg>
  );
}

// Drapeau Espagne SVG
function SpainFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <path fill="#c60b1e" d="M0 0h640v480H0z" />
      <path fill="#ffc400" d="M0 120h640v240H0z" />
    </svg>
  );
}

const FlagComponents: Record<Locale, React.FC<{ className?: string }>> = {
  fr: FranceFlag,
  en: UKFlag,
  es: SpainFlag,
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = (i18n.language as Locale) || 'fr';

  const handleLocaleChange = (newLocale: Locale) => {
    i18n.changeLanguage(newLocale);
    setIsOpen(false);
  };

  const CurrentFlag = FlagComponents[currentLocale] || FranceFlag;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce transition-colors focus-visible-ring"
        aria-label="Changer de langue"
        aria-expanded={isOpen}
      >
        <CurrentFlag className="w-5 h-4 rounded-sm" />
        <span className="hidden sm:inline text-sm font-medium">
          {localeNames[currentLocale]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-blanc-pur dark:bg-bleu-profond border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm shadow-shinkofa-lg overflow-hidden z-50">
            {locales.map((loc) => {
              const Flag = FlagComponents[loc];
              return (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    loc === currentLocale
                      ? 'bg-accent-lumineux/10 text-accent-lumineux'
                      : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                  }`}
                >
                  <Flag className="w-5 h-4 rounded-sm" />
                  <span className="font-medium">{localeNames[loc]}</span>
                  {loc === currentLocale && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
