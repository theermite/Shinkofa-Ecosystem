import { useState } from 'react';

function LoginPage({ onLogin, colors }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === '238897') {
      onLogin();
    } else {
      setError('Code incorrect. Veuillez réessayer.');
      setCode('');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.cremeBlanc }}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <img
            src="/logo.png"
            alt="The Ermite Logo"
            className="h-24 mx-auto mb-6"
          />
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: colors.bleuProfond }}
          >
            🎙️ Podcast The Ermite
          </h1>
          <p
            className="text-xl mb-2"
            style={{ color: colors.bleuRoyal }}
          >
            Plateforme d'enrichissement audio professionnel
          </p>
        </header>

        {/* Description de l'application */}
        <div
          className="p-8 rounded-lg shadow-xl mb-6"
          style={{ backgroundColor: colors.cardBg }}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: colors.bleuProfond }}
          >
            Qu'est-ce que Podcast The Ermite ?
          </h2>
          <div className="space-y-4" style={{ color: colors.bleuProfond }}>
            <p>
              <strong>Podcast The Ermite</strong> est une application web complète pour créer et enrichir vos contenus audio avec des fonctionnalités professionnelles :
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded" style={{ backgroundColor: colors.cremeBlanc }}>
                <h3 className="font-bold mb-2" style={{ color: colors.vertEmeraude }}>
                  🎵 Enrichissement Audio
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Fréquences thérapeutiques (432 Hz, 528 Hz, etc.)</li>
                  <li>• Bina uraux pour méditation/concentration</li>
                  <li>• 8 musiques d'ambiance professionnelles</li>
                  <li>• Mixage haute qualité WAV</li>
                </ul>
              </div>

              <div className="p-4 rounded" style={{ backgroundColor: colors.cremeBlanc }}>
                <h3 className="font-bold mb-2" style={{ color: colors.bleuRoyal }}>
                  📝 Transcription AI
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Whisper OpenAI (ultra rapide)</li>
                  <li>• AssemblyAI (gratuit 5h/mois)</li>
                  <li>• Export SRT/VTT</li>
                  <li>• Édition inline</li>
                </ul>
              </div>

              <div className="p-4 rounded" style={{ backgroundColor: colors.cremeBlanc }}>
                <h3 className="font-bold mb-2" style={{ color: colors.rougeBordeaux }}>
                  🎬 Génération Vidéo
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• 3 styles (TypeWriter, Star Wars, Simple)</li>
                  <li>• Formats YouTube/TikTok/Instagram</li>
                  <li>• 10 templates couleurs</li>
                  <li>• Preview temps réel</li>
                </ul>
              </div>

              <div className="p-4 rounded" style={{ backgroundColor: colors.cremeBlanc }}>
                <h3 className="font-bold mb-2" style={{ color: colors.jauneMoutarde }}>
                  🖼️ Miniatures Pro
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Templates personnalisables</li>
                  <li>• Multi-formats (YouTube, Spotify, etc.)</li>
                  <li>• Image de fond custom</li>
                  <li>• Export PNG haute résolution</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded border-2" style={{ borderColor: colors.vertEmeraude, backgroundColor: colors.cremeBlanc }}>
              <p className="text-sm">
                <strong>💡 Utilisation :</strong> Upload ou enregistre ton audio → Configure fréquences et ambiances →
                Génère transcription → Crée vidéos et miniatures → Exporte le tout en haute qualité !
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <div
          className="p-8 rounded-lg shadow-xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: colors.bleuProfond }}
          >
            🔐 Accès à l'Interface
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block mb-2 font-semibold"
                style={{ color: colors.bleuRoyal }}
              >
                Code d'accès :
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Entrez le code"
                className="w-full p-4 border-2 rounded-lg text-lg text-center"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: error ? '#dc2626' : colors.borderColor,
                  color: colors.bleuProfond
                }}
                maxLength="6"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              Accéder à l'application
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: colors.bleuRoyal }}>
            Application personnelle - Accès réservé
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-sm" style={{ color: colors.bleuRoyal }}>
            © 2025 Jay The Ermite - Tous droits réservés
          </p>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;
