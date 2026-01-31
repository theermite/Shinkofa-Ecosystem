// Service gestion templates complets (audio + vidéo + miniature)
// Templates par défaut + templates personnalisés utilisateur

const DEFAULT_COMPLETE_TEMPLATES = {
  'the-ermite-pro-complete': {
    id: 'the-ermite-pro-complete',
    name: 'The Ermite Pro (Complet)',
    audio: {
      frequency: { value: '432', type: 'pure', name: '432 Hz (Pure - Harmonie universelle)' },
      ambient: { type: 'library', id: 'calm-soul', name: 'Calm Soul', url: '/music/calm-soul.mp3' },
      freqVolume: 0.06,
      bgVolume: 0.15
    },
    videoTemplate: 'the-ermite-pro',
    thumbnailTemplate: 'the-ermite-pro'
  },
  'the-ermite-light-complete': {
    id: 'the-ermite-light-complete',
    name: 'The Ermite Light (Complet)',
    audio: {
      frequency: { value: '528', type: 'pure', name: '528 Hz (Pure - Transformation ADN)' },
      ambient: { type: 'library', id: 'brazilian-streets', name: 'Brazilian Streets', url: '/music/brazilian-streets.mp3' },
      freqVolume: 0.05,
      bgVolume: 0.12
    },
    videoTemplate: 'the-ermite-light',
    thumbnailTemplate: 'the-ermite-light'
  },
  'the-ermite-emerald-complete': {
    id: 'the-ermite-emerald-complete',
    name: 'The Ermite Emerald (Complet)',
    audio: {
      frequency: { value: '639', type: 'pure', name: '639 Hz (Pure - Relations harmonieuses)' },
      ambient: { type: 'library', id: 'chamanic-flute', name: 'Chamanic Flute', url: '/music/chamanic-flute.mp3' },
      freqVolume: 0.07,
      bgVolume: 0.18
    },
    videoTemplate: 'the-ermite-emerald',
    thumbnailTemplate: 'the-ermite-emerald'
  }
};

class CompleteTemplateService {
  constructor() {
    this.STORAGE_KEY = 'completeTemplates';
    this.initializeStorage();
  }

  initializeStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      // Initialiser avec templates par défaut
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_COMPLETE_TEMPLATES));
    }
  }

  getAllTemplates() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_COMPLETE_TEMPLATES;
  }

  getTemplate(id) {
    const templates = this.getAllTemplates();
    return templates[id] || null;
  }

  saveTemplate(template) {
    const templates = this.getAllTemplates();
    templates[template.id] = template;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    return template;
  }

  deleteTemplate(id) {
    // Empêcher suppression templates par défaut
    if (DEFAULT_COMPLETE_TEMPLATES[id]) {
      throw new Error('Impossible de supprimer un template par défaut. Vous pouvez seulement le modifier.');
    }

    const templates = this.getAllTemplates();
    delete templates[id];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }

  createNewTemplate(name, audioConfig, videoTemplate, thumbnailTemplate) {
    const id = `custom-complete-${Date.now()}`;
    const template = {
      id,
      name,
      audio: audioConfig,
      videoTemplate,
      thumbnailTemplate
    };
    return this.saveTemplate(template);
  }

  updateTemplate(id, updates) {
    const template = this.getTemplate(id);
    if (!template) {
      throw new Error('Template introuvable');
    }

    const updated = { ...template, ...updates };
    return this.saveTemplate(updated);
  }

  isDefaultTemplate(id) {
    return !!DEFAULT_COMPLETE_TEMPLATES[id];
  }

  resetToDefaults() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_COMPLETE_TEMPLATES));
  }
}

export const completeTemplateService = new CompleteTemplateService();
export { DEFAULT_COMPLETE_TEMPLATES };
