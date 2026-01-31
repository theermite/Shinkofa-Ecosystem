// Service de gestion des templates personnalisés (vidéo + miniature)

const STORAGE_KEY_VIDEO = 'ermite_video_templates';
const STORAGE_KEY_THUMBNAIL = 'ermite_thumbnail_templates';

// Templates vidéo par défaut
const DEFAULT_VIDEO_TEMPLATES = {
  'the-ermite-pro': {
    name: 'The Ermite Pro',
    backgroundColor: '#192040',
    textColor: '#E8F4F8',
    shadowColor: 'rgba(43, 76, 126, 0.8)',
    shadowBlur: 15,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    isDefault: true
  },
  'the-ermite-light': {
    name: 'The Ermite Light',
    backgroundColor: '#E8F4F8',
    textColor: '#192040',
    shadowColor: 'rgba(43, 76, 126, 0.5)',
    shadowBlur: 10,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    isDefault: true
  },
  'the-ermite-emerald': {
    name: 'The Ermite Emerald',
    backgroundColor: '#192040',
    textColor: '#606D5D',
    shadowColor: 'rgba(232, 244, 248, 0.6)',
    shadowBlur: 12,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    isDefault: true
  },
  'dark-modern': {
    name: 'Dark Modern',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    isDefault: true
  },
  'light-elegant': {
    name: 'Light Elegant',
    backgroundColor: '#FFFFFF',
    textColor: '#1a1a1a',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowBlur: 8,
    shadowOffsetX: 1,
    shadowOffsetY: 1,
    isDefault: true
  }
};

// Templates miniatures par défaut
const DEFAULT_THUMBNAIL_TEMPLATES = {
  'the-ermite-pro': {
    name: 'The Ermite Pro',
    backgroundColor: '#192040',
    titleColor: '#E8F4F8',
    subtitleColor: '#567EBB',
    isDefault: true
  },
  'the-ermite-light': {
    name: 'The Ermite Light',
    backgroundColor: '#E8F4F8',
    titleColor: '#192040',
    subtitleColor: '#2B4C7E',
    isDefault: true
  },
  'the-ermite-emerald': {
    name: 'The Ermite Emerald',
    backgroundColor: '#192040',
    titleColor: '#606D5D',
    subtitleColor: '#E8F4F8',
    isDefault: true
  },
  'dark-gold': {
    name: 'Dark Gold',
    backgroundColor: '#000000',
    titleColor: '#DCB455',
    subtitleColor: '#FFFFFF',
    isDefault: true
  },
  'minimal-white': {
    name: 'Minimal White',
    backgroundColor: '#FFFFFF',
    titleColor: '#1a1a1a',
    subtitleColor: '#666666',
    isDefault: true
  }
};

class TemplateService {
  // === TEMPLATES VIDÉO ===

  getAllVideoTemplates() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VIDEO);
      const custom = stored ? JSON.parse(stored) : {};
      return { ...DEFAULT_VIDEO_TEMPLATES, ...custom };
    } catch (err) {
      console.error('Erreur chargement templates vidéo:', err);
      return DEFAULT_VIDEO_TEMPLATES;
    }
  }

  saveVideoTemplate(id, template) {
    try {
      const all = this.getAllVideoTemplates();
      const custom = {};

      // Ne sauvegarder que les templates custom (non-default)
      Object.keys(all).forEach(key => {
        if (!all[key].isDefault) {
          custom[key] = all[key];
        }
      });

      // Ajouter/mettre à jour le template
      custom[id] = { ...template, isDefault: false };

      localStorage.setItem(STORAGE_KEY_VIDEO, JSON.stringify(custom));
      return true;
    } catch (err) {
      console.error('Erreur sauvegarde template vidéo:', err);
      return false;
    }
  }

  deleteVideoTemplate(id) {
    try {
      const all = this.getAllVideoTemplates();
      if (all[id]?.isDefault) {
        throw new Error('Impossible de supprimer un template par défaut');
      }

      const stored = localStorage.getItem(STORAGE_KEY_VIDEO);
      const custom = stored ? JSON.parse(stored) : {};
      delete custom[id];

      localStorage.setItem(STORAGE_KEY_VIDEO, JSON.stringify(custom));
      return true;
    } catch (err) {
      console.error('Erreur suppression template vidéo:', err);
      return false;
    }
  }

  updateVideoTemplate(id, updates) {
    try {
      const all = this.getAllVideoTemplates();
      if (!all[id]) {
        throw new Error('Template introuvable');
      }

      if (all[id].isDefault) {
        // Si template par défaut, créer une copie custom
        const newId = `${id}-custom-${Date.now()}`;
        this.saveVideoTemplate(newId, { ...all[id], ...updates, name: updates.name || `${all[id].name} (Custom)` });
        return newId;
      } else {
        // Sinon mettre à jour directement
        this.saveVideoTemplate(id, { ...all[id], ...updates });
        return id;
      }
    } catch (err) {
      console.error('Erreur mise à jour template vidéo:', err);
      return null;
    }
  }

  // === TEMPLATES MINIATURES ===

  getAllThumbnailTemplates() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THUMBNAIL);
      const custom = stored ? JSON.parse(stored) : {};
      return { ...DEFAULT_THUMBNAIL_TEMPLATES, ...custom };
    } catch (err) {
      console.error('Erreur chargement templates miniature:', err);
      return DEFAULT_THUMBNAIL_TEMPLATES;
    }
  }

  saveThumbnailTemplate(id, template) {
    try {
      const all = this.getAllThumbnailTemplates();
      const custom = {};

      // Ne sauvegarder que les templates custom
      Object.keys(all).forEach(key => {
        if (!all[key].isDefault) {
          custom[key] = all[key];
        }
      });

      custom[id] = { ...template, isDefault: false };

      localStorage.setItem(STORAGE_KEY_THUMBNAIL, JSON.stringify(custom));
      return true;
    } catch (err) {
      console.error('Erreur sauvegarde template miniature:', err);
      return false;
    }
  }

  deleteThumbnailTemplate(id) {
    try {
      const all = this.getAllThumbnailTemplates();
      if (all[id]?.isDefault) {
        throw new Error('Impossible de supprimer un template par défaut');
      }

      const stored = localStorage.getItem(STORAGE_KEY_THUMBNAIL);
      const custom = stored ? JSON.parse(stored) : {};
      delete custom[id];

      localStorage.setItem(STORAGE_KEY_THUMBNAIL, JSON.stringify(custom));
      return true;
    } catch (err) {
      console.error('Erreur suppression template miniature:', err);
      return false;
    }
  }

  updateThumbnailTemplate(id, updates) {
    try {
      const all = this.getAllThumbnailTemplates();
      if (!all[id]) {
        throw new Error('Template introuvable');
      }

      if (all[id].isDefault) {
        // Si template par défaut, créer une copie custom
        const newId = `${id}-custom-${Date.now()}`;
        this.saveThumbnailTemplate(newId, { ...all[id], ...updates, name: updates.name || `${all[id].name} (Custom)` });
        return newId;
      } else {
        // Sinon mettre à jour directement
        this.saveThumbnailTemplate(id, { ...all[id], ...updates });
        return id;
      }
    } catch (err) {
      console.error('Erreur mise à jour template miniature:', err);
      return null;
    }
  }

  // === RESET ===

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_VIDEO);
    localStorage.removeItem(STORAGE_KEY_THUMBNAIL);
  }
}

export const templateService = new TemplateService();
