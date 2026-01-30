/**
 * Page Admin - Dashboard complet pour Jay
 * TEMPORAIRE : Auth simple localStorage (sera remplacé par backend Phase 2)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Type pour les stats mockées (sera remplacé par API)
interface AdminStats {
  questionnairesSoumis: number;
  temoignagesRecus: number;
  demandesBetaTesteurs: number;
  feedbacksRecus: number;
  usersTotal: number;
}

export function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'demandes' | 'temoignages' | 'users'>('dashboard');

  // Mot de passe admin (TEMPORAIRE - sera remplacé par auth backend)
  const ADMIN_PASSWORD = 'LifeisShinkofa177.'; // TODO: Déplacer dans .env

  // Vérifier si déjà authentifié (localStorage)
  useEffect(() => {
    const isAdmin = localStorage.getItem('shinkofa-admin-auth') === 'true';
    if (isAdmin) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('shinkofa-admin-auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shinkofa-admin-auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Stats réelles (seront remplies par le backend en Phase 2)
  const stats: AdminStats = {
    questionnairesSoumis: 0,
    temoignagesRecus: 0,
    demandesBetaTesteurs: 0,
    feedbacksRecus: 0,
    usersTotal: 0
  };

  // Demandes réelles (seront chargées par le backend en Phase 2)
  const demandes: Array<{
    id: number;
    type: string;
    nom: string;
    email: string;
    date: string;
    message: string;
  }> = [];

  // Témoignages réels (seront chargés par le backend en Phase 2)
  const temoignages: Array<{
    id: number;
    prenom: string;
    nom: string;
    email: string;
    date: string;
    temoignage: string;
    photoUrl: string;
    publie: boolean;
  }> = [];

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-sable dark:bg-bleu-fonce p-4">
        <div className="card max-w-md w-full">
          <h1 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-6 text-center">
            🔐 Admin Shinkofa
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-2">
                Mot de passe admin
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm focus:outline-none focus:ring-2 focus:ring-accent-lumineux bg-blanc-pur dark:bg-bleu-profond text-bleu-profond dark:text-blanc-pur"
                placeholder="Mot de passe"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-shinkofa-sm p-3 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Se connecter
            </button>

            <p className="text-xs text-center text-bleu-profond/60 dark:text-blanc-pur/60 mt-4">
              Accès réservé à l'administrateur (Jay)
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard admin
  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
              Dashboard Admin
            </h1>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
              Bienvenue Jay ! Voici un aperçu de Shinkofa.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary mt-4 md:mt-0"
          >
            Se déconnecter
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-accent-lumineux to-accent-doux text-blanc-pur">
            <h3 className="text-sm font-medium mb-2">Questionnaires</h3>
            <p className="text-4xl font-bold">{stats.questionnairesSoumis}</p>
            <p className="text-xs mt-2 opacity-90">Soumis au total</p>
          </div>

          <div className="card bg-gradient-to-br from-dore-principal to-accent-doux text-bleu-profond">
            <h3 className="text-sm font-medium mb-2">Témoignages</h3>
            <p className="text-4xl font-bold">{stats.temoignagesRecus}</p>
            <p className="text-xs mt-2 opacity-90">Reçus (2 publiés)</p>
          </div>

          <div className="card bg-gradient-to-br from-bleu-profond to-bleu-fonce text-blanc-pur">
            <h3 className="text-sm font-medium mb-2">Beta Testeurs</h3>
            <p className="text-4xl font-bold">{stats.demandesBetaTesteurs}</p>
            <p className="text-xs mt-2 opacity-90">Demandes en attente</p>
          </div>

          <div className="card bg-gradient-to-br from-accent-lumineux to-dore-principal text-blanc-pur">
            <h3 className="text-sm font-medium mb-2">Utilisateurs</h3>
            <p className="text-4xl font-bold">{stats.usersTotal}</p>
            <p className="text-xs mt-2 opacity-90">Total inscrits</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-4 border-b border-beige-sable dark:border-bleu-fonce mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-accent-lumineux text-accent-lumineux'
                : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('demandes')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'demandes'
                ? 'border-b-2 border-accent-lumineux text-accent-lumineux'
                : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux'
            }`}
          >
            📬 Demandes ({demandes.length})
          </button>
          <button
            onClick={() => setActiveTab('temoignages')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'temoignages'
                ? 'border-b-2 border-accent-lumineux text-accent-lumineux'
                : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux'
            }`}
          >
            💬 Témoignages ({temoignages.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-accent-lumineux text-accent-lumineux'
                : 'text-bleu-profond dark:text-blanc-pur hover:text-accent-lumineux'
            }`}
          >
            👥 Utilisateurs
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
                Actions Rapides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="btn-primary text-left">
                  📧 Envoyer newsletter
                </button>
                <button className="btn-primary text-left">
                  📊 Exporter données
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
                Activité Récente
              </h2>
              <div className="text-center py-8">
                <p className="text-bleu-profond/60 dark:text-blanc-pur/60">
                  Aucune activité pour le moment
                </p>
                <p className="text-sm text-bleu-profond/50 dark:text-blanc-pur/50 mt-2">
                  L'activité apparaîtra ici une fois le backend mis en place (Phase 2)
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demandes' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
              Demandes Utilisateurs
            </h2>
            {demandes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-bleu-profond/60 dark:text-blanc-pur/60">
                  Aucune demande pour le moment
                </p>
                <p className="text-sm text-bleu-profond/50 dark:text-blanc-pur/50 mt-2">
                  Les demandes des utilisateurs apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandes.map(demande => (
                  <div key={demande.id} className="p-4 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm hover:bg-beige-sable/50 dark:hover:bg-bleu-fonce/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            demande.type === 'beta-testeur' ? 'bg-accent-lumineux text-blanc-pur' :
                            demande.type === 'feedback' ? 'bg-dore-principal text-bleu-profond' :
                            'bg-bleu-profond text-blanc-pur'
                          }`}>
                            {demande.type}
                          </span>
                          <span className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
                            {demande.date}
                          </span>
                        </div>
                        <p className="font-medium text-bleu-profond dark:text-blanc-pur">
                          {demande.nom}
                        </p>
                        <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
                          {demande.email}
                        </p>
                        <p className="text-sm mt-2 text-bleu-profond dark:text-blanc-pur">
                          {demande.message}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm">
                          Répondre
                        </button>
                        <button className="btn-primary text-sm">
                          Marquer traité
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'temoignages' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
              Gestion Témoignages
            </h2>
            {temoignages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-bleu-profond/60 dark:text-blanc-pur/60">
                  Aucun témoignage pour le moment
                </p>
                <p className="text-sm text-bleu-profond/50 dark:text-blanc-pur/50 mt-2">
                  Les témoignages soumis via le formulaire apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {temoignages.map(temoignage => (
                  <div key={temoignage.id} className="p-4 border border-beige-sable dark:border-bleu-fonce rounded-shinkofa-sm">
                    <div className="flex items-start gap-4">
                      {temoignage.photoUrl ? (
                        <img
                          src={temoignage.photoUrl}
                          alt={temoignage.prenom}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent-lumineux text-blanc-pur flex items-center justify-center font-bold">
                          {temoignage.prenom[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-bleu-profond dark:text-blanc-pur">
                            {temoignage.prenom} {temoignage.nom}
                          </p>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            temoignage.publie ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                          }`}>
                            {temoignage.publie ? '✅ Publié' : '⏳ En attente'}
                          </span>
                          <span className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
                            {temoignage.date}
                          </span>
                        </div>
                        <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-2">
                          {temoignage.email}
                        </p>
                        <p className="text-sm text-bleu-profond dark:text-blanc-pur">
                          "{temoignage.temoignage}"
                        </p>
                        <div className="flex gap-2 mt-3">
                          {!temoignage.publie && (
                            <button className="btn-primary text-sm">
                              ✅ Publier
                            </button>
                          )}
                          <button className="btn-secondary text-sm">
                            ✏️ Modifier
                          </button>
                          <button className="btn-secondary text-sm text-red-600 dark:text-red-400">
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
              Gestion Utilisateurs
            </h2>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              Feature disponible en Phase 2 (backend + authentification)
            </p>
            <div className="bg-beige-sable dark:bg-bleu-fonce p-6 rounded-shinkofa-sm">
              <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                🚧 Prochainement
              </h3>
              <ul className="text-sm text-bleu-profond dark:text-blanc-pur space-y-1 list-disc list-inside">
                <li>Liste complète utilisateurs (email, date inscription, questionnaires)</li>
                <li>Filtres & recherche (par neurodivergence, date, activité)</li>
                <li>Export CSV/Excel</li>
                <li>Envoi emails ciblés (segments)</li>
                <li>Stats détaillées par utilisateur</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
