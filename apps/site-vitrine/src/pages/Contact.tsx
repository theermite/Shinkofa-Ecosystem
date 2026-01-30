/**
 * Page Contact - Telegram, Discord & Formulaire
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // TODO: Implémenter envoi réel via backend Phase 2
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setFormData({ nom: '', email: '', sujet: '', message: '' });
    } catch (error) {
      setSubmitError(t('contact.form.error'));
      console.error('Erreur soumission formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container-shinkofa py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('contact.success.title')}
            </h1>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              {t('contact.success.description')}
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="btn-secondary"
            >
              {t('contact.success.another')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shinkofa py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
          {t('contact.title')}
        </h1>
        <p className="text-xl text-bleu-profond/70 dark:text-blanc-pur/70 max-w-3xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
        {/* Communautés */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
            {t('contact.joinCommunity')}
          </h2>

          {/* Telegram */}
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700">
            <div className="flex items-start gap-4">
              <div className="text-5xl">💬</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('contact.telegram.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
                  {t('contact.telegram.description')}
                </p>
                <a
                  href="https://t.me/+ZOl7NJphLEw4YzQ0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  {t('contact.telegram.cta')}
                </a>
              </div>
            </div>
          </div>

          {/* Discord */}
          <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-300 dark:border-purple-700">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🎮</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('contact.discord.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
                  {t('contact.discord.description')}
                </p>
                <a
                  href="https://discord.gg/BdqpKZUht"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  {t('contact.discord.cta')}
                </a>
              </div>
            </div>
          </div>

          {/* Email direct */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700">
            <div className="flex items-start gap-4">
              <div className="text-5xl">📧</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('contact.email.title')}
                </h3>
                <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-2">
                  {t('contact.email.description')}
                </p>
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline font-medium"
                >
                  contact@shinkofa.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div>
          <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
            {t('contact.form.title')}
          </h2>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('contact.form.name')} <span className="text-accent-lumineux">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                placeholder={t('contact.form.namePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('contact.form.emailLabel')} <span className="text-accent-lumineux">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                placeholder={t('contact.form.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="sujet" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('contact.form.subject')} <span className="text-accent-lumineux">*</span>
              </label>
              <select
                id="sujet"
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
              >
                <option value="">{t('contact.form.subjectOptions.select')}</option>
                <option value="support">{t('contact.form.subjectOptions.support')}</option>
                <option value="abonnement">{t('contact.form.subjectOptions.subscription')}</option>
                <option value="feedback">{t('contact.form.subjectOptions.feedback')}</option>
                <option value="partenariat">{t('contact.form.subjectOptions.partnership')}</option>
                <option value="media">{t('contact.form.subjectOptions.media')}</option>
                <option value="autre">{t('contact.form.subjectOptions.other')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('contact.form.message')} <span className="text-accent-lumineux">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                placeholder={t('contact.form.messagePlaceholder')}
              />
            </div>

            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-shinkofa-sm p-4 text-red-700 dark:text-red-300">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
            </button>

            <p className="text-xs text-center text-bleu-profond/60 dark:text-blanc-pur/60">
              {t('contact.form.responseTime')}
            </p>
          </form>
        </div>
      </div>

      {/* FAQ rapide */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-8">
          {t('contact.faq.title')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
              {t('contact.faq.q1.question')}
            </h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('contact.faq.q1.answer')}
            </p>
          </div>

          <div className="card">
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
              {t('contact.faq.q2.question')}
            </h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('contact.faq.q2.answer')}
            </p>
          </div>

          <div className="card">
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
              {t('contact.faq.q3.question')}
            </h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('contact.faq.q3.answer')}
            </p>
          </div>

          <div className="card">
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
              {t('contact.faq.q4.question')}
            </h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('contact.faq.q4.answer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
