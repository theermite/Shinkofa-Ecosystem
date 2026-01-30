/**
 * Page Tarifs - Toutes les offres Shinkofa (Tarifs Officiels 2026)
 */

import { useTranslation } from 'react-i18next';

export function Tarifs() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
          {t('pricing.title')}
        </h1>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 max-w-3xl mx-auto mb-4">
          {t('pricing.subtitle')}
        </p>
        <p className="text-lg text-accent-lumineux font-semibold">
          {t('pricing.alphaOffer')}
        </p>
      </section>

      {/* Badge Pionniers Alpha */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border-4 border-yellow-400 dark:border-yellow-600">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🏅</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
              {t('pricing.pioneers.title')}
            </h2>
            <p className="text-lg text-bleu-profond dark:text-blanc-pur">
              {t('pricing.pioneers.subtitle')}
            </p>
          </div>

          {/* Compteur de places */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl mb-6 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.pioneers.spotsRemaining')}
              </p>
              <div className="text-6xl font-black text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
                100 / 100
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('pricing.pioneers.releaseDate')}
              </p>
            </div>
          </div>

          {/* Avantages Pionniers */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
              <p className="text-xl font-bold text-green-700 dark:text-green-300 mb-1">
                {t('pricing.pioneers.benefits.discount.title')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('pricing.pioneers.benefits.discount.description')}
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-1">
                {t('pricing.pioneers.benefits.badge.title')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('pricing.pioneers.benefits.badge.description')}
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                {t('pricing.pioneers.benefits.calls.title')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('pricing.pioneers.benefits.calls.description')}
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                {t('pricing.pioneers.benefits.influence.title')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('pricing.pioneers.benefits.influence.description')}
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {t('pricing.pioneers.availability')}
          </p>
        </div>
      </div>

      {/* Grille d'offres COMPLÈTE */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
          {t('pricing.subscriptions.title')}
        </h2>
        <p className="text-center text-bleu-profond/70 dark:text-blanc-pur/70 mb-12">
          {t('pricing.subscriptions.subtitle')}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Musha (Gratuit) */}
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🌱</div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.plans.musha.name')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.plans.musha.tagline')}
              </p>
              <div className="text-4xl font-black text-green-600 dark:text-green-400">
                {t('pricing.plans.musha.price')}
              </div>
            </div>

            <div className="space-y-2 text-sm text-bleu-profond dark:text-blanc-pur mb-6">
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.musha.features.questionnaires')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.musha.features.shizenMessages')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.musha.features.planner')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.musha.features.journal')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>{t('pricing.plans.musha.features.noFamily')}</span>
              </p>
            </div>

            <a
              href="https://app.shinkofa.com/pricing?plan=musha"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full text-center inline-block"
            >
              {t('pricing.plans.musha.cta')}
            </a>
          </div>

          {/* Samurai (Premium) - PRINCIPAL */}
          <div className="card border-4 border-accent-lumineux bg-gradient-to-br from-accent-lumineux/5 to-transparent relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-lumineux text-blanc-pur text-sm font-bold px-4 py-1 rounded-full">
              {t('pricing.plans.samurai.badge')}
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⚔️</div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.plans.samurai.name')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.plans.samurai.tagline')}
              </p>
              <div className="mb-2">
                <div className="text-2xl line-through text-gray-500 dark:text-gray-400">
                  {t('pricing.plans.samurai.originalPrice')}
                </div>
                <div className="text-4xl font-black text-green-600 dark:text-green-400">
                  {t('pricing.plans.samurai.price')}
                </div>
                <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-300 mt-1">
                  {t('pricing.plans.samurai.pioneerPrice')}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.plans.samurai.annualPrice')}
              </p>
            </div>

            <div className="space-y-2 text-sm text-bleu-profond dark:text-blanc-pur mb-6">
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.samurai.features.questionnaires')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.samurai.features.shizenMessages')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.samurai.features.planner')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.samurai.features.journal')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.samurai.features.export')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{t('pricing.plans.samurai.features.support')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-accent-lumineux">{t('pricing.plans.samurai.features.manual')}</span>
              </p>
            </div>

            <a
              href="https://app.shinkofa.com/pricing?plan=samurai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center inline-block"
            >
              {t('pricing.plans.samurai.cta')}
            </a>
          </div>

          {/* Sensei (VIP) */}
          <div className="card border-4 border-purple-500 dark:border-purple-600 bg-gradient-to-br from-purple-50/50 to-transparent relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-blanc-pur text-sm font-bold px-4 py-1 rounded-full">
              {t('pricing.plans.sensei.badge')}
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎓</div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.plans.sensei.name')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.plans.sensei.tagline')}
              </p>
              <div className="mb-2">
                <div className="text-2xl line-through text-gray-500 dark:text-gray-400">
                  {t('pricing.plans.sensei.originalPrice')}
                </div>
                <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
                  {t('pricing.plans.sensei.price')}
                </div>
                <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-300 mt-1">
                  {t('pricing.plans.sensei.pioneerPrice')}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.plans.sensei.annualPrice')}
              </p>
            </div>

            <div className="space-y-2 text-sm text-bleu-profond dark:text-blanc-pur mb-6">
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.sensei.features.includesSamurai')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.sensei.features.shizenUnlimited')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.sensei.features.planner')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.sensei.features.dictation')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.sensei.features.videoGeneration')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.sensei.features.liveSessions')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.sensei.features.support')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span className="text-accent-lumineux">{t('pricing.plans.sensei.features.manual')}</span>
              </p>
            </div>

            <a
              href="https://app.shinkofa.com/pricing?plan=sensei"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-blanc-pur font-bold py-3 px-6 rounded-shinkofa-md transition-all w-full text-center inline-block"
            >
              {t('pricing.plans.sensei.cta')}
            </a>
          </div>

          {/* Samurai Famille */}
          <div className="card border-2 border-blue-300 dark:border-blue-700">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.plans.samuraiFamily.name')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.plans.samuraiFamily.tagline')}
              </p>
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
                {t('pricing.plans.samuraiFamily.price')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.plans.samuraiFamily.annualPrice')}
              </p>
            </div>

            <div className="space-y-2 text-sm text-bleu-profond dark:text-blanc-pur mb-6">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.samuraiFamily.features.includesSamurai')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{t('pricing.plans.samuraiFamily.features.shizenMessages')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.samuraiFamily.features.familyHub')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.samuraiFamily.features.petitsLiens')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{t('pricing.plans.samuraiFamily.features.compatibility')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{t('pricing.plans.samuraiFamily.features.coaching')}</span>
              </p>
            </div>

            <a
              href="https://app.shinkofa.com/pricing?plan=samurai_famille"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center inline-block"
            >
              {t('pricing.plans.samuraiFamily.cta')}
            </a>
          </div>

          {/* Sensei Famille */}
          <div className="card border-2 border-purple-300 dark:border-purple-700">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">👨‍👩‍👧‍👦✨</div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.plans.senseiFamily.name')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.plans.senseiFamily.tagline')}
              </p>
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">
                {t('pricing.plans.senseiFamily.price')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.plans.senseiFamily.annualPrice')}
              </p>
            </div>

            <div className="space-y-2 text-sm text-bleu-profond dark:text-blanc-pur mb-6">
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.senseiFamily.features.includesSensei')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.senseiFamily.features.shizenUnlimited')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.senseiFamily.features.familyHubPro')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span><strong>{t('pricing.plans.senseiFamily.features.petitsLiensPro')}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.senseiFamily.features.coaching')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>{t('pricing.plans.senseiFamily.features.training')}</span>
              </p>
            </div>

            <a
              href="https://app.shinkofa.com/pricing?plan=sensei_famille"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-blanc-pur font-bold py-3 px-6 rounded-shinkofa-md transition-all w-full text-center inline-block"
            >
              {t('pricing.plans.senseiFamily.cta')}
            </a>
          </div>

          {/* Manuel Holistique (achat unique) */}
          <div className="card border-2 border-dore-principal">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📚</div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.plans.manual.name')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('pricing.plans.manual.tagline')}
              </p>
              <div className="text-3xl font-black text-dore-principal mb-2">
                {t('pricing.plans.manual.price')}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('pricing.plans.manual.discountedPrices')}
              </p>
            </div>

            <div className="space-y-2 text-sm text-bleu-profond dark:text-blanc-pur mb-6">
              <p className="flex items-start gap-2">
                <span className="text-dore-principal font-bold">✓</span>
                <span>{t('pricing.plans.manual.features.humanDesign')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-dore-principal font-bold">✓</span>
                <span>{t('pricing.plans.manual.features.astrology')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-dore-principal font-bold">✓</span>
                <span>{t('pricing.plans.manual.features.numerology')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-dore-principal font-bold">✓</span>
                <span>{t('pricing.plans.manual.features.neuroscience')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-dore-principal font-bold">✓</span>
                <span>{t('pricing.plans.manual.features.rituals')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-dore-principal font-bold">✓</span>
                <span><strong>{t('pricing.plans.manual.features.updates')}</strong></span>
              </p>
            </div>

            <a
              href="https://app.shinkofa.com/shop/manuel-holistique"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-dore-principal hover:bg-dore-principal/90 text-bleu-profond font-bold py-3 px-6 rounded-shinkofa-md transition-all w-full text-center inline-block"
            >
              {t('pricing.plans.manual.cta')}
            </a>
          </div>
        </div>
      </section>

      {/* Comparatif détaillé */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
          {t('pricing.comparison.title')}
        </h2>

        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-beige-sable dark:bg-bleu-fonce">
                <th className="text-left p-3 text-bleu-profond dark:text-blanc-pur font-bold">
                  {t('pricing.comparison.feature')}
                </th>
                <th className="text-center p-3 text-bleu-profond dark:text-blanc-pur font-bold">
                  {t('pricing.comparison.musha')}
                </th>
                <th className="text-center p-3 text-accent-lumineux font-bold">
                  {t('pricing.comparison.samurai')}
                </th>
                <th className="text-center p-3 text-blue-600 dark:text-blue-400 font-bold">
                  {t('pricing.comparison.samuraiFamily')}
                </th>
                <th className="text-center p-3 text-purple-600 dark:text-purple-400 font-bold">
                  {t('pricing.comparison.sensei')}
                </th>
                <th className="text-center p-3 text-purple-600 dark:text-purple-400 font-bold">
                  {t('pricing.comparison.senseiFamily')}
                </th>
              </tr>
            </thead>
            <tbody className="text-bleu-profond dark:text-blanc-pur">
              <tr className="border-b border-beige-sable dark:border-bleu-fonce">
                <td className="p-3 font-semibold">{t('pricing.comparison.rows.priceMonth')}</td>
                <td className="text-center p-3">0€</td>
                <td className="text-center p-3 text-green-600 font-bold">14,99€</td>
                <td className="text-center p-3">59,99€</td>
                <td className="text-center p-3 text-green-600 font-bold">29,99€</td>
                <td className="text-center p-3">119,99€</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce bg-beige-sable/30 dark:bg-bleu-fonce/30">
                <td className="p-3 font-semibold">{t('pricing.comparison.rows.profiles')}</td>
                <td className="text-center p-3">1</td>
                <td className="text-center p-3">1</td>
                <td className="text-center p-3 font-bold">5</td>
                <td className="text-center p-3">1</td>
                <td className="text-center p-3 font-bold">5 VIP</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce">
                <td className="p-3">{t('pricing.comparison.rows.questionnaires')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.onePerMonth')}</td>
                <td className="text-center p-3">♾️</td>
                <td className="text-center p-3">♾️</td>
                <td className="text-center p-3">♾️</td>
                <td className="text-center p-3">♾️</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce bg-beige-sable/30 dark:bg-bleu-fonce/30">
                <td className="p-3">{t('pricing.comparison.rows.shizenIA')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.fiftyPerMonth')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.twoHundredPerMonth')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.twoHundredTimesFive')}</td>
                <td className="text-center p-3 font-bold text-purple-600">♾️</td>
                <td className="text-center p-3 font-bold text-purple-600">{t('pricing.comparison.values.unlimitedTimesFive')}</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce">
                <td className="p-3">{t('pricing.comparison.rows.plannerProjects')}</td>
                <td className="text-center p-3">2</td>
                <td className="text-center p-3">10</td>
                <td className="text-center p-3">10</td>
                <td className="text-center p-3">♾️</td>
                <td className="text-center p-3">♾️</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce bg-beige-sable/30 dark:bg-bleu-fonce/30">
                <td className="p-3">{t('pricing.comparison.rows.tasksPerProject')}</td>
                <td className="text-center p-3">10</td>
                <td className="text-center p-3">50</td>
                <td className="text-center p-3">50</td>
                <td className="text-center p-3">♾️</td>
                <td className="text-center p-3">♾️</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce">
                <td className="p-3">{t('pricing.comparison.rows.familyHub')}</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅ Pro</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce bg-beige-sable/30 dark:bg-bleu-fonce/30">
                <td className="p-3">{t('pricing.comparison.rows.petitsLiens')}</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅ Pro</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce">
                <td className="p-3">{t('pricing.comparison.rows.voiceDictation')}</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce bg-beige-sable/30 dark:bg-bleu-fonce/30">
                <td className="p-3">{t('pricing.comparison.rows.videoGeneration')}</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
              </tr>
              <tr className="border-b border-beige-sable dark:border-bleu-fonce">
                <td className="p-3">{t('pricing.comparison.rows.support')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.email48h')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.email24hChat')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.email24hChat')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.vipOneToOne')}</td>
                <td className="text-center p-3">{t('pricing.comparison.values.vipFamilyCall')}</td>
              </tr>
              <tr>
                <td className="p-3">{t('pricing.comparison.rows.manual')}</td>
                <td className="text-center p-3">29€</td>
                <td className="text-center p-3 text-green-600 font-bold">20,30€</td>
                <td className="text-center p-3 text-green-600 font-bold">20,30€</td>
                <td className="text-center p-3 text-green-600 font-bold">14,50€</td>
                <td className="text-center p-3 text-green-600 font-bold">14,50€</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-sm text-bleu-profond/60 dark:text-blanc-pur/60 mt-6">
          <strong>{t('pricing.comparison.legend.label')}</strong> {t('pricing.comparison.legend.text')}
        </p>
      </section>

      {/* FAQ Tarifs */}
      <section className="py-16 border-t border-beige-sable dark:border-bleu-fonce">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
            {t('pricing.faq.title')}
          </h2>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.faq.pioneer.question')}
              </h3>
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('pricing.faq.pioneer.answer')}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.faq.annual.question')}
              </h3>
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('pricing.faq.annual.answer')}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.faq.family.question')}
              </h3>
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('pricing.faq.family.answer')}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.faq.senseiVsSamurai.question')}
              </h3>
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('pricing.faq.senseiVsSamurai.answer')}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.faq.changePlan.question')}
              </h3>
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('pricing.faq.changePlan.answer')}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('pricing.faq.manual.question')}
              </h3>
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('pricing.faq.manual.answer')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-center">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('pricing.cta.title')}
          </h2>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
            {t('pricing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://app.shinkofa.com/pricing?plan=musha"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              {t('pricing.cta.samuraiButton')}
              <span className="block text-xs opacity-80 mt-1">{t('pricing.cta.samuraiSubtext')}</span>
            </a>
            <a
              href="https://app.shinkofa.com/pricing?plan=musha"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-blanc-pur font-bold py-3 px-6 rounded-shinkofa-md transition-all inline-block"
            >
              {t('pricing.cta.senseiButton')}
              <span className="block text-xs opacity-80 mt-1">{t('pricing.cta.senseiSubtext')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
