import { useState, useEffect } from 'react';
import { FREQUENCY_OPTIONS, MUSIC_LIBRARY } from '../utils/constants';
import PresetManager from './PresetManager';
import { completeTemplateService } from '../services/completeTemplateService';

function AudioConfig({ audioFile, onNext, onBack, colors }) {
  const [selectedFrequency, setSelectedFrequency] = useState('none');
  const [frequencyType, setFrequencyType] = useState(null);
  const [ambientType, setAmbientType] = useState('none');
  const [selectedLibraryMusic, setSelectedLibraryMusic] = useState(MUSIC_LIBRARY[0].id);
  const [uploadedAmbientFile, setUploadedAmbientFile] = useState(null);
  const [freqVolume, setFreqVolume] = useState(0.06);
  const [bgVolume, setBgVolume] = useState(0.10);

  // Templates complets
  const [completeTemplates, setCompleteTemplates] = useState({});
  const [selectedCompleteTemplate, setSelectedCompleteTemplate] = useState('none');
  const [videoTemplateId, setVideoTemplateId] = useState(null);
  const [thumbnailTemplateId, setThumbnailTemplateId] = useState(null);

  // Charger templates complets au démarrage
  useEffect(() => {
    setCompleteTemplates(completeTemplateService.getAllTemplates());
  }, []);

  // Charger dernier preset utilisé au démarrage
  useEffect(() => {
    const lastUsedPreset = localStorage.getItem('lastUsedPreset');
    if (lastUsedPreset) {
      try {
        const config = JSON.parse(lastUsedPreset);
        handleLoadPreset(config);
      } catch (err) {
        console.warn('Erreur chargement dernier preset:', err);
      }
    }
  }, []);

  const handleLoadPreset = (config) => {
    setSelectedFrequency(config.frequency.value);
    setFrequencyType(config.frequency.type);
    setFreqVolume(config.freqVolume);
    setBgVolume(config.bgVolume);

    if (config.ambient) {
      if (config.ambient.type === 'library') {
        setAmbientType('library');
        setSelectedLibraryMusic(config.ambient.id);
      } else {
        setAmbientType('upload');
      }
    } else {
      setAmbientType('none');
    }
  };

  const handleLoadCompleteTemplate = (templateId) => {
    if (templateId === 'none') {
      setSelectedCompleteTemplate('none');
      setVideoTemplateId(null);
      setThumbnailTemplateId(null);
      return;
    }

    const template = completeTemplates[templateId];
    if (!template) return;

    setSelectedCompleteTemplate(templateId);

    // Charger config audio
    if (template.audio) {
      setSelectedFrequency(template.audio.frequency.value);
      setFrequencyType(template.audio.frequency.type);
      setFreqVolume(template.audio.freqVolume);
      setBgVolume(template.audio.bgVolume);

      if (template.audio.ambient) {
        if (template.audio.ambient.type === 'library') {
          setAmbientType('library');
          setSelectedLibraryMusic(template.audio.ambient.id);
        }
      } else {
        setAmbientType('none');
      }
    }

    // Stocker IDs templates vidéo/miniature pour passer au parent
    setVideoTemplateId(template.videoTemplate);
    setThumbnailTemplateId(template.thumbnailTemplate);
  };

  const handleNext = () => {
    const selectedFreqOption = FREQUENCY_OPTIONS.find(f => f.value === selectedFrequency);

    const config = {
      frequency: selectedFreqOption || FREQUENCY_OPTIONS[0],
      ambient: ambientType === 'none' ? null :
               ambientType === 'library' ? MUSIC_LIBRARY.find(m => m.id === selectedLibraryMusic) :
               { type: 'upload', name: uploadedAmbientFile.name, file: uploadedAmbientFile },
      freqVolume,
      bgVolume
    };

    // Sauvegarder comme dernier utilisé (sans le fichier uploadé pour éviter data URL trop lourde)
    const configToSave = {
      ...config,
      ambient: config.ambient && config.ambient.type === 'upload' ? null : config.ambient
    };
    localStorage.setItem('lastUsedPreset', JSON.stringify(configToSave));

    // Passer config + IDs templates vidéo/miniature au parent
    onNext(config, videoTemplateId, thumbnailTemplateId);
  };

  return (
    <div className="space-y-6">
      <h2
        className="text-2xl font-bold mb-4"
        style={{ color: colors.bleuProfond }}
      >
        2. Configuration Audio
      </h2>

      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: colors.cremeBlanc }}
      >
        <p className="mb-2" style={{ color: colors.bleuProfond }}>
          <strong>Fichier :</strong> {audioFile.name}
        </p>
        <p className="text-sm" style={{ color: colors.bleuRoyal }}>
          Configure les frequences et ambiances pour ton podcast
        </p>
      </div>

      {/* Templates Complets */}
      <div
        className="p-4 rounded-lg border-2"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.vertEmeraude }}
      >
        <h3 className="text-lg font-bold mb-3" style={{ color: colors.bleuProfond }}>
          🎨 Templates Complets (Audio + Vidéo + Miniature)
        </h3>
        <select
          value={selectedCompleteTemplate}
          onChange={(e) => handleLoadCompleteTemplate(e.target.value)}
          className="w-full p-3 border-2 rounded-lg font-semibold"
          style={{
            borderColor: colors.bleuClair,
            backgroundColor: colors.inputBg,
            color: colors.bleuProfond
          }}
        >
          <option value="none">-- Aucun (Configuration manuelle) --</option>
          {Object.keys(completeTemplates).map(id => (
            <option key={id} value={id}>
              {completeTemplates[id].name}
            </option>
          ))}
        </select>
        {selectedCompleteTemplate !== 'none' && (
          <p className="text-xs mt-2" style={{ color: colors.bleuRoyal }}>
            ✅ Template chargé : configuration audio appliquée + templates vidéo/miniature sélectionnés automatiquement
          </p>
        )}
        <p className="text-xs mt-2" style={{ color: colors.bleuRoyal }}>
          💡 Astuce : Tu peux modifier les valeurs ci-dessous après avoir chargé un template
        </p>
      </div>

      <PresetManager
        currentConfig={{
          frequency: FREQUENCY_OPTIONS.find(f => f.value === selectedFrequency) || FREQUENCY_OPTIONS[0],
          ambient: ambientType === 'none' ? null :
                   ambientType === 'library' ? MUSIC_LIBRARY.find(m => m.id === selectedLibraryMusic) :
                   uploadedAmbientFile ? { type: 'upload', name: uploadedAmbientFile.name, file: uploadedAmbientFile } : null,
          freqVolume,
          bgVolume
        }}
        onLoadPreset={handleLoadPreset}
        colors={colors}
      />

      {/* Configuration Fréquences */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: colors.cremeBlanc }}
      >
        <h3
          className="text-lg font-bold mb-3"
          style={{ color: colors.bleuProfond }}
        >
          Frequences Therapeutiques
        </h3>

        <select
          value={selectedFrequency}
          onChange={(e) => {
            const selectedOption = FREQUENCY_OPTIONS.find(f => f.value === e.target.value);
            setSelectedFrequency(e.target.value);
            setFrequencyType(selectedOption?.type || null);
          }}
          className="w-full p-3 border-2 rounded-lg font-semibold"
          style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
        >
          {FREQUENCY_OPTIONS.map((freq) => (
            <option key={freq.value || 'none'} value={freq.value}>
              {freq.name} - {freq.description}
            </option>
          ))}
        </select>

        {selectedFrequency && selectedFrequency !== 'none' && (
          <div className="mt-4">
            <label className="block mb-2 font-semibold" style={{ color: colors.bleuProfond }}>
              Volume Frequence : {Math.round(freqVolume * 100)}%
            </label>
            <input
              type="range"
              min="0.01"
              max="0.20"
              step="0.01"
              value={freqVolume}
              onChange={(e) => setFreqVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Configuration Ambiance */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: colors.cremeBlanc }}
      >
        <h3
          className="text-lg font-bold mb-3"
          style={{ color: colors.bleuProfond }}
        >
          Musique d'Ambiance
        </h3>

        <div className="mb-4">
          <label className="flex items-center mb-2" style={{ color: colors.bleuProfond }}>
            <input
              type="radio"
              name="ambient"
              value="none"
              checked={ambientType === 'none'}
              onChange={() => setAmbientType('none')}
              className="mr-2"
            />
            <span className="font-semibold">Aucune ambiance</span>
          </label>

          <label className="flex items-center mb-2" style={{ color: colors.bleuProfond }}>
            <input
              type="radio"
              name="ambient"
              value="library"
              checked={ambientType === 'library'}
              onChange={() => setAmbientType('library')}
              className="mr-2"
            />
            <span className="font-semibold">Bibliotheque (Gratuit)</span>
          </label>

          <label className="flex items-center" style={{ color: colors.bleuProfond }}>
            <input
              type="radio"
              name="ambient"
              value="upload"
              checked={ambientType === 'upload'}
              onChange={() => setAmbientType('upload')}
              className="mr-2"
            />
            <span className="font-semibold">Upload Personnalise</span>
          </label>
        </div>

        {ambientType === 'library' && (
          <select
            value={selectedLibraryMusic}
            onChange={(e) => setSelectedLibraryMusic(e.target.value)}
            className="w-full p-3 border-2 rounded-lg"
            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
          >
            {MUSIC_LIBRARY.map((music) => (
              <option key={music.id} value={music.id}>
                {music.name}
              </option>
            ))}
          </select>
        )}

        {ambientType === 'upload' && (
          <div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setUploadedAmbientFile(e.target.files[0])}
              className="w-full p-3 border-2 rounded-lg"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
            />
            {uploadedAmbientFile && (
              <p className="mt-2 text-sm" style={{ color: colors.bleuRoyal }}>
                Fichier: {uploadedAmbientFile.name}
              </p>
            )}
          </div>
        )}

        {ambientType !== 'none' && (
          <div className="mt-4">
            <label className="block mb-2 font-semibold" style={{ color: colors.bleuProfond }}>
              Volume Ambiance : {Math.round(bgVolume * 100)}%
            </label>
            <input
              type="range"
              min="0.01"
              max="0.30"
              step="0.01"
              value={bgVolume}
              onChange={(e) => setBgVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-white font-bold"
          style={{ backgroundColor: colors.rougeBordeaux }}
        >
          Retour
        </button>

        <button
          onClick={handleNext}
          className="flex-1 px-8 py-4 rounded-lg text-white font-bold text-lg"
          style={{ backgroundColor: colors.vertEmeraude }}
        >
          Generer Audio Enrichi
        </button>
      </div>
    </div>
  );
}

export default AudioConfig;
