/**
 * Page Politique de Confidentialité (RGPD)
 */

import { useTranslation } from 'react-i18next';

export function PolitiqueConfidentialite() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-bleu-profond dark:text-blanc-pur mb-8">
          {t('privacy.title')}
        </h1>

        <div className="card space-y-8">
          {/* Introduction */}
          <section>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.intro')}</p>
              <p className="font-semibold text-accent-lumineux">
                {t('privacy.commitment')}
              </p>
            </div>
          </section>

          {/* Responsable du traitement */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.controller.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-2">
              <p>
                <strong>{t('privacy.sections.controller.commercialName')}</strong> La Voie Shinkofa
              </p>
              <p>
                <strong>{t('privacy.sections.controller.founder')}</strong> Jay "The Ermite"
              </p>
              <p>
                <strong>{t('privacy.sections.controller.email')}</strong>{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
              </p>
              <p>
                <strong>{t('privacy.sections.controller.website')}</strong>{' '}
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

          {/* Données collectées */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.data.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.data.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.data.identification')}</strong>{' '}
                  {t('privacy.sections.data.identificationDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.data.profile')}</strong>{' '}
                  {t('privacy.sections.data.profileDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.data.usage')}</strong>{' '}
                  {t('privacy.sections.data.usageDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.data.technical')}</strong>{' '}
                  {t('privacy.sections.data.technicalDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.data.payment')}</strong>{' '}
                  {t('privacy.sections.data.paymentDesc')}
                </li>
              </ul>
            </div>
          </section>

          {/* Finalités du traitement */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.purposes.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.purposes.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>{t('privacy.sections.purposes.purpose1')}</li>
                <li>{t('privacy.sections.purposes.purpose2')}</li>
                <li>{t('privacy.sections.purposes.purpose3')}</li>
                <li>{t('privacy.sections.purposes.purpose4')}</li>
                <li>{t('privacy.sections.purposes.purpose5')}</li>
                <li>{t('privacy.sections.purposes.purpose6')}</li>
                <li>{t('privacy.sections.purposes.purpose7')}</li>
              </ul>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.legalBasis.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.legalBasis.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.legalBasis.consent')}</strong>{' '}
                  {t('privacy.sections.legalBasis.consentDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.legalBasis.contract')}</strong>{' '}
                  {t('privacy.sections.legalBasis.contractDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.legalBasis.legal')}</strong>{' '}
                  {t('privacy.sections.legalBasis.legalDesc')}
                </li>
              </ul>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.retention.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.retention.profile')}</strong>{' '}
                  {t('privacy.sections.retention.profileDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.retention.payment')}</strong>{' '}
                  {t('privacy.sections.retention.paymentDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.retention.technical')}</strong>{' '}
                  {t('privacy.sections.retention.technicalDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.retention.deletion')}</strong>{' '}
                  {t('privacy.sections.retention.deletionDesc')}
                </li>
              </ul>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.security.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.security.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.security.hosting')}</strong>{' '}
                  {t('privacy.sections.security.hostingDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.security.encryption')}</strong>{' '}
                  {t('privacy.sections.security.encryptionDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.security.auth')}</strong>{' '}
                  {t('privacy.sections.security.authDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.security.access')}</strong>{' '}
                  {t('privacy.sections.security.accessDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.security.backups')}</strong>{' '}
                  {t('privacy.sections.security.backupsDesc')}
                </li>
              </ul>
            </div>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.sharing.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p className="font-semibold text-accent-lumineux">
                {t('privacy.sections.sharing.noSale')}
              </p>
              <p>{t('privacy.sections.sharing.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.sharing.hosting')}</strong>{' '}
                  {t('privacy.sections.sharing.hostingDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.sharing.payment')}</strong>{' '}
                  {t('privacy.sections.sharing.paymentDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.sharing.legal')}</strong>{' '}
                  {t('privacy.sections.sharing.legalDesc')}
                </li>
              </ul>
              <p>{t('privacy.sections.sharing.noMarketing')}</p>
            </div>
          </section>

          {/* Vos droits RGPD */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.rights.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.rights.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.rights.access')}</strong>{' '}
                  {t('privacy.sections.rights.accessDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.rights.rectification')}</strong>{' '}
                  {t('privacy.sections.rights.rectificationDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.rights.erasure')}</strong>{' '}
                  {t('privacy.sections.rights.erasureDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.rights.portability')}</strong>{' '}
                  {t('privacy.sections.rights.portabilityDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.rights.objection')}</strong>{' '}
                  {t('privacy.sections.rights.objectionDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.rights.restriction')}</strong>{' '}
                  {t('privacy.sections.rights.restrictionDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.rights.withdraw')}</strong>{' '}
                  {t('privacy.sections.rights.withdrawDesc')}
                </li>
              </ul>
              <p>
                {t('privacy.sections.rights.exercise')}{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>{' '}
                {t('privacy.sections.rights.responseTime')}
              </p>
              <p>
                {t('privacy.sections.rights.cnil')}{' '}
                <a
                  href="https://www.cnil.fr"
                  className="text-accent-lumineux hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.cookies.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.cookies.intro')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>{t('privacy.sections.cookies.essential')}</strong>{' '}
                  {t('privacy.sections.cookies.essentialDesc')}
                </li>
                <li>
                  <strong>{t('privacy.sections.cookies.functional')}</strong>{' '}
                  {t('privacy.sections.cookies.functionalDesc')}
                </li>
              </ul>
              <p className="font-semibold">
                {t('privacy.sections.cookies.noTracking')}
              </p>
              <p>{t('privacy.sections.cookies.browserConfig')}</p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.changes.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.changes.notice')}</p>
              <p>{t('privacy.sections.changes.acceptance')}</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('privacy.sections.contact.title')}
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('privacy.sections.contact.question')}</p>
              <p>
                <strong>{t('privacy.sections.contact.email')}</strong>{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
              </p>
            </div>
          </section>

          {/* Date de mise à jour */}
          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
              <strong>{t('privacy.lastUpdate')}</strong> {t('privacy.lastUpdateDate')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
