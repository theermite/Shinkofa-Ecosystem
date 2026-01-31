import { useState, useEffect, useRef } from 'react';
import { thumbnailService } from '../services/thumbnailService';
import { templateService } from '../services/templateService';

// Helper pour générer date format YYYYMMDD
const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

function ThumbnailGenerator({ podcastTitle = '', colors, onThumbnailGenerated, defaultTemplate = null }) {
  // Charger templates depuis templateService
  const [THUMBNAIL_TEMPLATES, setTHUMBNAIL_TEMPLATES] = useState({});
  const [title, setTitle] = useState(podcastTitle || 'Titre de votre podcast');
  const [subtitle, setSubtitle] = useState('');
  const [template, setTemplate] = useState('modern');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailData, setThumbnailData] = useState(null);
  const [titlePositionY, setTitlePositionY] = useState(40); // % de la hauteur
  const [subtitlePositionY, setSubtitlePositionY] = useState(65); // % de la hauteur
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [cancelGeneration, setCancelGeneration] = useState(false);
  const [thumbnailFilename, setThumbnailFilename] = useState(`Thumbnail-TheErmite-${getDateString()}`);

  // Nouveau : Templates et couleurs personnalisées
  const [selectedTemplate, setSelectedTemplate] = useState('the-ermite-pro');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#192040');
  const [customTitleColor, setCustomTitleColor] = useState('#FFFFFF');
  const [customSubtitleColor, setCustomSubtitleColor] = useState('#567EBB');
  // Filtres d'image
  const [imageBlur, setImageBlur] = useState(0); // 0-10px
  const [overlayOpacity, setOverlayOpacity] = useState(0.35); // 0-1

  // Preview canvas ref
  const previewCanvasRef = useRef(null);

  // Charger templates au démarrage
  useEffect(() => {
    setTHUMBNAIL_TEMPLATES(templateService.getAllThumbnailTemplates());
  }, []);

  // Appliquer defaultTemplate si fourni
  useEffect(() => {
    if (defaultTemplate && THUMBNAIL_TEMPLATES[defaultTemplate]) {
      setSelectedTemplate(defaultTemplate);
      handleTemplateChange(defaultTemplate);
    }
  }, [defaultTemplate, THUMBNAIL_TEMPLATES]);

  // Charger image de fond par défaut du template sélectionné
  useEffect(() => {
    const thumbnailBackgrounds = localStorage.getItem('thumbnailBackgrounds');
    if (thumbnailBackgrounds && selectedTemplate && !backgroundImage) {
      const backgrounds = JSON.parse(thumbnailBackgrounds);
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

  const getRatioDimensions = () => {
    if (aspectRatio === '16:9') {
      return { width: 1920, height: 1080 };
    } else if (aspectRatio === '9:16') {
      return { width: 1080, height: 1920 };
    } else if (aspectRatio === '1:1-instagram') {
      return { width: 1080, height: 1080 };
    } else if (aspectRatio === '1:1-spotify') {
      return { width: 3000, height: 3000 };
    }
    return { width: 1920, height: 1080 };
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
    const tmpl = THUMBNAIL_TEMPLATES[templateKey];
    if (tmpl && templateKey !== 'custom') {
      setCustomBackgroundColor(tmpl.backgroundColor);
      setCustomTitleColor(tmpl.titleColor);
      setCustomSubtitleColor(tmpl.subtitleColor);
    }
  };

  // Obtenir couleurs actuelles (template ou custom)
  const getCurrentColors = () => {
    return {
      backgroundColor: customBackgroundColor,
      titleColor: customTitleColor,
      subtitleColor: customSubtitleColor
    };
  };

  // Dessiner preview en temps réel avec VRAIS templates
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dimensions = getRatioDimensions();

    // Canvas dimensions scaled down for preview
    const scale = aspectRatio === '9:16' ? 0.15 : aspectRatio.includes('spotify') ? 0.08 : 0.25;
    const width = dimensions.width * scale;
    const height = dimensions.height * scale;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Helper functions
    const drawTextCentered = (text, x, y, maxWidth, fontSize) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      let startY = y - totalHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + (index * lineHeight));
      });
    };

    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const adjustColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      ).toString(16).slice(1);
    };

    // Dessiner selon template sélectionné
    const tmpl = THUMBNAIL_TEMPLATES[selectedTemplate];
    if (tmpl && selectedTemplate !== 'custom') {
      // Utiliser couleurs du template
      const bgColor = tmpl.backgroundColor;
      const titleCol = tmpl.titleColor;
      const subtitleCol = tmpl.subtitleColor;

      // Template Modern
      if (selectedTemplate.includes('modern') || selectedTemplate === 'the-ermite-pro') {
        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, adjustColor(bgColor, -30));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Calculer taille de police adaptée (même logique que thumbnailService)
        const padding = width * 0.05;
        const boxWidth = width - (padding * 2);
        const maxWidth = boxWidth * 0.85;

        // Taille de départ adaptée au ratio
        let titleSize = Math.min(width * 0.05, aspectRatio.includes('spotify') ? 18 : aspectRatio === '9:16' ? 28 : 40);
        ctx.font = `600 ${titleSize}px 'Montserrat Alternates', Arial`;

        // Pré-calculer lignes wrappées
        const getWrappedLines = (text, maxW) => {
          const words = text.split(' ');
          const lines = [];
          let currentLine = '';
          words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxW && currentLine !== '') {
              lines.push(currentLine.trim());
              currentLine = word + ' ';
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine.trim()) lines.push(currentLine.trim());
          return lines;
        };

        let wrappedLines = getWrappedLines(title, maxWidth);
        let textHeight = wrappedLines.length * titleSize * 1.2;

        // Réduire si trop haut
        const maxTextHeight = height * 0.25;
        while (textHeight > maxTextHeight && titleSize > (aspectRatio.includes('spotify') ? 12 : 20)) {
          titleSize -= 2;
          ctx.font = `600 ${titleSize}px 'Montserrat Alternates', Arial`;
          wrappedLines = getWrappedLines(title, maxWidth);
          textHeight = wrappedLines.length * titleSize * 1.2;
        }

        // Encadré adapté à la hauteur du texte
        const boxPadding = titleSize * 1.5;
        const boxHeight = textHeight + boxPadding * 2;
        const boxY = (height * titlePositionY / 100) - boxHeight / 2;

        ctx.fillStyle = 'rgba(25, 32, 64, 0.8)';
        roundRect(padding, boxY, boxWidth, boxHeight, 30 * scale);
        ctx.fill();

        ctx.strokeStyle = titleCol;
        ctx.lineWidth = 4 * scale;
        roundRect(padding, boxY, boxWidth, boxHeight, 30 * scale);
        ctx.stroke();

        // Titre
        ctx.font = `600 ${titleSize}px 'Montserrat Alternates', Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = titleCol;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10 * scale;
        const titleY = boxY + boxHeight / 2;
        drawTextCentered(title, width / 2, titleY, maxWidth, titleSize);

        // Sous-titre
        if (subtitle) {
          ctx.shadowBlur = 10 * scale;
          ctx.fillStyle = subtitleCol;
          ctx.font = `600 ${titleSize * 0.45}px 'Montserrat Alternates', Arial`;
          const subtitleY = height * subtitlePositionY / 100;
          drawTextCentered(subtitle, width / 2, subtitleY, boxWidth * 0.9, titleSize * 0.45);
        }
      }
      // Template Minimal
      else if (selectedTemplate.includes('minimal') || selectedTemplate.includes('light')) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        const titleSize = aspectRatio.includes('spotify') ? 18 : aspectRatio === '9:16' ? 28 : 40;
        ctx.font = `600 ${titleSize}px 'Montserrat Alternates', Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = titleCol;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 15 * scale;
        const titleY = height * titlePositionY / 100;
        drawTextCentered(title, width / 2, titleY, width * 0.85, titleSize);

        if (subtitle) {
          ctx.shadowBlur = 15 * scale;
          ctx.fillStyle = subtitleCol;
          ctx.font = `600 ${titleSize * 0.45}px 'Montserrat Alternates', Arial`;
          const subtitleY = height * subtitlePositionY / 100;
          drawTextCentered(subtitle, width / 2, subtitleY, width * 0.85, titleSize * 0.45);
        }
      }
      // Template Gradient
      else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(0.5, adjustColor(bgColor, 20));
        gradient.addColorStop(1, adjustColor(bgColor, -20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Bande diagonale
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-15 * Math.PI / 180);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(-width, -height * 0.3, width * 3, height * 0.6);
        ctx.restore();

        const titleSize = aspectRatio.includes('spotify') ? 18 : aspectRatio === '9:16' ? 28 : 40;
        ctx.font = `600 ${titleSize}px 'Montserrat Alternates', Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = titleCol;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10 * scale;
        const titleY = height * titlePositionY / 100;
        drawTextCentered(title, width / 2, titleY, width * 0.8, titleSize);

        if (subtitle) {
          ctx.shadowBlur = 10 * scale;
          ctx.fillStyle = subtitleCol;
          ctx.font = `600 ${titleSize * 0.45}px 'Montserrat Alternates', Arial`;
          const subtitleY = height * subtitlePositionY / 100;
          drawTextCentered(subtitle, width / 2, subtitleY, width * 0.8, titleSize * 0.45);
        }
      }
    } else {
      // Template Custom - simple
      ctx.fillStyle = customBackgroundColor;
      ctx.fillRect(0, 0, width, height);

      const titleSize = aspectRatio.includes('spotify') ? 18 : aspectRatio === '9:16' ? 28 : 40;
      ctx.font = `bold ${titleSize}px 'Montserrat Alternates', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = customTitleColor;
      const titleY = (height * titlePositionY) / 100;
      drawTextCentered(title, width / 2, titleY, width * 0.85, titleSize);

      if (subtitle) {
        ctx.font = `${titleSize * 0.6}px 'Montserrat Alternates', sans-serif`;
        ctx.fillStyle = customSubtitleColor;
        const subtitleY = (height * subtitlePositionY) / 100;
        drawTextCentered(subtitle, width / 2, subtitleY, width * 0.85, titleSize * 0.6);
      }
    }

  }, [THUMBNAIL_TEMPLATES, selectedTemplate, customBackgroundColor, customTitleColor, customSubtitleColor, title, subtitle, titlePositionY, subtitlePositionY, aspectRatio]);

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

    try {
      if (cancelGeneration) return;
      setProgress(20);
      setProgressLabel('Chargement template...');

      const dimensions = getRatioDimensions();
      const currentColors = getCurrentColors();

      if (cancelGeneration) return;
      setProgress(50);
      setProgressLabel('Génération miniature...');

      const thumbnail = await thumbnailService.generateThumbnail({
        ...dimensions,
        title,
        subtitle,
        backgroundImage,
        backgroundColor: currentColors.backgroundColor,
        titleColor: currentColors.titleColor,
        subtitleColor: currentColors.subtitleColor,
        template,
        titlePositionY,
        subtitlePositionY,
        imageBlur,
        overlayOpacity
      });

      if (cancelGeneration) return;
      setProgress(90);
      setProgressLabel('Finalisation...');

      setThumbnailData(thumbnail);
      setProgress(100);
      setProgressLabel('Miniature générée !');

      // Notifier le parent si callback fourni
      if (onThumbnailGenerated) {
        const formatLabel = aspectRatio.includes('spotify') ? 'spotify' : aspectRatio.includes('instagram') ? 'instagram' : aspectRatio.replace(':', 'x');
        const filename = `${thumbnailFilename}-${template}-${formatLabel}.png`;
        onThumbnailGenerated(thumbnail, filename);
      }

      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setProgressLabel('');
      }, 500);
    } catch (err) {
      console.error('Erreur génération miniature:', err);
      alert('Erreur génération: ' + err.message);
      setIsGenerating(false);
      setProgress(0);
      setProgressLabel('');
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = thumbnailData;
    const formatLabel = aspectRatio.includes('spotify') ? 'spotify' : aspectRatio.includes('instagram') ? 'instagram' : aspectRatio.replace(':', 'x');
    a.download = `${thumbnailFilename}-${template}-${formatLabel}.png`;
    a.click();
  };

  return (
    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cremeBlanc }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.bleuProfond }}>
        Generateur de Miniatures
      </h3>

      {!thumbnailData && (
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
              Titre Principal
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 rounded-lg"
              style={{ borderColor: colors.bleuClair }}
              placeholder="Titre de votre podcast"
            />
          </div>

          {/* Sous-titre */}
          <div>
            <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
              Sous-titre (Optionnel)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-3 border-2 rounded-lg"
              style={{ borderColor: colors.bleuClair }}
              placeholder="Episode 1 - Meditation"
            />
          </div>

          {/* Template Couleurs */}
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
              {Object.keys(THUMBNAIL_TEMPLATES).map(key => (
                <option key={key} value={key}>
                  {THUMBNAIL_TEMPLATES[key].name}
                </option>
              ))}
            </select>

            {/* Couleurs personnalisées si custom */}
            {selectedTemplate === 'custom' && (
              <div className="space-y-3 mt-4 p-3 rounded border-2" style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}>
                <p className="text-sm font-semibold mb-2" style={{ color: colors.bleuRoyal }}>
                  Personnaliser les couleurs
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Fond
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
                      Titre
                    </label>
                    <input
                      type="color"
                      value={customTitleColor}
                      onChange={(e) => setCustomTitleColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Sous-titre
                    </label>
                    <input
                      type="color"
                      value={customSubtitleColor}
                      onChange={(e) => setCustomSubtitleColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filtres image */}
            {backgroundImage && (
              <div className="mt-4 p-3 rounded border-2" style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}>
                <p className="text-sm font-semibold mb-3" style={{ color: colors.bleuRoyal }}>
                  🖼️ Filtres Image
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Flou Fond : {imageBlur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={imageBlur}
                      onChange={(e) => setImageBlur(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.bleuProfond }}>
                      Opacité Overlay : {Math.round(overlayOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={overlayOpacity * 100}
                      onChange={(e) => setOverlayOpacity(parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Positionnement Titre/Sous-titre */}
          <div className="p-3 rounded border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <h4 className="font-semibold mb-3" style={{ color: colors.bleuRoyal }}>
              Positionnement Vertical
            </h4>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-semibold">
                Position Titre : {titlePositionY}%
              </label>
              <input
                type="range"
                min="10"
                max="80"
                step="1"
                value={titlePositionY}
                onChange={(e) => setTitlePositionY(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                10% = Haut | 50% = Centre | 80% = Bas
              </p>
            </div>

            {subtitle && (
              <div>
                <label className="block mb-1 text-sm font-semibold">
                  Position Sous-titre : {subtitlePositionY}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="1"
                  value={subtitlePositionY}
                  onChange={(e) => setSubtitlePositionY(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
                  20% = Haut | 50% = Centre | 90% = Bas
                </p>
              </div>
            )}
          </div>

          {/* Template + Format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
                Style Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-3 border-2 rounded-lg"
                style={{ borderColor: colors.bleuClair }}
              >
                <option value="modern">Modern (Encadre)</option>
                <option value="minimal">Minimal (Simple)</option>
                <option value="gradient">Gradient (Diagonal)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
                Format
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-3 border-2 rounded-lg"
                style={{ borderColor: colors.bleuClair }}
              >
                <option value="16:9">16:9 YouTube (1920x1080)</option>
                <option value="9:16">9:16 TikTok/Shorts (1080x1920)</option>
                <option value="1:1-instagram">1:1 Instagram (1080x1080)</option>
                <option value="1:1-spotify">1:1 Spotify (3000x3000)</option>
              </select>
            </div>
          </div>

          {/* Image de fond */}
          <div>
            <label className="block mb-2 font-semibold" style={{ color: colors.bleuRoyal }}>
              Image de Fond (Optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundChange}
              className="w-full p-3 border-2 rounded-lg"
              style={{ borderColor: colors.bleuClair }}
            />
            {backgroundImage && (
              <p className="text-xs mt-2" style={{ color: colors.bleuRoyal }}>
                {backgroundImage.name}
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="ml-2 text-red-600 underline"
                >
                  Retirer
                </button>
              </p>
            )}
          </div>

          {/* Aperçu config */}
          <div className="p-3 rounded text-sm bg-white">
            <strong>Configuration :</strong>
            <ul className="mt-2 space-y-1">
              <li>Template : {template === 'modern' ? 'Modern' : template === 'minimal' ? 'Minimal' : 'Gradient'}</li>
              <li>Format : {aspectRatio.includes('spotify') ? 'Spotify (3000x3000)' : aspectRatio.includes('instagram') ? 'Instagram (1080x1080)' : aspectRatio === '16:9' ? 'YouTube (1920x1080)' : 'TikTok/Shorts (1080x1920)'}</li>
              <li>Fond : {backgroundImage ? 'Image custom' : 'Couleur unie/Gradient'}</li>
            </ul>
          </div>

          {/* Preview en temps réel */}
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.vertEmeraude }}>
            <p className="text-sm font-semibold mb-3 text-center" style={{ color: colors.bleuProfond }}>
              👁️ Aperçu Miniature (Temps Réel)
            </p>
            <div className="flex justify-center">
              <canvas
                ref={previewCanvasRef}
                className="border-2 rounded shadow-lg"
                style={{ borderColor: colors.bleuClair, maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <p className="text-xs text-center mt-2" style={{ color: colors.bleuRoyal }}>
              Modifie le titre, sous-titre, couleurs et positions pour voir le résultat en direct
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim()}
            className="w-full px-8 py-4 rounded-lg text-white font-bold text-lg"
            style={{ backgroundColor: title.trim() ? colors.bleuRoyal : '#ccc' }}
          >
            {isGenerating ? 'Generation...' : 'Generer Miniature'}
          </button>
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
        </div>
      )}

      {thumbnailData && (
        <div className="space-y-4">
          <img
            src={thumbnailData}
            alt="Thumbnail"
            className="w-full rounded-lg border-2"
            style={{ borderColor: colors.bleuClair }}
          />

          {/* Input nom fichier éditable */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.bleuProfond }}>
              Nom du fichier :
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={thumbnailFilename}
                onChange={(e) => setThumbnailFilename(e.target.value)}
                className="flex-1 px-3 py-2 rounded border-2"
                style={{
                  borderColor: colors.bleuClair,
                  backgroundColor: colors.inputBg,
                  color: colors.bleuProfond
                }}
                placeholder="Nom du fichier"
              />
              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: colors.bleuRoyal }}>
                -{template}-{aspectRatio.includes('spotify') ? 'spotify' : aspectRatio.includes('instagram') ? 'instagram' : aspectRatio.replace(':', 'x')}.png
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
              Le nom complet sera : {thumbnailFilename}-{template}-{aspectRatio.includes('spotify') ? 'spotify' : aspectRatio.includes('instagram') ? 'instagram' : aspectRatio.replace(':', 'x')}.png
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-8 py-4 rounded-lg text-white font-bold text-lg"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              Telecharger PNG
            </button>
            <button
              onClick={() => setThumbnailData(null)}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Nouvelle
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: colors.bleuRoyal }}>
            Format PNG haute qualite - Pret pour YouTube/TikTok/Instagram/Spotify
          </p>
        </div>
      )}
    </div>
  );
}

export default ThumbnailGenerator;
