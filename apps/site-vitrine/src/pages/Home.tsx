/**
 * Page d'accueil Shinkofa
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="container-shinkofa py-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        {/* Badge Offre Pioneer Alpha */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400 rounded-full mb-6 animate-pulse">
          <span className="text-2xl">🏅</span>
          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-300">
            {t('home.badge.title')} • {t('home.badge.subtitle')} • {t('home.badge.discount')}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
          {t('home.hero.title')} <span className="text-accent-lumineux">{t('home.hero.titleAccent')}</span> ?
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-bleu-profond/90 dark:text-blanc-pur/90 mb-4">
          {t('home.hero.subtitle')}
        </h2>
        <p className="text-xl md:text-2xl text-bleu-profond/80 dark:text-blanc-pur/80 mb-4 max-w-3xl mx-auto">
          {t('home.hero.description')}
        </p>

        {/* Social Proof */}
        <p className="text-bleu-profond/60 dark:text-blanc-pur/60 mb-8">
          <span className="font-semibold text-accent-lumineux">{t('home.hero.socialProofCount')}</span> {t('home.hero.socialProofText')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="https://app.shinkofa.com/pricing" className="btn-primary">
            {t('home.hero.ctaPrimary')}
            <span className="block text-xs opacity-80 mt-1">{t('home.hero.ctaPrimaryDetails')}</span>
          </a>
          <Link to="/presentation" className="btn-secondary">
            {t('home.hero.ctaSecondary')}
          </Link>
        </div>
      </section>

      {/* Pain Points Section - NOUVEAU */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
          {t('home.painPoints.title')}
        </h2>
        <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12 max-w-2xl mx-auto">
          {t('home.painPoints.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">😓</div>
            <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-3">
              {t('home.painPoints.exhausted.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('home.painPoints.exhausted.description')}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">🤯</div>
            <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-3">
              {t('home.painPoints.overload.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('home.painPoints.overload.description')}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">😞</div>
            <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-3">
              {t('home.painPoints.disconnect.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('home.painPoints.disconnect.description')}
            </p>
          </div>
        </div>

        <p className="text-center text-lg font-semibold text-accent-lumineux mt-12">
          {t('home.painPoints.cta')}
        </p>
      </section>

      {/* Storytelling Section - Jay + Angélique */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
            {t('home.story.title')}
          </h2>
          <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12 max-w-2xl mx-auto">
            {t('home.story.subtitle')}
          </p>

          <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-bleu-profond dark:text-blanc-pur mb-4" dangerouslySetInnerHTML={{ __html: t('home.story.p1') }} />
              <p className="text-lg text-bleu-profond dark:text-blanc-pur mb-4" dangerouslySetInnerHTML={{ __html: t('home.story.p2') }} />
              <p className="text-lg text-bleu-profond dark:text-blanc-pur" dangerouslySetInnerHTML={{ __html: t('home.story.p3') }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
          {t('home.solution.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-3">
              {t('home.solution.adapted.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('home.solution.adapted.description')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-3">
              {t('home.solution.empathic.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('home.solution.empathic.description')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-3">
              {t('home.solution.evolution.title')}
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('home.solution.evolution.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section - Comparaison + Pioneer Offer */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
            {t('home.pricing.title')}
          </h2>
          <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12 max-w-2xl mx-auto">
            {t('home.pricing.subtitle')}
          </p>

          {/* Comparaison Thérapie vs Shinkofa */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Thérapie traditionnelle */}
            <div className="card border-2 border-gray-300 dark:border-gray-600">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🏥</div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t('home.pricing.therapy.title')}
                </h3>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span dangerouslySetInnerHTML={{ __html: t('home.pricing.therapy.point1') }} />
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>{t('home.pricing.therapy.point2')}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>{t('home.pricing.therapy.point3')}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>{t('home.pricing.therapy.point4')}</span>
                </p>
              </div>
            </div>

            {/* Shinkofa */}
            <div className="card border-4 border-accent-lumineux bg-gradient-to-br from-accent-lumineux/5 to-transparent">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🚀</div>
                <h3 className="text-2xl font-bold text-accent-lumineux mb-2">
                  {t('home.pricing.shinkofa.title')}
                </h3>
                <div className="text-4xl font-black text-green-600 dark:text-green-400">
                  {t('home.pricing.shinkofa.price')}<span className="text-xl font-normal">{t('home.pricing.shinkofa.period')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('home.pricing.shinkofa.plan')}
                </p>
              </div>
              <div className="space-y-3 text-bleu-profond dark:text-blanc-pur">
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: t('home.pricing.shinkofa.point1') }} />
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: t('home.pricing.shinkofa.point2') }} />
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: t('home.pricing.shinkofa.point3') }} />
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{t('home.pricing.shinkofa.point4')}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{t('home.pricing.shinkofa.point5')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pioneer Alpha Offer */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border-4 border-yellow-400 dark:border-yellow-600">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🏅</div>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                {t('home.pioneers.title')}
              </h3>
              <p className="text-xl text-bleu-profond dark:text-blanc-pur" dangerouslySetInnerHTML={{ __html: t('home.pioneers.subtitle') }} />
            </div>

            {/* Compteur de places (placeholder - sera remplacé par PromoCounter) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl mb-6 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                  {t('home.pioneers.counter.label')}
                </p>
                <div className="text-6xl font-black text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
                  {t('home.pioneers.counter.value')}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('home.pioneers.counter.releaseDate')}
                </p>
              </div>
            </div>

            {/* Avantages Pionniers */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
                <p className="text-xl font-bold text-green-700 dark:text-green-300 mb-1">
                  {t('home.pioneers.benefits.discount.title')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('home.pioneers.benefits.discount.description')}
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-1">
                  {t('home.pioneers.benefits.badge.title')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('home.pioneers.benefits.badge.description')}
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {t('home.pioneers.benefits.visio.title')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('home.pioneers.benefits.visio.description')}
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                  {t('home.pioneers.benefits.influence.title')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('home.pioneers.benefits.influence.description')}
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/tarifs"
                className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black text-xl py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
              >
                {t('home.pioneers.cta')}
              </Link>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                {t('home.pioneers.availability')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages Section - NOUVEAU */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
          {t('home.testimonials.title')}
        </h2>
        <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12 max-w-2xl mx-auto">
          {t('home.testimonials.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Témoignage 1 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent-lumineux/20 flex items-center justify-center text-2xl">
                👨
              </div>
              <div>
                <p className="font-bold text-bleu-profond dark:text-blanc-pur">{t('home.testimonials.alex.name')}</p>
                <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">{t('home.testimonials.alex.profile')}</p>
              </div>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 italic">
              "{t('home.testimonials.alex.quote')}"
            </p>
          </div>

          {/* Témoignage 2 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent-lumineux/20 flex items-center justify-center text-2xl">
                👩
              </div>
              <div>
                <p className="font-bold text-bleu-profond dark:text-blanc-pur">{t('home.testimonials.sarah.name')}</p>
                <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">{t('home.testimonials.sarah.profile')}</p>
              </div>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 italic">
              "{t('home.testimonials.sarah.quote')}"
            </p>
          </div>

          {/* Témoignage 3 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent-lumineux/20 flex items-center justify-center text-2xl">
                🧑
              </div>
              <div>
                <p className="font-bold text-bleu-profond dark:text-blanc-pur">{t('home.testimonials.jordan.name')}</p>
                <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">{t('home.testimonials.jordan.profile')}</p>
              </div>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 italic">
              "{t('home.testimonials.jordan.quote')}"
            </p>
          </div>
        </div>
      </section>

      {/* Comment ça marche Section - NOUVEAU */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
          {t('home.howItWorks.title')}
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-3">
                {t('home.howItWorks.step1.title')}
              </h3>
              <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>

            {/* Étape 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-3">
                {t('home.howItWorks.step2.title')}
              </h3>
              <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>

            {/* Étape 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-3">
                {t('home.howItWorks.step3.title')}
              </h3>
              <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Anti-objections */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
            {t('home.faq.title')}
          </h2>
          <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12 max-w-2xl mx-auto">
            {t('home.faq.subtitle')}
          </p>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleFAQ(1)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur">
                  {t('home.faq.q1.question')}
                </h3>
                <svg className={`w-6 h-6 text-bleu-profond dark:text-blanc-pur transition-transform ${openFAQ === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFAQ === 1 && (
                <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mt-4 pt-4 border-t border-beige-sable dark:border-bleu-fonce" dangerouslySetInnerHTML={{ __html: t('home.faq.q1.answer') }} />
              )}
            </div>

            {/* FAQ 2 */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleFAQ(2)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur">
                  {t('home.faq.q2.question')}
                </h3>
                <svg className={`w-6 h-6 text-bleu-profond dark:text-blanc-pur transition-transform ${openFAQ === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFAQ === 2 && (
                <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mt-4 pt-4 border-t border-beige-sable dark:border-bleu-fonce" dangerouslySetInnerHTML={{ __html: t('home.faq.q2.answer') }} />
              )}
            </div>

            {/* FAQ 3 */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleFAQ(3)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur">
                  {t('home.faq.q3.question')}
                </h3>
                <svg className={`w-6 h-6 text-bleu-profond dark:text-blanc-pur transition-transform ${openFAQ === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFAQ === 3 && (
                <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mt-4 pt-4 border-t border-beige-sable dark:border-bleu-fonce" dangerouslySetInnerHTML={{ __html: t('home.faq.q3.answer') }} />
              )}
            </div>

            {/* FAQ 4 */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleFAQ(4)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur">
                  {t('home.faq.q4.question')}
                </h3>
                <svg className={`w-6 h-6 text-bleu-profond dark:text-blanc-pur transition-transform ${openFAQ === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFAQ === 4 && (
                <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mt-4 pt-4 border-t border-beige-sable dark:border-bleu-fonce" dangerouslySetInnerHTML={{ __html: t('home.faq.q4.answer') }} />
              )}
            </div>

            {/* FAQ 5 */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleFAQ(5)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur">
                  {t('home.faq.q5.question')}
                </h3>
                <svg className={`w-6 h-6 text-bleu-profond dark:text-blanc-pur transition-transform ${openFAQ === 5 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFAQ === 5 && (
                <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mt-4 pt-4 border-t border-beige-sable dark:border-bleu-fonce" dangerouslySetInnerHTML={{ __html: t('home.faq.q5.answer') }} />
              )}
            </div>

            {/* FAQ 6 */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleFAQ(6)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur">
                  {t('home.faq.q6.question')}
                </h3>
                <svg className={`w-6 h-6 text-bleu-profond dark:text-blanc-pur transition-transform ${openFAQ === 6 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFAQ === 6 && (
                <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mt-4 pt-4 border-t border-beige-sable dark:border-bleu-fonce" dangerouslySetInnerHTML={{ __html: t('home.faq.q6.answer') }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline "What's Next" Section - NOUVEAU */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
          {t('home.afterQuestionnaire.title')}
        </h2>
        <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12 max-w-2xl mx-auto">
          {t('home.afterQuestionnaire.subtitle')}
        </p>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Timeline Item 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('home.afterQuestionnaire.step1.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                  {t('home.afterQuestionnaire.step1.description')}
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center font-bold">
                📊
              </div>
              <div>
                <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('home.afterQuestionnaire.step2.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                  {t('home.afterQuestionnaire.step2.description')}
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center font-bold">
                🤖
              </div>
              <div>
                <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('home.afterQuestionnaire.step3.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                  {t('home.afterQuestionnaire.step3.description')}
                </p>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center font-bold">
                📅
              </div>
              <div>
                <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('home.afterQuestionnaire.step4.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
                  {t('home.afterQuestionnaire.step4.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communauté Section */}
      <section className="py-16 text-center border-t border-beige-sable dark:border-bleu-fonce">
        <div className="card max-w-3xl mx-auto bg-gradient-to-br from-accent-doux/10 to-transparent">
          <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('home.community.title')}
          </h2>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
            <span className="font-semibold text-accent-lumineux">{t('home.community.count')}</span> {t('home.community.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://t.me/+ZOl7NJphLEw4YzQ0"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('home.community.telegramBtn')}
            </a>
            <a
              href="https://discord.gg/BdqpKZUht"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('home.community.discordBtn')}
            </a>
            <Link to="/soutenir" className="btn-secondary">
              {t('home.community.supportBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center border-t border-beige-sable dark:border-bleu-fonce">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6" dangerouslySetInnerHTML={{ __html: t('home.cta.description') }} />
          <a href="https://app.shinkofa.com/pricing" className="btn-primary inline-block">
            {t('home.cta.button')}
            <span className="block text-xs opacity-80 mt-1">{t('home.cta.buttonDetails')}</span>
          </a>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 text-center border-t border-beige-sable dark:border-bleu-fonce">
        <p className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
          {t('home.philosophy.japanese')}
        </p>
        <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 italic max-w-2xl mx-auto">
          "{t('home.philosophy.quote')}"
        </p>
      </section>
    </div>
  );
}
