// Service gestion presets (localStorage)
export class PresetService {
  constructor() {
    this.storageKey = 'podcast-creator-presets';
    this.initDefaultPresets();
  }

  initDefaultPresets() {
    const existing = this.getAllPresets();
    if (existing.length === 0) {
      // Presets par défaut
      const defaults = [
        {
          id: 'meditation-432',
          name: 'Meditation 432Hz',
          description: 'Frequence sacree pure',
          config: {
            frequency: {
              type: 'pure',
              value: 432,
              name: '432 Hz (Frequence Sacree)'
            },
            ambient: null,
            freqVolume: 0.05,
            bgVolume: 0.10
          },
          createdAt: Date.now(),
          isDefault: true
        },
        {
          id: 'focus-binaural',
          name: 'Focus Concentration',
          description: 'Binaural 40Hz',
          config: {
            frequency: {
              type: 'binaural',
              value: 'binaural-40',
              base: 200,
              offset: 40,
              name: 'Binaural 40 Hz (Concentration)'
            },
            ambient: null,
            freqVolume: 0.05,
            bgVolume: 0.10
          },
          createdAt: Date.now(),
          isDefault: true
        },
        {
          id: 'clean-voice',
          name: 'Voix Pure',
          description: 'Aucun effet - juste voix',
          config: {
            frequency: {
              type: null,
              value: 'none',
              name: 'Aucune'
            },
            ambient: null,
            freqVolume: 0.05,
            bgVolume: 0.10
          },
          createdAt: Date.now(),
          isDefault: true
        }

      ];

      localStorage.setItem(this.storageKey, JSON.stringify(defaults));
    }
  }

  getAllPresets() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Erreur lecture presets:', err);
      return [];
    }
  }

  getPreset(id) {
    const presets = this.getAllPresets();
    return presets.find(p => p.id === id);
  }

  savePreset(name, description, config) {
    const presets = this.getAllPresets();

    const newPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      config: JSON.parse(JSON.stringify(config)), // Deep copy
      createdAt: Date.now(),
      isDefault: false
    };

    presets.push(newPreset);
    localStorage.setItem(this.storageKey, JSON.stringify(presets));

    return newPreset;
  }

  updatePreset(id, updates) {
    const presets = this.getAllPresets();
    const index = presets.findIndex(p => p.id === id);

    if (index !== -1) {
      presets[index] = { ...presets[index], ...updates, updatedAt: Date.now() };
      localStorage.setItem(this.storageKey, JSON.stringify(presets));
      return presets[index];
    }

    return null;
  }

  deletePreset(id) {
    const presets = this.getAllPresets();
    const filtered = presets.filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  exportPresets() {
    const presets = this.getAllPresets();
    const dataStr = JSON.stringify(presets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-presets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importPresets(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);

          if (!Array.isArray(imported)) {
            reject(new Error('Format invalide'));
            return;
          }

          const existing = this.getAllPresets();
          const merged = [...existing];

          imported.forEach(preset => {
            if (!existing.find(p => p.id === preset.id)) {
              merged.push({ ...preset, importedAt: Date.now() });
            }
          });

          localStorage.setItem(this.storageKey, JSON.stringify(merged));
          resolve(merged.length - existing.length);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsText(file);
    });
  }

  resetToDefaults() {
    localStorage.removeItem(this.storageKey);
    this.initDefaultPresets();
  }
}

export const presetService = new PresetService();
