/**
 * Composant Header complet pour le site Shinkofa
 * Structure menu : La Voie (dropdown), Tarifs, Soutenir, Pionniers, Contact
 */

import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoieDropdownOpen, setIsVoieDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-blanc-pur/95 dark:bg-bleu-profond/95 backdrop-blur-sm shadow-shinkofa-sm">
      <div className="container-shinkofa">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="focus-visible-ring rounded-lg">
            <img
              src="/logo-shinkofa.png"
              alt="Logo Shinkofa"
              className="h-6 md:h-8 w-auto object-contain"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navigation principale">
            {/* La Voie - Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsVoieDropdownOpen(true)}
              onMouseLeave={() => setIsVoieDropdownOpen(false)}
            >
              <button
                className={`font-medium transition-colors focus-visible-ring px-3 py-2 rounded-md flex items-center gap-1 ${
                  isActive('/') || isActive('/ecosysteme') || isActive('/presentation')
                    ? 'text-accent-lumineux'
                    : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux dark:hover:text-accent-doux'
                }`}
              >
                {t('nav.laVoie')}
                <svg className={`w-4 h-4 transition-transform ${isVoieDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isVoieDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-blanc-pur dark:bg-bleu-profond border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm shadow-shinkofa-lg overflow-hidden">
                  <Link
                    to="/"
                    className="block px-4 py-3 hover:bg-beige-sable dark:hover:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur transition-colors"
                    onClick={() => setIsVoieDropdownOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <span>🏠</span>
                      <span className="font-medium">{t('nav.home')}</span>
                    </div>
                  </Link>
                  <Link
                    to="/ecosysteme"
                    className="block px-4 py-3 hover:bg-beige-sable dark:hover:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur transition-colors"
                    onClick={() => setIsVoieDropdownOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span className="font-medium">{t('nav.ecosystem')}</span>
                    </div>
                  </Link>
                  <Link
                    to="/presentation"
                    className="block px-4 py-3 hover:bg-beige-sable dark:hover:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur transition-colors"
                    onClick={() => setIsVoieDropdownOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <span>📖</span>
                      <span className="font-medium">{t('nav.presentation')}</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Tarifs */}
            <Link
              to="/tarifs"
              className={`font-medium transition-colors focus-visible-ring px-3 py-2 rounded-md ${
                isActive('/tarifs')
                  ? 'text-accent-lumineux border-b-2 border-accent-lumineux'
                  : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux dark:hover:text-accent-doux'
              }`}
            >
              {t('nav.pricing')}
            </Link>

            {/* Soutenir */}
            <Link
              to="/soutenir"
              className={`font-medium transition-colors focus-visible-ring px-3 py-2 rounded-md ${
                isActive('/soutenir')
                  ? 'text-accent-lumineux border-b-2 border-accent-lumineux'
                  : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux dark:hover:text-accent-doux'
              }`}
            >
              {t('nav.support')}
            </Link>

            {/* Pionniers */}
            <Link
              to="/pionniers"
              className={`font-medium transition-colors focus-visible-ring px-3 py-2 rounded-md ${
                isActive('/pionniers')
                  ? 'text-accent-lumineux border-b-2 border-accent-lumineux'
                  : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux dark:hover:text-accent-doux'
              }`}
            >
              {t('nav.pioneers')}
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className={`font-medium transition-colors focus-visible-ring px-3 py-2 rounded-md ${
                isActive('/contact')
                  ? 'text-accent-lumineux border-b-2 border-accent-lumineux'
                  : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux dark:hover:text-accent-doux'
              }`}
            >
              {t('nav.contact')}
            </Link>

            <LanguageSwitcher />
            <ThemeToggle />
          </nav>

          {/* Bouton menu mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-bleu-profond dark:text-blanc-pur focus-visible-ring rounded-md"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Mobile */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-beige-sable dark:border-bleu-fonce" role="navigation" aria-label="Navigation mobile">
            <div className="flex flex-col space-y-2">
              {/* La Voie section */}
              <div className="px-4 py-2">
                <p className="text-xs font-bold text-bleu-profond/50 dark:text-blanc-pur/50 uppercase tracking-wider mb-2">
                  {t('nav.laVoie')}
                </p>
                <div className="pl-4 space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                      isActive('/')
                        ? 'bg-accent-lumineux text-blanc-pur'
                        : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                    }`}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/ecosysteme"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                      isActive('/ecosysteme')
                        ? 'bg-accent-lumineux text-blanc-pur'
                        : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                    }`}
                  >
                    {t('nav.ecosystem')}
                  </Link>
                  <Link
                    to="/presentation"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                      isActive('/presentation')
                        ? 'bg-accent-lumineux text-blanc-pur'
                        : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                    }`}
                  >
                    {t('nav.presentation')}
                  </Link>
                </div>
              </div>

              <Link
                to="/tarifs"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                  isActive('/tarifs')
                    ? 'bg-accent-lumineux text-blanc-pur'
                    : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                }`}
              >
                {t('nav.pricing')}
              </Link>

              <Link
                to="/soutenir"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                  isActive('/soutenir')
                    ? 'bg-accent-lumineux text-blanc-pur'
                    : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                }`}
              >
                {t('nav.support')}
              </Link>

              <Link
                to="/pionniers"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                  isActive('/pionniers')
                    ? 'bg-accent-lumineux text-blanc-pur'
                    : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                }`}
              >
                {t('nav.pioneers')}
              </Link>

              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus-visible-ring ${
                  isActive('/contact')
                    ? 'bg-accent-lumineux text-blanc-pur'
                    : 'text-bleu-profond dark:text-blanc-pur hover:bg-beige-sable dark:hover:bg-bleu-fonce'
                }`}
              >
                {t('nav.contact')}
              </Link>

              <div className="px-4 py-2 flex items-center gap-4">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
