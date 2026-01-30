/**
 * Page de collecte de témoignages
 * Permet aux utilisateurs de partager leur expérience avec Shinkofa
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitTemoignage } from '../services/brevoService';

export function Temoignages() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    photoUrl: '',
    temoignage: '',
    autorisation: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setSubmitError(t('testimonials.form.photoError'));
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(t('testimonials.form.photoSizeError'));
      return;
    }

    // Convertir en base64 pour prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setFormData(prev => ({ ...prev, photoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitTemoignage(formData);
      setSubmitSuccess(true);
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        photoUrl: '',
        temoignage: '',
        autorisation: false
      });
    } catch (error) {
      setSubmitError(t('testimonials.form.error'));
      console.error('Erreur soumission témoignage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container-shinkofa py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-6xl mb-6">🙏</div>
            <h1 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('testimonials.success.title')}
            </h1>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              {t('testimonials.success.description')}
            </p>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-8">
              {t('testimonials.success.review')}
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="btn-secondary"
            >
              {t('testimonials.success.another')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('testimonials.title')}
          </h1>
          <p className="text-lg text-bleu-profond/70 dark:text-blanc-pur/70">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur">
              {t('testimonials.form.coordinates')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('testimonials.form.firstName')} <span className="text-accent-lumineux">*</span>
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                  placeholder={t('testimonials.form.firstNamePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('testimonials.form.lastName')}
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                  placeholder={t('testimonials.form.lastNamePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('testimonials.form.email')} <span className="text-accent-lumineux">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                placeholder={t('testimonials.form.emailPlaceholder')}
              />
              <p className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 mt-1">
                {t('testimonials.form.emailNote')}
              </p>
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('testimonials.form.photo')}
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-lumineux file:text-blanc-pur hover:file:bg-accent-doux"
              />
              <p className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 mt-1">
                {t('testimonials.form.photoFormats')}
              </p>
              {photoPreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-accent-lumineux"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setFormData(prev => ({ ...prev, photoUrl: '' }));
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    {t('testimonials.form.removePhoto')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Témoignage */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur">
              {t('testimonials.form.testimonial')}
            </h2>

            <div>
              <label htmlFor="temoignage" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                {t('testimonials.form.testimonialLabel')} <span className="text-accent-lumineux">*</span>
              </label>
              <textarea
                id="temoignage"
                name="temoignage"
                value={formData.temoignage}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-fonce text-bleu-profond dark:text-blanc-pur"
                placeholder={t('testimonials.form.testimonialPlaceholder')}
              />
              <p className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 mt-1">
                {t('testimonials.form.testimonialNote')}
              </p>
            </div>
          </div>

          {/* Autorisation de publication */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="autorisation"
                name="autorisation"
                checked={formData.autorisation}
                onChange={handleChange}
                required
                className="mt-1 w-5 h-5 text-accent-lumineux border-beige-sable dark:border-bleu-fonce rounded focus:ring-2 focus:ring-accent-lumineux"
              />
              <label htmlFor="autorisation" className="text-sm text-bleu-profond dark:text-blanc-pur">
                <span className="text-accent-lumineux">*</span> {t('testimonials.form.authorization')}
              </label>
            </div>
          </div>

          {/* Erreur */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-shinkofa-sm p-4 text-red-700 dark:text-red-300">
              {submitError}
            </div>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('testimonials.form.submitting') : t('testimonials.form.submit')}
          </button>

          <p className="text-xs text-center text-bleu-profond/60 dark:text-blanc-pur/60">
            {t('testimonials.form.privacyNote')}{' '}
            <a href="/politique-confidentialite" className="text-accent-lumineux hover:underline">
              {t('testimonials.form.privacyLink')}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
