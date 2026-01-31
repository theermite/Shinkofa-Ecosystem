import { useState, useEffect } from 'react';
import { COLORS, COLORS_DARK } from './utils/constants';
import AudioConfig from './components/AudioConfig';
import AudioExport from './components/AudioExport';
import AudioRecorder from './components/AudioRecorder';
import SettingsPanel from './components/SettingsPanel';
import LoginPage from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('ermite_authenticated');
    return saved === 'true';
  });
  const [step, setStep] = useState(1);
  const [audioFile, setAudioFile] = useState(null);
  const [config, setConfig] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' ou 'record'
  const [videoTemplateId, setVideoTemplateId] = useState(null);
  const [thumbnailTemplateId, setThumbnailTemplateId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [templatesVersion, setTemplatesVersion] = useState(0);

  const handleTemplatesUpdated = () => {
    setTemplatesVersion(v => v + 1);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ermite_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ermite_authenticated');
    setStep(1);
    setAudioFile(null);
    setConfig(null);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Ajouter/enlever classe dark au body pour CSS global
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Gérer affichage bouton Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const colors = darkMode ? COLORS_DARK : COLORS;

  // Afficher page de login si non authentifié
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} colors={colors} />;
  }

  const handleFileSelect = (file) => {
    setAudioFile(file);
    setStep(2);
  };

  const handleConfigNext = (audioConfig, videoTplId = null, thumbnailTplId = null) => {
    setConfig(audioConfig);
    setVideoTemplateId(videoTplId);
    setThumbnailTemplateId(thumbnailTplId);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setAudioFile(null);
    setConfig(null);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{ backgroundColor: colors.cremeBlanc }}
    >
      {/* Settings & Dark Mode Toggle & Logout */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 rounded-full text-2xl transition-all hover:scale-110"
          style={{ backgroundColor: colors.bleuRoyal }}
          aria-label="Paramètres"
          title="Paramètres"
        >
          ⚙️
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full text-2xl transition-all hover:scale-110"
          style={{ backgroundColor: colors.bleuRoyal }}
          aria-label="Toggle dark mode"
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleLogout}
          className="p-3 rounded-full text-2xl transition-all hover:scale-110"
          style={{ backgroundColor: colors.rougeBordeaux }}
          aria-label="Déconnexion"
          title="Déconnexion"
        >
          🚪
        </button>
      </div>

      <header className="mb-6 sm:mb-8 text-center px-2">
        <img
          src="/logo.png"
          alt="The Ermite Logo"
          className="h-16 sm:h-20 md:h-24 mx-auto mb-3 sm:mb-4"
        />
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
          style={{ color: colors.bleuProfond }}
        >
          🎙️ Podcast The Ermite
        </h1>
        <p
          className="text-base sm:text-lg"
          style={{ color: colors.bleuRoyal }}
        >
          Enrichis ton audio avec fréquences thérapeutiques
        </p>
      </header>

      {/* Progress Steps */}
      <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
        {[1, 2, 3].map(num => (
          <div
            key={num}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base"
            style={{
              backgroundColor: step >= num ? colors.vertEmeraude : colors.bleuClair,
              opacity: step >= num ? 1 : 0.5
            }}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        className="w-full max-w-2xl p-4 sm:p-6 md:p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: colors.cardBg }}
      >
        {step === 1 && (
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold mb-4 text-center"
              style={{ color: colors.bleuProfond }}
            >
              1. Upload ou Enregistre ton audio
            </h2>

            {/* Mode Sélection (Onglets) */}
            <div className="flex gap-2 mb-6 border-b-2 pb-2" style={{ borderColor: colors.borderColor }}>
              <button
                onClick={() => setUploadMode('file')}
                className="flex-1 px-6 py-3 rounded-t-lg font-bold transition-all"
                style={{
                  backgroundColor: uploadMode === 'file' ? colors.bleuRoyal : 'transparent',
                  color: uploadMode === 'file' ? '#fff' : colors.bleuProfond,
                  borderBottom: uploadMode === 'file' ? `3px solid ${colors.bleuRoyal}` : 'none'
                }}
              >
                📁 Upload Fichier
              </button>
              <button
                onClick={() => setUploadMode('record')}
                className="flex-1 px-6 py-3 rounded-t-lg font-bold transition-all"
                style={{
                  backgroundColor: uploadMode === 'record' ? colors.rougeBordeaux : 'transparent',
                  color: uploadMode === 'record' ? '#fff' : colors.bleuProfond,
                  borderBottom: uploadMode === 'record' ? `3px solid ${colors.rougeBordeaux}` : 'none'
                }}
              >
                🎤 Enregistrer Direct
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="text-center py-8">
                <p className="mb-6 text-sm sm:text-base" style={{ color: colors.bleuRoyal }}>
                  Formats supportés : MP3, WAV, M4A, OGG, WEBM
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="inline-block px-8 py-4 rounded-lg text-white font-bold cursor-pointer text-xl hover:opacity-90 transition-opacity shadow-lg"
                  style={{ backgroundColor: colors.bleuRoyal }}
                >
                  📁 Choisir fichier audio
                </label>
              </div>
            ) : (
              <div className="py-4">
                <AudioRecorder
                  onRecordingComplete={handleFileSelect}
                  colors={colors}
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <AudioConfig
            audioFile={audioFile}
            onNext={handleConfigNext}
            onBack={() => setStep(1)}
            colors={colors}
          />
        )}

        {step === 3 && (
          <AudioExport
            audioFile={audioFile}
            config={config}
            onBack={() => setStep(2)}
            colors={colors}
            defaultVideoTemplate={videoTemplateId}
            defaultThumbnailTemplate={thumbnailTemplateId}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-6 sm:mt-8 text-center px-2">
        <p className="text-xs sm:text-sm mb-2" style={{ color: colors.bleuRoyal }}>
          v1.0.20 - Phase 2 (Multi-Export + Templates Complets) ✅
        </p>
        {step === 3 && (
          <button
            onClick={handleReset}
            className="text-xs sm:text-sm underline"
            style={{ color: colors.bleuRoyal }}
          >
            Nouveau podcast
          </button>
        )}
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg text-white font-bold text-2xl transition-all hover:scale-110 z-50"
          style={{ backgroundColor: colors.vertEmeraude }}
          aria-label="Retour en haut"
        >
          ↑
        </button>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        colors={colors}
        onTemplatesUpdated={handleTemplatesUpdated}
      />
    </div>
  );
}

export default App;
