/**
 * Page de présentation complète de Shinkofa
 * Basée sur le système de slides de l'ancienne version
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Presentation() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12">
      {/* Section 1: Introduction */}
      <section className="py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-6">
          {t('presentation.intro.title')}
        </h1>
        <h2 className="text-2xl md:text-3xl text-center text-bleu-profond/80 dark:text-blanc-pur/80 mb-12">
          {t('presentation.intro.subtitle')}
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.intro.uniqueBrain.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.intro.uniqueBrain.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.intro.promise.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.intro.promise.description')}
            </p>
          </div>
        </div>

        <p className="text-lg text-center text-bleu-profond dark:text-blanc-pur max-w-3xl mx-auto">
          <strong>{t('presentation.intro.imagine.intro')}</strong>{t('presentation.intro.imagine.description')}
          <br /><br />
          <strong>{t('presentation.intro.imagine.conclusion')}</strong>
        </p>
      </section>

      {/* Section 2: Le Defi Neurodivergent */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-6">
          {t('presentation.challenge.title')}
        </h2>
        <p className="text-xl text-center text-bleu-profond/80 dark:text-blanc-pur/80 mb-12">
          {t('presentation.challenge.subtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.challenge.organization.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.challenge.organization.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.challenge.cognitive.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.challenge.cognitive.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.challenge.social.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.challenge.social.description')}
            </p>
          </div>
        </div>

        <p className="text-lg text-center text-bleu-profond dark:text-blanc-pur mt-8">
          <strong>{t('presentation.challenge.result.label')}</strong> {t('presentation.challenge.result.description')}
        </p>
      </section>

      {/* Section 3: Notre Mission */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-6">
          {t('presentation.mission.title')}
        </h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-center text-bleu-profond dark:text-blanc-pur mb-8">
            <strong>{t('presentation.mission.mainText')}</strong>
          </p>
          <p className="text-lg text-center text-bleu-profond/70 dark:text-blanc-pur/70">
            {t('presentation.mission.description')}
          </p>
        </div>
      </section>

      {/* Section 4: Fondations Philosophiques */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
          {t('presentation.philosophy.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-5xl mb-4">{t('presentation.philosophy.sankofa.icon')}</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.philosophy.sankofa.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              <em>{t('presentation.philosophy.sankofa.quote')}</em> {t('presentation.philosophy.sankofa.description')}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-5xl mb-4">{t('presentation.philosophy.bushido.icon')}</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.philosophy.bushido.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.philosophy.bushido.description')}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-5xl mb-4">{t('presentation.philosophy.jedi.icon')}</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.philosophy.jedi.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.philosophy.jedi.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Notre Revolution */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-6">
          {t('presentation.revolution.title')}
        </h2>
        <p className="text-xl text-center text-bleu-profond/80 dark:text-blanc-pur/80 mb-12">
          {t('presentation.revolution.subtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-5xl mb-4">{t('presentation.revolution.personalization.icon')}</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.revolution.personalization.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.revolution.personalization.description')}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-5xl mb-4">{t('presentation.revolution.empathy.icon')}</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.revolution.empathy.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.revolution.empathy.description')}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-5xl mb-4">{t('presentation.revolution.evolution.icon')}</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.revolution.evolution.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.revolution.evolution.description')}
            </p>
          </div>
        </div>

        <p className="text-lg text-center text-bleu-profond dark:text-blanc-pur mt-8">
          <strong>{t('presentation.revolution.conclusion.bold')}</strong> {t('presentation.revolution.conclusion.text')}
        </p>
      </section>

      {/* Section 6: L'Approche Tri-Dimensionnelle */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-6">
          {t('presentation.triDimensional.title')}
        </h2>
        <p className="text-xl text-center text-bleu-profond/80 dark:text-blanc-pur/80 mb-12">
          {t('presentation.triDimensional.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.triDimensional.somatic.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.triDimensional.somatic.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.triDimensional.transcognitive.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.triDimensional.transcognitive.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.triDimensional.ontological.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('presentation.triDimensional.ontological.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: L'Ecosysteme */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
          {t('presentation.ecosystem.title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.ecosystem.companion.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              {t('presentation.ecosystem.companion.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.ecosystem.planner.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              {t('presentation.ecosystem.planner.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.ecosystem.community.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              {t('presentation.ecosystem.community.description')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('presentation.ecosystem.sovereignty.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              {t('presentation.ecosystem.sovereignty.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Statut du Projet */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <div className="max-w-3xl mx-auto card text-center">
          <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('presentation.status.title')}
          </h2>
          <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
            {t('presentation.status.description')}
          </p>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
            {t('presentation.status.questionnaire')}
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-center border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl md:text-4xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
          {t('presentation.cta.title')}
        </h2>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 mb-8 max-w-2xl mx-auto">
          {t('presentation.cta.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/questionnaire" className="btn-primary">
            {t('presentation.cta.questionnaire')}
          </Link>
          <Link to="/contribuer" className="btn-secondary">
            {t('presentation.cta.offers')}
          </Link>
        </div>
      </section>
    </div>
  );
}
