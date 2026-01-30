/**
 * Page Mentions Légales
 */

import { useTranslation } from 'react-i18next';

export function MentionsLegales() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-bleu-profond dark:text-blanc-pur mb-8">
          {t('legal.title')}
        </h1>

        <div className="card space-y-8">
          {/* Éditeur du site */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('legal.editor.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-2">
              <p>
                <strong>{t('legal.editor.commercialName')}</strong> La Voie Shinkofa
              </p>
              <p>
                <strong>{t('legal.editor.founder')}</strong> Jay "The Ermite"
              </p>
              <p>
                <strong>{t('legal.editor.headquarters')}</strong> Espagne
              </p>
              <p>
                <strong>{t('legal.editor.email')}</strong>{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
              </p>
              <p>
                <strong>{t('legal.editor.website')}</strong>{' '}
                <a
                  href="https://shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://shinkofa.com
                </a>
              </p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('legal.hosting.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-2">
              <p>
                <strong>{t('legal.hosting.provider')}</strong> OVH
              </p>
              <p>
                <strong>{t('legal.hosting.company')}</strong> OVH SAS
              </p>
              <p>
                <strong>{t('legal.hosting.address')}</strong> 2 rue Kellermann - 59100 Roubaix - France
              </p>
              <p>
                <strong>{t('legal.hosting.phone')}</strong> 1007
              </p>
              <p>
                <strong>{t('legal.hosting.website')}</strong>{' '}
                <a
                  href="https://www.ovh.com"
                  className="text-accent-lumineux hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.ovh.com
                </a>
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('legal.ip.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                {t('legal.ip.content')}
              </p>
              <p>
                {t('legal.ip.reproduction')}
              </p>
              <p>
                <strong>{t('legal.ip.copyright')}</strong>
              </p>
            </div>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('legal.liability.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                {t('legal.liability.content')}
              </p>
              <p>
                {t('legal.liability.report')}{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
                .
              </p>
              <p className="font-semibold">
                {t('legal.liability.disclaimer')}
              </p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('legal.links.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                {t('legal.links.content')}
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('legal.law.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                {t('legal.law.content')}
              </p>
            </div>
          </section>

          {/* Date de mise à jour */}
          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
              <strong>{t('legal.lastUpdate')}</strong> {t('legal.january2026')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
