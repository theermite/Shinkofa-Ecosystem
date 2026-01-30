/**
 * Hall of Fame Page - Pionniers Alpha 2026
 * Shinkofa Platform - Showcase of Pioneer Alpha members
 * Converted from Next.js to React
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Pioneer {
  pioneer_number: number;
  firstName: string;
  city: string;
  pioneer_claimed_at: string;
}

export function Pionniers() {
  const { t } = useTranslation();
  const [pioneers, setPioneers] = useState<Pioneer[]>([]);
  const [slotsRemaining, setSlotsRemaining] = useState(100);

  useEffect(() => {
    const fetchPioneers = async () => {
      try {
        const res = await fetch('https://app.shinkofa.com/api/auth/users/pioneers');
        if (res.ok) {
          const data = await res.json();
          setPioneers(data);
        }
      } catch (error) {
        console.error('Error fetching pioneers:', error);
      }
    };

    const fetchSlots = async () => {
      try {
        const res = await fetch('https://app.shinkofa.com/api/promo/alpha2026/slots');
        if (res.ok) {
          const data = await res.json();
          setSlotsRemaining(data.slots_remaining);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    };

    fetchPioneers();
    fetchSlots();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchPioneers();
      fetchSlots();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-shinkofa py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-profond to-accent-lumineux dark:from-yellow-300 dark:to-orange-400 mb-4">
          {t('pioneers.title')}
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-bleu-profond dark:text-yellow-300 mb-4">
          {t('pioneers.subtitle')}
        </p>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 max-w-3xl mx-auto">
          {t('pioneers.description')}
        </p>
      </div>

      {/* Compteur */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="card bg-white dark:bg-gray-800 shadow-2xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-bleu-profond/70 dark:text-blanc-pur/70 mb-3">
              {t('pioneers.slotsRemaining')}
            </p>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
              {slotsRemaining} / 100
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                style={{ width: `${(slotsRemaining / 100) * 100}%` }}
              />
            </div>
            <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
              {t('pioneers.releasedDate')}
            </p>
          </div>
        </div>
      </div>

      {/* Privilèges des Pionniers */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 shadow-xl border-4 border-yellow-400 dark:border-yellow-600 mb-12">
        <h2 className="text-3xl font-bold text-bleu-profond dark:text-yellow-300 mb-6 text-center">
          {t('pioneers.privileges.title')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
              {t('pioneers.privileges.discount.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('pioneers.privileges.discount.description')}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🏅</div>
            <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-2">
              {t('pioneers.privileges.badge.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('pioneers.privileges.badge.description')}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📹</div>
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">
              {t('pioneers.privileges.calls.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('pioneers.privileges.calls.description')}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🗳️</div>
            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
              {t('pioneers.privileges.influence.title')}
            </h3>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
              {t('pioneers.privileges.influence.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des Pionniers */}
      <div>
        <h2 className="text-3xl font-bold text-bleu-profond dark:text-yellow-300 mb-8 text-center">
          {t('pioneers.list.title')}
        </h2>

        {pioneers.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-300 dark:border-gray-700">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-2xl font-bold text-bleu-profond dark:text-yellow-300 mb-3">
              {t('pioneers.list.empty.title')}
            </p>
            <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 mb-6">
              {t('pioneers.list.empty.description')}
            </p>
            <a
              href="https://app.shinkofa.com/pricing"
              className="inline-block bg-gradient-to-r from-bleu-profond to-accent-lumineux hover:from-blue-700 hover:to-orange-600 text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              {t('pioneers.list.empty.cta')}
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pioneers.map((pioneer) => (
              <div
                key={pioneer.pioneer_number}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-bleu-profond/20 dark:border-yellow-600/30"
              >
                {/* Badge numéro */}
                <div className="text-center mb-4">
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-2xl px-4 py-2 rounded-full shadow-lg mb-2">
                    #{pioneer.pioneer_number.toString().padStart(3, '0')}
                  </div>
                  <div className="text-lg font-bold text-bleu-profond dark:text-yellow-300">
                    {t('pioneers.list.pioneerBadge')}
                  </div>
                </div>

                {/* Info utilisateur */}
                <div className="text-center">
                  <div className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-1">
                    {pioneer.firstName || t('pioneers.list.anonymous')}
                  </div>
                  <div className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
                    {pioneer.city ? `📍 ${pioneer.city}` : t('pioneers.list.world')}
                  </div>
                  <div className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 mt-2">
                    {t('pioneers.list.since')}{' '}
                    {new Date(pioneer.pioneer_claimed_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Final */}
      <div className="mt-16 text-center">
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 mb-6">
          {t('pioneers.cta.text')}
        </p>
        <a
          href="https://app.shinkofa.com/pricing"
          className="inline-block bg-gradient-to-r from-bleu-profond to-accent-lumineux hover:from-blue-700 hover:to-orange-600 text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
        >
          {t('pioneers.cta.button')}
        </a>
      </div>
    </div>
  );
}
