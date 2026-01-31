import { useState, useEffect } from 'react';
import { presetService } from '../services/presetService';

function PresetManager({ currentConfig, onLoadPreset, colors }) {
  const [presets, setPresets] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    const all = presetService.getAllPresets();
    setPresets(all);
  };

  const handleSave = () => {
    if (!newPresetName.trim()) {
      alert('Entre un nom pour le preset');
      return;
    }

    presetService.savePreset(newPresetName, newPresetDesc, currentConfig);
    setNewPresetName('');
    setNewPresetDesc('');
    setShowSaveDialog(false);
    loadPresets();
  };

  const handleLoad = (preset) => {
    if (onLoadPreset) {
      onLoadPreset(preset.config);
    }
  };

  const handleDelete = (id, isDefault) => {
    if (isDefault) {
      alert('Impossible de supprimer un preset par défaut');
      return;
    }

    if (confirm('Supprimer ce preset ?')) {
      presetService.deletePreset(id);
      loadPresets();
    }
  };

  const handleExport = () => {
    presetService.exportPresets();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const count = await presetService.importPresets(file);
      alert(`${count} preset(s) importé(s)`);
      loadPresets();
      setShowImport(false);
    } catch (err) {
      alert('Erreur import: ' + err.message);
    }
  };

  return (
    <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.cremeBlanc }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold" style={{ color: colors.bleuProfond }}>
          Presets Sauvegardés
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="px-4 py-2 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: colors.vertEmeraude }}
          >
            + Sauvegarder Config
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: colors.bleuRoyal }}
          >
            Export JSON
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-4 py-2 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: colors.jauneMoutarde }}
          >
            Import JSON
          </button>
        </div>
      </div>

      {/* Dialogue Sauvegarde */}
      {showSaveDialog && (
        <div className="mb-4 p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <h4 className="font-bold mb-3" style={{ color: colors.bleuRoyal }}>
            Nouveau Preset
          </h4>
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Nom du preset"
            className="w-full p-2 mb-2 border-2 rounded"
            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
          />
          <input
            type="text"
            value={newPresetDesc}
            onChange={(e) => setNewPresetDesc(e.target.value)}
            placeholder="Description (optionnel)"
            className="w-full p-2 mb-3 border-2 rounded"
            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-4 py-2 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Dialogue Import */}
      {showImport && (
        <div className="mb-4 p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <h4 className="font-bold mb-3" style={{ color: colors.bleuRoyal }}>
            Importer Presets JSON
          </h4>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="w-full p-2 mb-2 border-2 rounded"
            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
          />
          <button
            onClick={() => setShowImport(false)}
            className="w-full px-4 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: colors.rougeBordeaux }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Liste Presets */}
      <div className="grid grid-cols-2 gap-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="p-3 rounded-lg border-2"
            style={{ backgroundColor: colors.cardBg, borderColor: preset.isDefault ? colors.bleuClair : colors.vertEmeraude }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-sm" style={{ color: colors.bleuProfond }}>
                  {preset.name}
                  {preset.isDefault && (
                    <span className="ml-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.bleuClair, color: '#fff' }}>
                      Défaut
                    </span>
                  )}
                </h4>
                {preset.description && (
                  <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                    {preset.description}
                  </p>
                )}
              </div>
              {!preset.isDefault && (
                <button
                  onClick={() => handleDelete(preset.id, preset.isDefault)}
                  className="text-red-600 text-xs font-bold ml-2"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs mb-2 space-y-1" style={{ color: colors.bleuProfond }}>
              <div>
                <strong>Fréquence:</strong> {preset.config.frequency.name}
              </div>
              <div>
                <strong>Ambiance:</strong> {preset.config.ambient?.name || 'Aucune'}
              </div>
            </div>

            <button
              onClick={() => handleLoad(preset)}
              className="w-full px-4 py-2 rounded-lg text-white font-bold text-sm"
              style={{ backgroundColor: colors.bleuRoyal }}
            >
              Charger
            </button>
          </div>
        ))}
      </div>

      {presets.length === 0 && (
        <p className="text-center py-6" style={{ color: colors.bleuRoyal }}>
          Aucun preset sauvegardé
        </p>
      )}
    </div>
  );
}

export default PresetManager;
