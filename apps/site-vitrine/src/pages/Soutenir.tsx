/**
 * Support Page - Soutenir Shinkofa
 * Shinkofa Platform - Donations & Community Support
 * Approche "Honnêteté Familiale"
 * Converted from Next.js to React
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Soutenir() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-yellow-300 mb-4">
          {t('support.title')}
        </h1>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80">
          {t('support.subtitle')}
        </p>
      </div>

      {/* Histoire personnelle */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 shadow-xl border-2 border-blue-200 dark:border-blue-700 mb-12">
        <h2 className="text-2xl font-bold text-bleu-profond dark:text-blue-300 mb-4 flex items-center gap-2">
          {t('support.whoWeAre.title')}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-bleu-profond dark:text-blanc-pur mb-4" dangerouslySetInnerHTML={{ __html: t('support.whoWeAre.p1') }} />
          <p className="text-lg text-bleu-profond dark:text-blanc-pur mb-4" dangerouslySetInnerHTML={{ __html: t('support.whoWeAre.p2') }} />
          <p className="text-lg text-bleu-profond dark:text-blanc-pur" dangerouslySetInnerHTML={{ __html: t('support.whoWeAre.p3') }} />
        </div>
      </div>

      {/* Impact des dons */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-bleu-profond dark:text-yellow-300 mb-6 text-center">
          {t('support.impact.title')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card border-2 border-green-200 dark:border-green-700 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
              {t('support.impact.rd.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.impact.rd.description')}
            </p>
          </div>

          <div className="card border-2 border-purple-200 dark:border-purple-700 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
              {t('support.impact.design.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.impact.design.description')}
            </p>
          </div>

          <div className="card border-2 border-orange-200 dark:border-orange-700 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-2">
              {t('support.impact.content.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.impact.content.description')}
            </p>
          </div>

          <div className="card border-2 border-blue-200 dark:border-blue-700 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">
              {t('support.impact.community.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.impact.community.description')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Dons */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400 dark:border-yellow-600 mb-12">
        <h2 className="text-3xl font-bold text-bleu-profond dark:text-yellow-300 mb-6 text-center">
          {t('support.howToSupport.title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* PayPal - Don unique */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">💙</div>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
              {t('support.howToSupport.oneTime.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-6">
              {t('support.howToSupport.oneTime.description')}
            </p>
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=T72J2876UEUKE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              {t('support.howToSupport.oneTime.cta')}
            </a>
          </div>

          {/* Patreon - Don récurrent */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">
              {t('support.howToSupport.monthly.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-6">
              {t('support.howToSupport.monthly.description')}
            </p>
            <a
              href="https://www.patreon.com/cw/TheErmite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              {t('support.howToSupport.monthly.cta')}
            </a>
          </div>
        </div>

        {/* Transparence */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 backdrop-blur-sm border-2 border-yellow-300 dark:border-yellow-700">
          <h3 className="text-xl font-bold text-bleu-profond dark:text-yellow-300 mb-3 flex items-center gap-2">
            {t('support.howToSupport.transparency.title')}
          </h3>
          <ul className="space-y-2 text-bleu-profond dark:text-blanc-pur">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span dangerouslySetInnerHTML={{ __html: t('support.howToSupport.transparency.item1') }} />
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span dangerouslySetInnerHTML={{ __html: t('support.howToSupport.transparency.item2') }} />
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span dangerouslySetInnerHTML={{ __html: t('support.howToSupport.transparency.item3') }} />
            </li>
          </ul>
        </div>
      </div>

      {/* Alternatives sans argent */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-bleu-profond dark:text-yellow-300 mb-6 text-center">
          {t('support.noMoney.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center border-2 border-purple-300 dark:border-purple-700">
            <div className="text-4xl mb-3">📢</div>
            <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2">{t('support.noMoney.share.title')}</h3>
            <p className="text-sm text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.noMoney.share.description')}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center border-2 border-green-300 dark:border-green-700">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold text-green-700 dark:text-green-300 mb-2">{t('support.noMoney.testify.title')}</h3>
            <p className="text-sm text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.noMoney.testify.description')}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border-2 border-blue-300 dark:border-blue-700">
            <div className="text-4xl mb-3">🐛</div>
            <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">{t('support.noMoney.bugs.title')}</h3>
            <p className="text-sm text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('support.noMoney.bugs.description')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="text-center">
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 mb-6">
          {t('support.thanks')}
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-bleu-profond to-accent-lumineux hover:from-blue-700 hover:to-orange-600 text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
        >
          {t('support.backHome')}
        </Link>
      </div>
    </div>
  );
}
