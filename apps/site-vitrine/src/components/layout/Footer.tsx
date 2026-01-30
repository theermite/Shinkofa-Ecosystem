/**
 * Composant Footer pour le site Shinkofa
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-bleu-profond dark:bg-bleu-fonce text-blanc-pur py-8 mt-auto">
      <div className="container-shinkofa">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Informations légales */}
          <div className="text-center md:text-left">
            <p className="text-sm">&copy; 2025 - {t('footer.copyright')}</p>
            <p className="text-sm text-blanc-pur/70 mt-1">
              {t('footer.rights')}
            </p>
          </div>

          {/* Liens */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link
              to="/temoignages"
              className="text-sm hover:text-accent-doux transition-colors focus-visible-ring rounded px-2 py-1"
            >
              {t('footer.testimonials')}
            </Link>
            <Link
              to="/mentions-legales"
              className="text-sm hover:text-accent-doux transition-colors focus-visible-ring rounded px-2 py-1"
            >
              {t('footer.legal')}
            </Link>
            <Link
              to="/politique-confidentialite"
              className="text-sm hover:text-accent-doux transition-colors focus-visible-ring rounded px-2 py-1"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/cgv"
              className="text-sm hover:text-accent-doux transition-colors focus-visible-ring rounded px-2 py-1"
            >
              {t('footer.terms')}
            </Link>
            <a
              href="mailto:contact@shinkofa.com"
              className="text-sm hover:text-accent-doux transition-colors focus-visible-ring rounded px-2 py-1"
            >
              {t('footer.contact')}
            </a>
          </div>
        </div>

        {/* Disclaimer + Message philosophique */}
        <div className="mt-6 text-center border-t border-blanc-pur/20 pt-4 space-y-3">
          <p className="text-xs text-blanc-pur/60">
            {t('footer.disclaimer')}
          </p>
          <p className="text-sm text-blanc-pur/80 italic">
            真の歩 (Shin-Ko-Fa) - "{t('footer.tagline')}"
          </p>
        </div>
      </div>
    </footer>
  );
}
