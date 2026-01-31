/**
 * Profile Page - User Profile Management
 * © 2025 La Voie Shinkofa
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || '#0bb1f9');
  const [designHumainType, setDesignHumainType] = useState(
    user?.design_humain_type || ''
  );
  const [designHumainAutorite, setDesignHumainAutorite] = useState(
    user?.design_humain_autorite || ''
  );

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}${API_PREFIX}/users/${user?.id}/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          avatar_color: avatarColor,
          design_humain_type: designHumainType || null,
          design_humain_autorite: designHumainAutorite || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la mise à jour');
      }

      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      await refreshAuth(); // Refresh user data
    } catch (err: any) {
      setError(err.message || 'Erreur de mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsChangingPassword(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}${API_PREFIX}/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du changement de mot de passe');
      }

      setPasswordSuccess('Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const colorOptions = [
    { name: 'Bleu', value: '#0bb1f9' },
    { name: 'Émeraude', value: '#008080' },
    { name: 'Or', value: '#d4a044' },
    { name: 'Bordeaux', value: '#800020' },
    { name: 'Violet', value: '#9333ea' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Vert', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
  ];

  const designHumainTypes = [
    'Manifesteur',
    'Générateur',
    'Générateur Manifesteur',
    'Projecteur',
    'Réflecteur',
  ];

  const designHumainAutorites = [
    'Émotionnelle',
    'Splénique',
    'Sacrale',
    'Ego',
    'Environnement',
    'Lunaire',
    'Aucune',
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-8">
        Mon Profil
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="card">
        {/* Avatar */}
        <div className="flex flex-col items-center md:flex-row md:items-center gap-6 mb-8 pb-8 border-b">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-shinkofa-blue-deep">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Rôle: <span className="font-medium">{user.role}</span>
            </p>
          </div>
        </div>

        {!isEditing ? (
          <>
            {/* View Mode */}
            <div className="space-y-6">
              <div>
                <label className="label">Couleur d'avatar</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: user.avatar_color }}
                  ></div>
                  <span className="text-gray-700">{user.avatar_color}</span>
                </div>
              </div>

              {user.design_humain_type && (
                <div>
                  <label className="label">Type Design Humain</label>
                  <p className="text-gray-700 font-medium">{user.design_humain_type}</p>
                </div>
              )}

              {user.design_humain_autorite && (
                <div>
                  <label className="label">Autorité Design Humain</label>
                  <p className="text-gray-700 font-medium">{user.design_humain_autorite}</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Modifier le profil
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="label">Couleur d'avatar</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setAvatarColor(color.value)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        avatarColor === color.value
                          ? 'border-shinkofa-blue-royal scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      disabled={isSaving}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="designHumainType" className="label">
                  Type Design Humain (optionnel)
                </label>
                <select
                  id="designHumainType"
                  value={designHumainType}
                  onChange={(e) => setDesignHumainType(e.target.value)}
                  className="input"
                  disabled={isSaving}
                >
                  <option value="">-- Sélectionner --</option>
                  {designHumainTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="designHumainAutorite" className="label">
                  Autorité Design Humain (optionnel)
                </label>
                <select
                  id="designHumainAutorite"
                  value={designHumainAutorite}
                  onChange={(e) => setDesignHumainAutorite(e.target.value)}
                  className="input"
                  disabled={isSaving}
                >
                  <option value="">-- Sélectionner --</option>
                  {designHumainAutorites.map((autorite) => (
                    <option key={autorite} value={autorite}>
                      {autorite}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="spinner"></span>
                      Enregistrement...
                    </span>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setAvatarColor(user.avatar_color);
                    setDesignHumainType(user.design_humain_type || '');
                    setDesignHumainAutorite(user.design_humain_autorite || '');
                    setError('');
                    setSuccess('');
                  }}
                  className="btn btn-outline"
                  disabled={isSaving}
                >
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      {/* Password Change Section */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-shinkofa-blue-deep mb-4">
          Changer le mot de passe
        </h2>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            {passwordSuccess}
          </div>
        )}

        {!showPasswordForm ? (
          <button
            onClick={() => {
              setShowPasswordForm(true);
              setPasswordError('');
              setPasswordSuccess('');
            }}
            className="btn btn-outline"
          >
            Modifier mon mot de passe
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="label">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input pr-12"
                  required
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showCurrentPw ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="label">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pr-12"
                  required
                  minLength={8}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showNewPw ? 'Masquer' : 'Voir'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 caractères, au moins une lettre et un chiffre
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pr-12"
                  required
                  minLength={8}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPw ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner"></span>
                    Modification...
                  </span>
                ) : (
                  'Changer le mot de passe'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="btn btn-outline"
                disabled={isChangingPassword}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
