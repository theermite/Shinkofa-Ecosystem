import { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import { completeTemplateService } from '../services/completeTemplateService';
import { FREQUENCY_OPTIONS, MUSIC_LIBRARY } from '../utils/constants';

function SettingsPanel({ isOpen, onClose, colors, onTemplatesUpdated }) {
  const [activeTab, setActiveTab] = useState('complete-templates');

  // Templates
  const [videoTemplates, setVideoTemplates] = useState({});
  const [thumbnailTemplates, setThumbnailTemplates] = useState({});
  const [completeTemplates, setCompleteTemplates] = useState({});

  // Édition
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingThumbnail, setEditingThumbnail] = useState(null);
  const [editingComplete, setEditingComplete] = useState(null);

  // Images de fond par template (objet : { templateId: dataUrl })
  const [videoBackgrounds, setVideoBackgrounds] = useState({});
  const [thumbnailBackgrounds, setThumbnailBackgrounds] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadBackgroundImages();
    }
  }, [isOpen]);

  const loadTemplates = () => {
    setVideoTemplates(templateService.getAllVideoTemplates());
    setThumbnailTemplates(templateService.getAllThumbnailTemplates());
    setCompleteTemplates(completeTemplateService.getAllTemplates());
  };

  const loadBackgroundImages = () => {
    const videoBgs = localStorage.getItem('videoBackgrounds');
    const thumbnailBgs = localStorage.getItem('thumbnailBackgrounds');
    if (videoBgs) setVideoBackgrounds(JSON.parse(videoBgs));
    if (thumbnailBgs) setThumbnailBackgrounds(JSON.parse(thumbnailBgs));
  };

  const handleVideoBackgroundUpload = (templateId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const updated = { ...videoBackgrounds, [templateId]: dataUrl };
        setVideoBackgrounds(updated);
        localStorage.setItem('videoBackgrounds', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailBackgroundUpload = (templateId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const updated = { ...thumbnailBackgrounds, [templateId]: dataUrl };
        setThumbnailBackgrounds(updated);
        localStorage.setItem('thumbnailBackgrounds', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveVideoBackground = (templateId) => {
    const updated = { ...videoBackgrounds };
    delete updated[templateId];
    setVideoBackgrounds(updated);
    localStorage.setItem('videoBackgrounds', JSON.stringify(updated));
  };

  const handleRemoveThumbnailBackground = (templateId) => {
    const updated = { ...thumbnailBackgrounds };
    delete updated[templateId];
    setThumbnailBackgrounds(updated);
    localStorage.setItem('thumbnailBackgrounds', JSON.stringify(updated));
  };

  // === VIDÉO TEMPLATES ===

  const handleCreateVideoTemplate = () => {
    const newId = `custom-video-${Date.now()}`;
    const newTemplate = {
      name: 'Nouveau Template',
      backgroundColor: '#192040',
      textColor: '#FFFFFF',
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      isDefault: false
    };
    setEditingVideo({ id: newId, ...newTemplate });
  };

  const handleEditVideoTemplate = (id) => {
    setEditingVideo({ id, ...videoTemplates[id] });
  };

  const handleSaveVideoTemplate = () => {
    if (!editingVideo) return;

    const { id, isDefault, ...template } = editingVideo;
    templateService.saveVideoTemplate(id, template);
    loadTemplates();
    setEditingVideo(null);
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  const handleDeleteVideoTemplate = (id) => {
    if (confirm('Supprimer ce template ?')) {
      templateService.deleteVideoTemplate(id);
      loadTemplates();
      if (onTemplatesUpdated) onTemplatesUpdated();
    }
  };

  // === MINIATURE TEMPLATES ===

  const handleCreateThumbnailTemplate = () => {
    const newId = `custom-thumbnail-${Date.now()}`;
    const newTemplate = {
      name: 'Nouveau Template',
      backgroundColor: '#192040',
      titleColor: '#FFFFFF',
      subtitleColor: '#567EBB',
      isDefault: false
    };
    setEditingThumbnail({ id: newId, ...newTemplate });
  };

  const handleEditThumbnailTemplate = (id) => {
    setEditingThumbnail({ id, ...thumbnailTemplates[id] });
  };

  const handleSaveThumbnailTemplate = () => {
    if (!editingThumbnail) return;

    const { id, isDefault, ...template } = editingThumbnail;
    templateService.saveThumbnailTemplate(id, template);
    loadTemplates();
    setEditingThumbnail(null);
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  const handleDeleteThumbnailTemplate = (id) => {
    if (confirm('Supprimer ce template ?')) {
      templateService.deleteThumbnailTemplate(id);
      loadTemplates();
      if (onTemplatesUpdated) onTemplatesUpdated();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        style={{ backgroundColor: colors.cardBg }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b-2 flex justify-between items-center" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <h2 className="text-2xl font-bold" style={{ color: colors.bleuProfond }}>
            ⚙️ Paramètres
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: colors.rougeBordeaux }}
          >
            ✕ Fermer
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2" style={{ borderColor: colors.borderColor }}>
          <button
            onClick={() => setActiveTab('video-templates')}
            className="flex-1 px-4 py-3 font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'video-templates' ? colors.bleuRoyal : 'transparent',
              color: activeTab === 'video-templates' ? '#fff' : colors.bleuProfond,
              borderBottom: activeTab === 'video-templates' ? `3px solid ${colors.bleuRoyal}` : 'none'
            }}
          >
            🎬 Templates Vidéo
          </button>
          <button
            onClick={() => setActiveTab('thumbnail-templates')}
            className="flex-1 px-4 py-3 font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'thumbnail-templates' ? colors.bleuRoyal : 'transparent',
              color: activeTab === 'thumbnail-templates' ? '#fff' : colors.bleuProfond,
              borderBottom: activeTab === 'thumbnail-templates' ? `3px solid ${colors.bleuRoyal}` : 'none'
            }}
          >
            🖼️ Templates Miniatures
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className="flex-1 px-4 py-3 font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'general' ? colors.bleuRoyal : 'transparent',
              color: activeTab === 'general' ? '#fff' : colors.bleuProfond,
              borderBottom: activeTab === 'general' ? `3px solid ${colors.bleuRoyal}` : 'none'
            }}
          >
            🔧 Général
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* VIDÉO TEMPLATES */}
          {activeTab === 'video-templates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: colors.bleuProfond }}>
                  Templates Vidéo
                </h3>
                <button
                  onClick={handleCreateVideoTemplate}
                  className="px-4 py-2 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  + Nouveau Template
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(videoTemplates).map(id => {
                  const template = videoTemplates[id];
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: template.backgroundColor,
                        borderColor: colors.bleuClair
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold" style={{ color: template.textColor }}>
                          {template.name}
                          {template.isDefault && (
                            <span className="ml-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.bleuRoyal, color: '#fff' }}>
                              Défaut
                            </span>
                          )}
                        </p>
                        {!template.isDefault && (
                          <button
                            onClick={() => handleDeleteVideoTemplate(id)}
                            className="text-red-600 font-bold text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-xs mb-3" style={{ color: template.textColor, opacity: 0.8 }}>
                        Fond: {template.backgroundColor} | Texte: {template.textColor}
                      </p>

                      {/* Image de fond par défaut */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold mb-1" style={{ color: template.textColor }}>
                          🖼️ Image de fond par défaut :
                        </p>
                        {videoBackgrounds[id] ? (
                          <div className="space-y-1">
                            <img
                              src={videoBackgrounds[id]}
                              alt="Fond par défaut"
                              className="w-full h-16 object-cover rounded"
                            />
                            <button
                              onClick={() => handleRemoveVideoBackground(id)}
                              className="w-full px-2 py-1 rounded text-white font-semibold text-xs"
                              style={{ backgroundColor: colors.rougeBordeaux }}
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVideoBackgroundUpload(id, e)}
                              className="hidden"
                              id={`video-bg-${id}`}
                            />
                            <label
                              htmlFor={`video-bg-${id}`}
                              className="block w-full px-3 py-2 rounded border-2 border-dashed text-center cursor-pointer text-xs font-semibold"
                              style={{
                                borderColor: template.textColor,
                                color: template.textColor,
                                opacity: 0.8
                              }}
                            >
                              📁 Choisir une image
                            </label>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleEditVideoTemplate(id)}
                        className="w-full px-4 py-2 rounded-lg text-white font-bold text-sm"
                        style={{ backgroundColor: colors.bleuRoyal }}
                      >
                        ✏️ Éditer
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MINIATURE TEMPLATES */}
          {activeTab === 'thumbnail-templates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: colors.bleuProfond }}>
                  Templates Miniatures
                </h3>
                <button
                  onClick={handleCreateThumbnailTemplate}
                  className="px-4 py-2 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  + Nouveau Template
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(thumbnailTemplates).map(id => {
                  const template = thumbnailTemplates[id];
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: template.backgroundColor,
                        borderColor: colors.bleuClair
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold" style={{ color: template.titleColor }}>
                          {template.name}
                          {template.isDefault && (
                            <span className="ml-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.bleuRoyal, color: '#fff' }}>
                              Défaut
                            </span>
                          )}
                        </p>
                        {!template.isDefault && (
                          <button
                            onClick={() => handleDeleteThumbnailTemplate(id)}
                            className="text-red-600 font-bold text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-xs mb-1" style={{ color: template.subtitleColor }}>
                        Sous-titre couleur exemple
                      </p>
                      <p className="text-xs mb-3" style={{ color: template.titleColor, opacity: 0.8 }}>
                        Fond: {template.backgroundColor}
                      </p>

                      {/* Image de fond par défaut */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold mb-1" style={{ color: template.titleColor }}>
                          🖼️ Image de fond par défaut :
                        </p>
                        {thumbnailBackgrounds[id] ? (
                          <div className="space-y-1">
                            <img
                              src={thumbnailBackgrounds[id]}
                              alt="Fond par défaut"
                              className="w-full h-16 object-cover rounded"
                            />
                            <button
                              onClick={() => handleRemoveThumbnailBackground(id)}
                              className="w-full px-2 py-1 rounded text-white font-semibold text-xs"
                              style={{ backgroundColor: colors.rougeBordeaux }}
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleThumbnailBackgroundUpload(id, e)}
                              className="hidden"
                              id={`thumbnail-bg-${id}`}
                            />
                            <label
                              htmlFor={`thumbnail-bg-${id}`}
                              className="block w-full px-3 py-2 rounded border-2 border-dashed text-center cursor-pointer text-xs font-semibold"
                              style={{
                                borderColor: template.titleColor,
                                color: template.titleColor,
                                opacity: 0.8
                              }}
                            >
                              📁 Choisir une image
                            </label>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleEditThumbnailTemplate(id)}
                        className="w-full px-4 py-2 rounded-lg text-white font-bold text-sm"
                        style={{ backgroundColor: colors.bleuRoyal }}
                      >
                        ✏️ Éditer
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GÉNÉRAL */}
          {activeTab === 'general' && (
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.bleuProfond }}>
                Paramètres Généraux
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cremeBlanc, borderColor: colors.borderColor }}>
                  <h4 className="font-bold mb-2" style={{ color: colors.bleuProfond }}>
                    📊 Version
                  </h4>
                  <p className="text-sm" style={{ color: colors.bleuRoyal }}>
                    Ermite-Podcaster v1.0.18
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                    Fix Template Modern Miniatures (Adaptatif)
                  </p>
                </div>

                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cremeBlanc, borderColor: colors.borderColor }}>
                  <h4 className="font-bold mb-3" style={{ color: colors.bleuProfond }}>
                    📁 Dossier de Téléchargement
                  </h4>
                  <p className="text-sm mb-3" style={{ color: colors.bleuRoyal }}>
                    Les navigateurs ne permettent pas de choisir le dossier programmatiquement pour des raisons de sécurité.
                    Voici comment configurer ton navigateur :
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 rounded border" style={{ borderColor: colors.borderColor, backgroundColor: colors.inputBg }}>
                      <h5 className="font-semibold mb-2 text-sm" style={{ color: colors.vertEmeraude }}>
                        🌐 Google Chrome / Microsoft Edge
                      </h5>
                      <ol className="text-xs space-y-1" style={{ color: colors.bleuProfond }}>
                        <li>1. Paramètres → Téléchargements</li>
                        <li>2. Activer "Demander où enregistrer chaque fichier avant le téléchargement"</li>
                        <li>3. OU définir un dossier par défaut dans "Emplacement"</li>
                      </ol>
                    </div>

                    <div className="p-3 rounded border" style={{ borderColor: colors.borderColor, backgroundColor: colors.inputBg }}>
                      <h5 className="font-semibold mb-2 text-sm" style={{ color: colors.bleuRoyal }}>
                        🦊 Mozilla Firefox
                      </h5>
                      <ol className="text-xs space-y-1" style={{ color: colors.bleuProfond }}>
                        <li>1. Paramètres → Général → Fichiers et applications</li>
                        <li>2. Cocher "Toujours demander où enregistrer les fichiers"</li>
                        <li>3. OU définir un dossier dans "Enregistrer les fichiers dans"</li>
                      </ol>
                    </div>

                    <div className="p-3 rounded border" style={{ borderColor: colors.borderColor, backgroundColor: colors.inputBg }}>
                      <h5 className="font-semibold mb-2 text-sm" style={{ color: colors.rougeBordeaux }}>
                        💡 Conseil
                      </h5>
                      <p className="text-xs" style={{ color: colors.bleuProfond }}>
                        Active "Demander où enregistrer" pour choisir le dossier à chaque téléchargement (audio, vidéo, miniature).
                        Tu pourras alors créer des sous-dossiers "Audio", "Vidéos", "Miniatures" dans ton dossier Podcasts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cremeBlanc, borderColor: colors.borderColor }}>
                  <h4 className="font-bold mb-2" style={{ color: colors.bleuProfond }}>
                    ℹ️ À Propos
                  </h4>
                  <p className="text-sm" style={{ color: colors.bleuRoyal }}>
                    © 2025 Jay "The Ermite" Goncalves
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                    Enrichis ton audio avec fréquences thérapeutiques
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ÉDITION VIDÉO */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-2xl rounded-lg shadow-2xl p-6" style={{ backgroundColor: colors.cardBg }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.bleuProfond }}>
              ✏️ Éditer Template Vidéo
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold" style={{ color: colors.bleuProfond }}>Nom</label>
                <input
                  type="text"
                  value={editingVideo.name}
                  onChange={(e) => setEditingVideo({ ...editingVideo, name: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: colors.bleuProfond }}>Couleur Fond</label>
                  <input
                    type="color"
                    value={editingVideo.backgroundColor}
                    onChange={(e) => setEditingVideo({ ...editingVideo, backgroundColor: e.target.value })}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingVideo.backgroundColor}
                    onChange={(e) => setEditingVideo({ ...editingVideo, backgroundColor: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: colors.bleuProfond }}>Couleur Texte</label>
                  <input
                    type="color"
                    value={editingVideo.textColor}
                    onChange={(e) => setEditingVideo({ ...editingVideo, textColor: e.target.value })}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingVideo.textColor}
                    onChange={(e) => setEditingVideo({ ...editingVideo, textColor: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: colors.bleuProfond }}>Couleur Ombre</label>
                  <input
                    type="color"
                    value={editingVideo.shadowColor.includes('rgba') ? '#000000' : editingVideo.shadowColor}
                    onChange={(e) => setEditingVideo({ ...editingVideo, shadowColor: e.target.value })}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingVideo.shadowColor}
                    onChange={(e) => setEditingVideo({ ...editingVideo, shadowColor: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                    placeholder="rgba(0,0,0,0.8)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm" style={{ color: colors.bleuProfond }}>Blur Ombre: {editingVideo.shadowBlur}px</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={editingVideo.shadowBlur}
                    onChange={(e) => setEditingVideo({ ...editingVideo, shadowBlur: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm" style={{ color: colors.bleuProfond }}>Offset X: {editingVideo.shadowOffsetX}px</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={editingVideo.shadowOffsetX}
                    onChange={(e) => setEditingVideo({ ...editingVideo, shadowOffsetX: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm" style={{ color: colors.bleuProfond }}>Offset Y: {editingVideo.shadowOffsetY}px</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={editingVideo.shadowOffsetY}
                    onChange={(e) => setEditingVideo({ ...editingVideo, shadowOffsetY: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 rounded-lg text-center" style={{ backgroundColor: editingVideo.backgroundColor }}>
                <p className="text-2xl font-bold" style={{
                  color: editingVideo.textColor,
                  textShadow: `${editingVideo.shadowOffsetX}px ${editingVideo.shadowOffsetY}px ${editingVideo.shadowBlur}px ${editingVideo.shadowColor}`
                }}>
                  Aperçu du Texte
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.rougeBordeaux }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveVideoTemplate}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  💾 Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION MINIATURE */}
      {editingThumbnail && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-2xl rounded-lg shadow-2xl p-6" style={{ backgroundColor: colors.cardBg }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.bleuProfond }}>
              ✏️ Éditer Template Miniature
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold" style={{ color: colors.bleuProfond }}>Nom</label>
                <input
                  type="text"
                  value={editingThumbnail.name}
                  onChange={(e) => setEditingThumbnail({ ...editingThumbnail, name: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: colors.bleuProfond }}>Couleur Fond</label>
                  <input
                    type="color"
                    value={editingThumbnail.backgroundColor}
                    onChange={(e) => setEditingThumbnail({ ...editingThumbnail, backgroundColor: e.target.value })}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingThumbnail.backgroundColor}
                    onChange={(e) => setEditingThumbnail({ ...editingThumbnail, backgroundColor: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: colors.bleuProfond }}>Couleur Titre</label>
                  <input
                    type="color"
                    value={editingThumbnail.titleColor}
                    onChange={(e) => setEditingThumbnail({ ...editingThumbnail, titleColor: e.target.value })}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingThumbnail.titleColor}
                    onChange={(e) => setEditingThumbnail({ ...editingThumbnail, titleColor: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: colors.bleuProfond }}>Couleur Sous-titre</label>
                  <input
                    type="color"
                    value={editingThumbnail.subtitleColor}
                    onChange={(e) => setEditingThumbnail({ ...editingThumbnail, subtitleColor: e.target.value })}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingThumbnail.subtitleColor}
                    onChange={(e) => setEditingThumbnail({ ...editingThumbnail, subtitleColor: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-8 rounded-lg text-center" style={{ backgroundColor: editingThumbnail.backgroundColor }}>
                <p className="text-3xl font-bold mb-2" style={{ color: editingThumbnail.titleColor }}>
                  Titre Principal
                </p>
                <p className="text-lg" style={{ color: editingThumbnail.subtitleColor }}>
                  Sous-titre exemple
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setEditingThumbnail(null)}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.rougeBordeaux }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveThumbnailTemplate}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  💾 Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
