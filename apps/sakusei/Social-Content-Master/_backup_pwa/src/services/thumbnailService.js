// Service génération miniatures/thumbnails
export class ThumbnailService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.fontLoaded = false;
  }

  async loadFont() {
    if (this.fontLoaded) return;

    try {
      await document.fonts.load('600 48px "Montserrat Alternates"');
      this.fontLoaded = true;
    } catch (err) {
      console.warn('Police Montserrat non chargée');
    }
  }

  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Erreur chargement image'));

      if (typeof file === 'string') {
        img.src = file;
      } else {
        img.src = URL.createObjectURL(file);
      }
    });
  }

  async generateThumbnail(config) {
    await this.loadFont();

    const {
      width,
      height,
      title,
      subtitle = '',
      backgroundImage = null,
      backgroundColor = '#192040',
      titleColor = '#FFFFFF',
      subtitleColor = '#E8F4F8',
      template = 'modern',
      imageBlur = 0,
      overlayOpacity = 0.35
    } = config;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    // Charger image fond si fournie
    let bgImg = null;
    if (backgroundImage) {
      bgImg = await this.loadImage(backgroundImage);
    }

    // Appliquer template
    if (template === 'modern') {
      this.drawModernTemplate(bgImg, config);
    } else if (template === 'minimal') {
      this.drawMinimalTemplate(bgImg, config);
    } else if (template === 'gradient') {
      this.drawGradientTemplate(bgImg, config);
    }

    return this.canvas.toDataURL('image/png');
  }

  drawModernTemplate(bgImg, config) {
    const { width, height, title, subtitle, backgroundColor, titleColor, subtitleColor, titlePositionY = 40, subtitlePositionY = 65, imageBlur = 0, overlayOpacity = 0.35 } = config;

    // Fond
    if (bgImg) {
      this.drawCoverImage(bgImg, width, height, imageBlur, overlayOpacity, backgroundColor);
    } else {
      const gradient = this.ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, backgroundColor);
      gradient.addColorStop(1, this.adjustColor(backgroundColor, -30));
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    }

    // Calculer taille de police adaptée avec wrapping
    const padding = width * 0.05;
    const boxWidth = width - (padding * 2);
    const maxWidth = boxWidth * 0.85; // Marge intérieure

    // Trouver une taille de police qui permet au texte wrappé de tenir
    let titleSize = Math.min(width * 0.05, 80); // Taille de départ raisonnable
    this.ctx.font = `600 ${titleSize}px "Montserrat Alternates", Arial`;

    // Pré-calculer les lignes wrappées
    const getWrappedLines = (text, maxW) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = this.ctx.measureText(testLine);

        if (metrics.width > maxW && currentLine !== '') {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      return lines;
    };

    let wrappedLines = getWrappedLines(title, maxWidth);
    const lineHeight = titleSize * 1.2;
    let textHeight = wrappedLines.length * lineHeight;

    // Si le texte est trop haut, réduire la taille de police
    const maxTextHeight = height * 0.25; // Maximum 25% de la hauteur
    while (textHeight > maxTextHeight && titleSize > 30) {
      titleSize -= 5;
      this.ctx.font = `600 ${titleSize}px "Montserrat Alternates", Arial`;
      wrappedLines = getWrappedLines(title, maxWidth);
      textHeight = wrappedLines.length * titleSize * 1.2;
    }

    // Encadré titre adapté à la hauteur du texte
    const boxPadding = titleSize * 1.5; // Padding vertical proportionnel
    const boxHeight = textHeight + boxPadding * 2;
    const boxY = (height * titlePositionY / 100) - boxHeight / 2;

    this.ctx.fillStyle = 'rgba(25, 32, 64, 0.8)';
    this.roundRect(padding, boxY, boxWidth, boxHeight, 30);
    this.ctx.fill();

    this.ctx.strokeStyle = titleColor;
    this.ctx.lineWidth = 4;
    this.roundRect(padding, boxY, boxWidth, boxHeight, 30);
    this.ctx.stroke();

    // Titre
    this.ctx.fillStyle = titleColor;
    this.ctx.font = `600 ${titleSize}px "Montserrat Alternates", Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 10;

    const titleY = boxY + boxHeight / 2;
    this.drawTextCentered(title, width / 2, titleY, maxWidth);

    // Sous-titre
    if (subtitle) {
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = subtitleColor;
      this.ctx.font = `600 ${titleSize * 0.45}px "Montserrat Alternates", Arial`;
      const subtitleY = height * subtitlePositionY / 100;
      this.drawTextCentered(subtitle, width / 2, subtitleY, boxWidth * 0.9);
    }
  }

  drawMinimalTemplate(bgImg, config) {
    const { width, height, title, subtitle, backgroundColor, titleColor, subtitleColor, titlePositionY = 40, subtitlePositionY = 65, imageBlur = 0, overlayOpacity = 0.35 } = config;

    if (bgImg) {
      this.drawCoverImage(bgImg, width, height, imageBlur, overlayOpacity, backgroundColor);
    } else {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, width, height);
    }

    // Titre
    const titleSize = this.calculateFontSize(title, width * 0.85, height * 0.15);
    this.ctx.fillStyle = titleColor;
    this.ctx.font = `600 ${titleSize}px "Montserrat Alternates", Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    this.ctx.shadowBlur = 15;

    const titleY = height * titlePositionY / 100;
    this.drawTextCentered(title, width / 2, titleY, width * 0.85);

    // Sous-titre
    if (subtitle) {
      this.ctx.fillStyle = subtitleColor;
      this.ctx.font = `600 ${titleSize * 0.45}px "Montserrat Alternates", Arial`;
      const subtitleY = height * subtitlePositionY / 100;
      this.drawTextCentered(subtitle, width / 2, subtitleY, width * 0.85);
    }
  }

  drawGradientTemplate(bgImg, config) {
    const { width, height, title, subtitle, backgroundColor, titleColor, subtitleColor, titlePositionY = 40, subtitlePositionY = 65, imageBlur = 0, overlayOpacity = 0.35 } = config;

    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(0.5, this.adjustColor(backgroundColor, 20));
    gradient.addColorStop(1, this.adjustColor(backgroundColor, -20));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    if (bgImg) {
      // Appliquer blur si défini
      if (imageBlur > 0) {
        this.ctx.filter = `blur(${imageBlur}px)`;
      }

      // Opacité de l'image (30% par défaut pour gradient template)
      this.ctx.globalAlpha = 0.3;

      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = width / height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      this.ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);

      // Réinitialiser
      this.ctx.filter = 'none';
      this.ctx.globalAlpha = 1.0;

      // Overlay additionnel si overlayOpacity > 0
      if (overlayOpacity > 0) {
        this.ctx.globalAlpha = overlayOpacity;
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.globalAlpha = 1.0;
      }
    }

    // Bande diagonale
    this.ctx.save();
    this.ctx.translate(width / 2, height / 2);
    this.ctx.rotate(-15 * Math.PI / 180);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.fillRect(-width, -height * 0.3, width * 3, height * 0.6);
    this.ctx.restore();

    // Titre
    const titleSize = this.calculateFontSize(title, width * 0.8, height * 0.15);
    this.ctx.fillStyle = titleColor;
    this.ctx.font = `600 ${titleSize}px "Montserrat Alternates", Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 10;

    const titleY = height * titlePositionY / 100;
    this.drawTextCentered(title, width / 2, titleY, width * 0.8);

    // Sous-titre
    if (subtitle) {
      this.ctx.fillStyle = subtitleColor;
      this.ctx.font = `600 ${titleSize * 0.45}px "Montserrat Alternates", Arial`;
      const subtitleY = height * subtitlePositionY / 100;
      this.drawTextCentered(subtitle, width / 2, subtitleY, width * 0.8);
    }
  }

  drawCoverImage(img, width, height, imageBlur = 0, overlayOpacity = 0.35, backgroundColor = '#192040') {
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    // Appliquer filtre blur si > 0
    if (imageBlur > 0) {
      this.ctx.filter = `blur(${imageBlur}px)`;
    }

    this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Réinitialiser filtre
    this.ctx.filter = 'none';

    // Appliquer overlay avec opacité
    if (overlayOpacity > 0) {
      this.ctx.globalAlpha = overlayOpacity;
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.globalAlpha = 1.0;
    }
  }

  drawTextCentered(text, x, y, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = this.ctx.measureText(testLine);

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

    const lineHeight = parseInt(this.ctx.font) * 1.2;
    const totalHeight = lines.length * lineHeight;
    let startY = y - totalHeight / 2;

    lines.forEach((line, index) => {
      this.ctx.fillText(line, x, startY + (index * lineHeight));
    });
  }

  calculateFontSize(text, maxWidth, maxHeight) {
    let fontSize = maxHeight;
    this.ctx.font = `600 ${fontSize}px "Montserrat Alternates", Arial`;

    while (this.ctx.measureText(text).width > maxWidth && fontSize > 20) {
      fontSize -= 2;
      this.ctx.font = `600 ${fontSize}px "Montserrat Alternates", Arial`;
    }

    return Math.min(fontSize, maxHeight);
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  adjustColor(color, percent) {
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
  }
}

export const thumbnailService = new ThumbnailService();
