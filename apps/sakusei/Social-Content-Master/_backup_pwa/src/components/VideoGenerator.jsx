import { useState, useEffect, useRef } from 'react';
import { videoService } from '../services/videoService';
import { templateService } from '../services/templateService';

// Helper pour générer date format YYYYMMDD
const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

function VideoGenerator({ audioBuffer, transcript, colors, onVideoGenerated, defaultTemplate = null }) {
  // Charger templates depuis templateService
  const [VIDEO_TEMPLATES, setVIDEO_TEMPLATES] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoStyle, setVideoStyle] = useState('typewriter');
  const [selectedRatios, setSelectedRatios] = useState(['16:9']); // Multi-sélection
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [videos, setVideos] = useState([]); // Array de {ratio, blob}
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [cancelGeneration, setCancelGeneration] = useState(false);
  const [videoFilename, setVideoFilename] = useState(`Podcast-TheErmite-${getDateString()}`);

  // Nouveau : Templates et couleurs personnalisées
  const [selectedTemplate, setSelectedTemplate] = useState('the-ermite-pro');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#192040');
  const [customTextColor, setCustomTextColor] = useState('#FFFFFF');
  const [customShadowColor, setCustomShadowColor] = useState('rgba(0, 0, 0, 0.8)');
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);

  // Effets défilement Star Wars
  const [scrollSpeed, setScrollSpeed] = useState(70);
  const [scrollDirection, setScrollDirection] = useState('bottom-to-top'); // 'bottom-to-top' ou 'top-to-bottom'
  const [fadeZone, setFadeZone] = useState(20); // Pourcentage écran (0-50%)
  const [lineSpacing, setLineSpacing] = useState(0.6); // Espacement entre blocs (0.3-1.2)

  // Preview canvas ref
  const previewCanvasRef = useRef(null);

  // Charger templates au démarrage
  useEffect(() => {
    setVIDEO_TEMPLATES(templateService.getAllVideoTemplates());
  }, []);

  // Appliquer defaultTemplate si fourni
  useEffect(() => {
    if (defaultTemplate && VIDEO_TEMPLATES[defaultTemplate]) {
      setSelectedTemplate(defaultTemplate);
      handleTemplateChange(defaultTemplate);
    }
  }, [defaultTemplate, VIDEO_TEMPLATES]);

  // Charger image de fond par défaut du template sélectionné
  useEffect(() => {
    const videoBackgrounds = localStorage.getItem('videoBackgrounds');
    if (videoBackgrounds && selectedTemplate && !backgroundImage) {
      const backgrounds = JSON.parse(videoBackgrounds);
      const templateBg = backgrounds[selectedTemplate];
      if (templateBg) {
        // Convertir dataURL en File pour compatibilité
        fetch(templateBg)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `${selectedTemplate}-bg.jpg`, { type: blob.type });
            setBackgroundImage(file);
          })
          .catch(err => console.warn('Erreur chargement image template:', err));
      }
    }
  }, [selectedTemplate]);

  const getRatioDimensions = (ratio) => {
    if (ratio === '16:9') {
      return { width: 1920, height: 1080 };
    } else if (ratio === '9:16') {
      return { width: 1080, height: 1920 };
    } else {
      return { width: 1080, height: 1080 };
    }
  };

  const handleRatioToggle = (ratio) => {
    if (selectedRatios.includes(ratio)) {
      // Désélectionner (garder au moins 1)
      if (selectedRatios.length > 1) {
        setSelectedRatios(selectedRatios.filter(r => r !== ratio));
      }
    } else {
      // Sélectionner
      setSelectedRatios([...selectedRatios, ratio]);
    }
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImage(file);
    }
  };

  // Charger template sélectionné
  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = VIDEO_TEMPLATES[templateKey];
    if (template && templateKey !== 'custom') {
      setCustomBackgroundColor(template.backgroundColor);
      setCustomTextColor(template.textColor);
      setCustomShadowColor(template.shadowColor);
      setShadowBlur(template.shadowBlur);
      setShadowOffsetX(template.shadowOffsetX);
      setShadowOffsetY(template.shadowOffsetY);
    }
  };

  // Obtenir couleurs actuelles (template ou custom)
  const getCurrentColors = () => {
    return {
      backgroundColor: customBackgroundColor,
      textColor: customTextColor,
      shadowColor: customShadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY
    };
  };

  // Sauvegarder config actuelle comme template custom
  const handleSaveAsTemplate = () => {
    const templateName = prompt('Nom du template custom :', `Mon Template ${Date.now()}`);
    if (!templateName) return;

    const newTemplate = {
      id: `custom-video-${Date.now()}`,
      name: templateName,
      backgroundColor: customBackgroundColor,
      textColor: customTextColor,
      shadowColor: customShadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY
    };

    templateService.saveVideoTemplate(newTemplate);
    setVIDEO_TEMPLATES(templateService.getAllVideoTemplates());
    setSelectedTemplate(newTemplate.id);
    alert(`✅ Template "${templateName}" sauvegardé !`);
  };

  // Dessiner preview en temps réel (utilise le premier ratio sélectionné)
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const previewRatio = selectedRatios[0] || '16:9';
    const dimensions = getRatioDimensions(previewRatio);

    // Canvas dimensions scaled down for preview
    const scale = previewRatio === '9:16' ? 0.15 : 0.25;
    canvas.width = dimensions.width * scale;
    canvas.height = dimensions.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = customBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sample text
    const fontSize = previewRatio === '9:16' ? 24 : 32;
    ctx.font = `bold ${fontSize}px 'Montserrat Alternates', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply shadow
    ctx.shadowColor = customShadowColor;
    ctx.shadowBlur = shadowBlur * scale;
    ctx.shadowOffsetX = shadowOffsetX * scale;
    ctx.shadowOffsetY = shadowOffsetY * scale;

    // Draw text
    ctx.fillStyle = customTextColor;
    const sampleText = transcript.length > 0 ? transcript[0].text.substring(0, 50) + '...' : 'Exemple de texte vidéo';
    ctx.fillText(sampleText, canvas.width / 2, canvas.height / 2);

  }, [customBackgroundColor, customTextColor, customShadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, selectedRatios, transcript]);

  const handleCancelGeneration = () => {
    setCancelGeneration(true);
    setIsGenerating(false);
    setProgress(0);
    setProgressLabel('Génération annulée');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCancelGeneration(false);
    setProgressLabel('Préparation...');

    // Forcer un reflow pour afficher la barre de progression
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const currentColors = getCurrentColors();
      const generatedVideos = [];
      const totalRatios = selectedRatios.length;

      // Boucle sur tous les ratios sélectionnés
      for (let i = 0; i < selectedRatios.length; i++) {
        const ratio = selectedRatios[i];
        const dimensions = getRatioDimensions(ratio);

        if (cancelGeneration) return;

        // Progression : 10% init + 80% génération (divisé par nombre de ratios) + 10% final
        const progressStart = 10 + (i * 80 / totalRatios);
        setProgress(Math.round(progressStart));
        setProgressLabel(`Génération ${ratio} (${i + 1}/${totalRatios})...`);
        console.log(`Début génération vidéo ${videoStyle} ${ratio} - Durée: ${audioBuffer.duration}s`);
        await new Promise(resolve => setTimeout(resolve, 50));

        const baseOptions = {
          ...dimensions,
          backgroundColor: currentColors.backgroundColor,
          textColor: currentColors.textColor,
          shadowColor: currentColors.shadowColor,
          shadowBlur: currentColors.shadowBlur,
          shadowOffsetX: currentColors.shadowOffsetX,
          shadowOffsetY: currentColors.shadowOffsetY,
          backgroundImage: backgroundImage
        };

        let blob;

        // IMPORTANT: La génération prend le temps de la durée audio (enregistrement temps réel)
        if (videoStyle === 'starwars') {
          blob = await videoService.generateStarWarsVideo(audioBuffer, transcript, {
            ...baseOptions,
            fontSize: ratio === '9:16' ? 52 : 72,
            scrollSpeed,
            scrollDirection,
            fadeZone,
            lineSpacing
          });
        } else if (videoStyle === 'typewriter') {
          blob = await videoService.generateTypeWriterVideo(audioBuffer, transcript, {
            ...baseOptions,
            fontSize: ratio === '9:16' ? 48 : 64,
            charsPerSecond: 15
          });
        } else {
          blob = await videoService.generateSimpleVideo(audioBuffer, transcript, {
            ...baseOptions,
            fontSize: ratio === '9:16' ? 52 : 68
          });
        }

        console.log(`Génération vidéo ${ratio} terminée`);
        generatedVideos.push({ ratio, blob });

        // Notifier le parent si callback fourni
        if (onVideoGenerated) {
          const filename = `${videoFilename}-${videoStyle}-${ratio.replace(':', 'x')}.webm`;
          onVideoGenerated(blob, filename);
        }
      }

      if (cancelGeneration) return;
      setProgress(95);
      setProgressLabel('Finalisation...');
      await new Promise(resolve => setTimeout(resolve, 50));

      setVideos(generatedVideos);
      setProgress(100);
      setProgressLabel(`${generatedVideos.length} vidéo${generatedVideos.length > 1 ? 's' : ''} générée${generatedVideos.length > 1 ? 's' : ''} !`);

      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setProgressLabel('');
      }, 500);
    } catch (err) {
      console.error('Erreur generation video:', err);
      setProgressLabel('Erreur: ' + err.message);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = (ratio, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoFilename}-${videoStyle}-${ratio.replace(':', 'x')}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    videos.forEach(({ ratio, blob }, index) => {
      setTimeout(() => {
        handleDownload(ratio, blob);
      }, index * 500); // Delay pour éviter blocage navigateur
    });
  };

  if (!transcript || transcript.length === 0) {
    return (
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cremeBlanc }}>
        <p className="text-sm" style={{ color: colors.bleuRoyal }}>
          Genere d'abord une transcription pour creer la video
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cremeBlanc }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.bleuProfond }}>
        Generation Video
      </h3>

      {videos.length === 0 && !isGenerating && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
                Style Animation
              </label>
              <select
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="w-full p-3 border-2 rounded-lg"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
              >
                <option value="typewriter">TypeWriter (Machine a ecrire)</option>
                <option value="starwars">Star Wars (Texte defilant)</option>
                <option value="simple">Simple (Texte centre)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
                Formats Vidéo (Multi-sélection)
              </label>
              <div className="space-y-2 p-3 border-2 rounded-lg" style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}>
                {[
                  { value: '16:9', label: '16:9 YouTube (1920x1080)' },
                  { value: '9:16', label: '9:16 TikTok/Shorts (1080x1920)' },
                  { value: '1:1', label: '1:1 Instagram (1080x1080)' }
                ].map(ratio => (
                  <label key={ratio.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRatios.includes(ratio.value)}
                      onChange={() => handleRatioToggle(ratio.value)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span style={{ color: colors.bleuProfond }}>{ratio.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                ✅ {selectedRatios.length} format{selectedRatios.length > 1 ? 's' : ''} sélectionné{selectedRatios.length > 1 ? 's' : ''} → {selectedRatios.length} vidéo{selectedRatios.length > 1 ? 's' : ''} générée{selectedRatios.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Template The Ermite */}
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <h4 className="font-bold mb-3" style={{ color: colors.bleuProfond }}>
              🎨 Template Couleurs
            </h4>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full p-3 border-2 rounded-lg mb-3"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
            >
              {Object.keys(VIDEO_TEMPLATES).map(key => (
                <option key={key} value={key}>
                  {VIDEO_TEMPLATES[key].name}
                </option>
              ))}
            </select>

            {/* Bouton sauvegarder config actuelle comme template */}
            <button
              onClick={handleSaveAsTemplate}
              className="w-full px-4 py-2 rounded-lg text-white font-bold text-sm mb-3 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              💾 Sauvegarder comme Template Custom
            </button>
            <p className="text-xs mb-3 text-center" style={{ color: colors.bleuRoyal }}>
              Sauvegarde tes couleurs et effets actuels pour les réutiliser plus tard
            </p>

            {/* Couleurs personnalisées si template "custom" */}
            {selectedTemplate === 'custom' && (
              <div className="space-y-3 mt-4 p-3 rounded border-2" style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}>
                <p className="text-sm font-semibold mb-2" style={{ color: colors.bleuRoyal }}>
                  Personnaliser les couleurs
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Couleur Fond
                    </label>
                    <input
                      type="color"
                      value={customBackgroundColor}
                      onChange={(e) => setCustomBackgroundColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Couleur Texte
                    </label>
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Couleur Ombre
                    </label>
                    <input
                      type="color"
                      value={customShadowColor.includes('rgba') ? '#000000' : customShadowColor}
                      onChange={(e) => setCustomShadowColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Effets de texte (toujours visible) */}
            <div className="mt-4 p-3 rounded border-2" style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}>
              <p className="text-sm font-semibold mb-3" style={{ color: colors.bleuRoyal }}>
                ✨ Effets de Texte
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                    Intensité Ombre : {shadowBlur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Décalage X : {shadowOffsetX}px
                    </label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={shadowOffsetX}
                      onChange={(e) => setShadowOffsetX(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Décalage Y : {shadowOffsetY}px
                    </label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={shadowOffsetY}
                      onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Effets défilement Star Wars (visible uniquement si style = starwars) */}
          {videoStyle === 'starwars' && (
            <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.vertEmeraude }}>
              <h4 className="font-bold mb-3" style={{ color: colors.bleuProfond }}>
                🎬 Effets Défilement Star Wars
              </h4>
              <div className="space-y-4">
                {/* Vitesse défilement */}
                <div>
                  <label className="block text-sm mb-1 font-semibold" style={{ color: colors.bleuRoyal }}>
                    Vitesse Défilement : {scrollSpeed}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    step="5"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                    {scrollSpeed < 50 ? '🐌 Lent' : scrollSpeed < 80 ? '⚡ Normal' : scrollSpeed < 110 ? '🚀 Rapide' : '💨 Très Rapide'}
                  </p>
                </div>

                {/* Direction défilement */}
                <div>
                  <label className="block text-sm mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
                    Direction Défilement
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border-2" style={{
                      borderColor: scrollDirection === 'bottom-to-top' ? colors.vertEmeraude : colors.borderColor,
                      backgroundColor: scrollDirection === 'bottom-to-top' ? colors.vertEmeraude + '20' : colors.inputBg
                    }}>
                      <input
                        type="radio"
                        name="scrollDirection"
                        value="bottom-to-top"
                        checked={scrollDirection === 'bottom-to-top'}
                        onChange={(e) => setScrollDirection(e.target.value)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm" style={{ color: colors.bleuProfond }}>⬆️ Bas → Haut (Classic)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border-2" style={{
                      borderColor: scrollDirection === 'top-to-bottom' ? colors.vertEmeraude : colors.borderColor,
                      backgroundColor: scrollDirection === 'top-to-bottom' ? colors.vertEmeraude + '20' : colors.inputBg
                    }}>
                      <input
                        type="radio"
                        name="scrollDirection"
                        value="top-to-bottom"
                        checked={scrollDirection === 'top-to-bottom'}
                        onChange={(e) => setScrollDirection(e.target.value)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm" style={{ color: colors.bleuProfond }}>⬇️ Haut → Bas (Inversé)</span>
                    </label>
                  </div>
                </div>

                {/* Zone fade */}
                <div>
                  <label className="block text-sm mb-1 font-semibold" style={{ color: colors.bleuRoyal }}>
                    Zone Fade : {fadeZone}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={fadeZone}
                    onChange={(e) => setFadeZone(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                    Texte apparaît progressivement sur {fadeZone}% {scrollDirection === 'bottom-to-top' ? 'du haut' : 'du bas'} de l'écran
                  </p>
                </div>

                {/* Espacement lignes */}
                <div>
                  <label className="block text-sm mb-1 font-semibold" style={{ color: colors.bleuRoyal }}>
                    Espacement Lignes : {lineSpacing.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.2"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                    {lineSpacing < 0.5 ? '📏 Compact' : lineSpacing < 0.8 ? '📐 Normal' : '📊 Spacieux'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image de fond optionnelle */}
          <div>
            <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
              Image de Fond (Optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundChange}
              className="w-full p-3 border-2 rounded-lg"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
            />
            {backgroundImage && (
              <p className="text-xs mt-2" style={{ color: colors.bleuRoyal }}>
                Image selectionnee : {backgroundImage.name}
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="ml-2 text-red-600 underline"
                >
                  Retirer
                </button>
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
              Si image selectionnee : texte dans encadre opaque (35%)
            </p>
          </div>

          <div className="p-3 rounded text-sm" style={{ backgroundColor: colors.cardBg, color: colors.bleuProfond }}>
            <strong>Configuration Finale :</strong>
            <ul className="mt-2 space-y-1">
              <li>Style : {videoStyle === 'typewriter' ? 'TypeWriter' : videoStyle === 'starwars' ? 'Star Wars' : 'Simple'}</li>
              <li>Formats : {selectedRatios.map(r => {
                const label = r === '16:9' ? 'YouTube' : r === '9:16' ? 'TikTok/Shorts' : 'Instagram';
                return `${r} (${label})`;
              }).join(', ')}</li>
              <li>Template : {VIDEO_TEMPLATES[selectedTemplate]?.name || 'Chargement...'}</li>
              <li>Couleur Fond : <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: customBackgroundColor, border: '1px solid #ccc', verticalAlign: 'middle', marginLeft: '4px' }}></span></li>
              <li>Couleur Texte : <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: customTextColor, border: '1px solid #ccc', verticalAlign: 'middle', marginLeft: '4px' }}></span></li>
              <li>Effets Ombre : blur {shadowBlur}px, offset ({shadowOffsetX}, {shadowOffsetY})</li>
              <li>Police : Montserrat Alternates Semi Bold</li>
              <li>Fond : {backgroundImage ? 'Image custom' : 'Couleur unie'}</li>
              <li>Duree : {Math.round(audioBuffer.duration)}s</li>
            </ul>
          </div>

          {/* Preview en temps réel */}
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.vertEmeraude }}>
            <p className="text-sm font-semibold mb-3 text-center" style={{ color: colors.bleuProfond }}>
              👁️ Aperçu Vidéo (Temps Réel)
            </p>
            <div className="flex justify-center">
              <canvas
                ref={previewCanvasRef}
                className="border-2 rounded shadow-lg"
                style={{ borderColor: colors.bleuClair, maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <p className="text-xs text-center mt-2" style={{ color: colors.bleuRoyal }}>
              Modifie les couleurs et effets ci-dessus pour voir le résultat en direct
            </p>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full px-8 py-4 rounded-lg text-white font-bold text-lg"
            style={{ backgroundColor: colors.bleuRoyal }}
          >
            Generer Video
          </button>

          <p className="text-xs text-center" style={{ color: colors.bleuRoyal }}>
            Generation en temps reel (~{Math.round(audioBuffer.duration)}s)
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-12">
          <div
            className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: colors.bleuRoyal }}
          />
          <p className="font-bold mb-4" style={{ color: colors.bleuProfond }}>
            {progressLabel}
          </p>
          <div className="max-w-md mx-auto">
            <div
              className="w-full h-4 rounded-full overflow-hidden mb-2"
              style={{ backgroundColor: colors.cremeBlanc }}
            >
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: colors.vertEmeraude
                }}
              />
            </div>
            <p className="text-sm mb-4" style={{ color: colors.bleuRoyal }}>
              {progress}%
            </p>
            <button
              onClick={handleCancelGeneration}
              className="px-6 py-2 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Annuler
            </button>
          </div>
          <div className="mt-4 p-3 rounded border-2" style={{ borderColor: colors.bleuClair, backgroundColor: colors.cremeBlanc }}>
            <p className="text-xs font-semibold mb-1" style={{ color: colors.bleuProfond }}>
              ⏱️ Enregistrement en temps réel
            </p>
            <p className="text-xs" style={{ color: colors.bleuRoyal }}>
              La génération prend ~{Math.round(audioBuffer.duration)}s (durée de l'audio).
              La page peut sembler figée, c'est normal. Ne fermez pas la page.
            </p>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-4">
          {/* Input nom fichier éditable (commun à toutes les vidéos) */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.bleuProfond }}>
              Nom du fichier (commun) :
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={videoFilename}
                onChange={(e) => setVideoFilename(e.target.value)}
                className="flex-1 px-3 py-2 rounded border-2"
                style={{
                  borderColor: colors.bleuClair,
                  backgroundColor: colors.inputBg,
                  color: colors.bleuProfond
                }}
                placeholder="Nom du fichier"
              />
              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: colors.bleuRoyal }}>
                -{videoStyle}-[ratio].webm
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
              Exemple : {videoFilename}-{videoStyle}-16x9.webm
            </p>
          </div>

          {/* Grille de tous les previews vidéos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map(({ ratio, blob }, index) => (
              <div key={index} className="p-3 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.bleuClair }}>
                <p className="text-sm font-bold mb-2 text-center" style={{ color: colors.bleuProfond }}>
                  📹 {ratio === '16:9' ? 'YouTube' : ratio === '9:16' ? 'TikTok/Shorts' : 'Instagram'} ({ratio})
                </p>
                <video
                  controls
                  className="w-full rounded-lg border-2 mb-2"
                  style={{
                    borderColor: colors.bleuClair,
                    maxHeight: '300px',
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                  src={URL.createObjectURL(blob)}
                />
                <button
                  onClick={() => handleDownload(ratio, blob)}
                  className="w-full px-4 py-2 rounded-lg text-white font-bold text-sm"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  ⬇️ Télécharger {ratio.replace(':', 'x')}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {videos.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="flex-1 px-8 py-4 rounded-lg text-white font-bold text-lg border-2"
                style={{ backgroundColor: colors.bleuRoyal, borderColor: colors.vertEmeraude }}
              >
                📦 Télécharger Toutes les Vidéos ({videos.length})
              </button>
            )}
            <button
              onClick={() => {
                setVideos([]);
                setProgress(0);
                setProgressLabel('');
              }}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Nouvelle
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: colors.bleuRoyal }}>
            Format WebM - Compatible navigateurs modernes
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoGenerator;
