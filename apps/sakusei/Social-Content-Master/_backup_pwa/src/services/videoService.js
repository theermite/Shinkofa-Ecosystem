// Service génération vidéo avec transcription
export class VideoService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.mediaRecorder = null;
    this.fontLoaded = false;
  }

  // Charger police Montserrat
  async loadFont() {
    if (this.fontLoaded) return;

    try {
      await document.fonts.load('600 48px "Montserrat Alternates"');
      this.fontLoaded = true;
    } catch (err) {
      console.warn('Police Montserrat non chargée, fallback Arial');
    }
  }

  // Wrapper le texte pour qu'il rentre dans la largeur max
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // Dessiner texte multi-lignes centré
  drawMultilineText(ctx, lines, x, y, lineHeight) {
    const totalHeight = lines.length * lineHeight;
    const startY = y - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  }

  // Charger image de fond
  async loadBackgroundImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Erreur chargement image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Dessiner fond (image ou couleur)
  drawBackground(bgImage, width, height, backgroundColor) {
    if (bgImage) {
      // Dessiner image en fill cover
      const imgRatio = bgImage.width / bgImage.height;
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

      this.ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);

      // Overlay semi-transparent
      this.ctx.fillStyle = backgroundColor + '55'; // 35% opacité
      this.ctx.fillRect(0, 0, width, height);
    } else {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  // Dessiner encadré texte arrondi
  drawTextBox(x, y, width, height, radius = 20) {
    this.ctx.fillStyle = 'rgba(25, 32, 64, 0.35)'; // bleuProfond 35% opacité
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
    this.ctx.fill();
  }

  // Générer vidéo Star Wars (AMÉLIORÉ)
  async generateStarWarsVideo(audioBuffer, transcript, options = {}) {
    await this.loadFont();

    const {
      width = 1920,
      height = 1080,
      backgroundColor = '#192040',
      textColor = '#E8F4F8', // Bleu clair
      fontSize = 72,
      scrollSpeed = 70,
      backgroundImage = null,
      shadowColor = 'rgba(0, 0, 0, 0.8)',
      shadowBlur = 10,
      shadowOffsetX = 2,
      shadowOffsetY = 2
    } = options;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    let bgImage = null;
    if (backgroundImage) {
      bgImage = await this.loadBackgroundImage(backgroundImage);
    }

    const stream = this.canvas.captureStream(30);
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);

    const audioTrack = destination.stream.getAudioTracks()[0];
    stream.addTrack(audioTrack);

    const chunks = [];
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 5000000
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (bgImage) URL.revokeObjectURL(bgImage.src);
        resolve(blob);
      };

      this.mediaRecorder.onerror = (e) => {
        reject(new Error('Erreur enregistrement vidéo'));
      };

      this.mediaRecorder.start();
      source.start(0);

      this.animateStarWars(
        transcript,
        audioBuffer.duration,
        { width, height, backgroundColor, textColor, fontSize, scrollSpeed, bgImage, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY }
      );
    });
  }

  // Animation Star Wars (CORRIGÉE - Scroll vertical avec wrapping correct + customisable)
  animateStarWars(transcript, duration, options) {
    const {
      width, height, backgroundColor, textColor, fontSize, scrollSpeed,
      scrollDirection = 'bottom-to-top', fadeZone = 20, lineSpacing = 0.6,
      bgImage, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY
    } = options;
    const startTime = Date.now();

    const fullText = transcript.map(seg => seg.text).join('\n\n');
    const lines = fullText.split('\n');

    // Pré-calculer les lignes wrappées pour chaque ligne de texte
    this.ctx.font = `600 ${fontSize}px "Montserrat Alternates", Arial`;
    const maxWidth = width * 0.8;
    const lineHeight = fontSize * 1.2;

    const wrappedLinesData = lines.map(line => ({
      original: line,
      wrapped: this.wrapText(this.ctx, line, maxWidth),
      height: 0
    }));

    // Calculer la hauteur totale de chaque bloc
    wrappedLinesData.forEach(data => {
      data.height = data.wrapped.length * lineHeight;
    });

    let yOffset = 0;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed >= duration) {
        this.mediaRecorder.stop();
        return;
      }

      this.drawBackground(bgImage, width, height, backgroundColor);

      this.ctx.fillStyle = textColor;
      this.ctx.font = `600 ${fontSize}px "Montserrat Alternates", Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = shadowColor;
      this.ctx.shadowBlur = shadowBlur;
      this.ctx.shadowOffsetX = shadowOffsetX;
      this.ctx.shadowOffsetY = shadowOffsetY;

      const centerX = width / 2;
      const fadeZoneHeight = height * (fadeZone / 100); // Zone fade dynamique

      // Calculer position Y initiale selon direction
      let currentY;
      if (scrollDirection === 'bottom-to-top') {
        currentY = height + 100 - yOffset; // Commence en bas, monte
      } else {
        currentY = -100 + yOffset; // Commence en haut, descend
      }

      wrappedLinesData.forEach((lineData, index) => {
        const blockStartY = currentY;

        // Fade dynamique selon direction et zone
        let alpha = 1;
        if (scrollDirection === 'bottom-to-top') {
          // Fade en haut de l'écran
          if (blockStartY < fadeZoneHeight) {
            alpha = Math.max(0, blockStartY / fadeZoneHeight);
          }
        } else {
          // Fade en bas de l'écran
          const fadeStartBottom = height - fadeZoneHeight;
          if (blockStartY > fadeStartBottom) {
            alpha = Math.max(0, (height - blockStartY) / fadeZoneHeight);
          }
        }

        // Ne dessiner que si au moins partiellement visible
        const blockEndY = blockStartY + lineData.height;
        if (blockEndY > -100 && blockStartY < height + 100 && alpha > 0) {
          this.ctx.save();
          this.ctx.globalAlpha = alpha;

          // Dessiner chaque ligne wrappée
          lineData.wrapped.forEach((wrappedLine, wIndex) => {
            const wrappedY = blockStartY + (wIndex * lineHeight);
            if (wrappedY > -100 && wrappedY < height + 100) {
              this.ctx.fillText(wrappedLine, centerX, wrappedY);
            }
          });

          this.ctx.restore();
        }

        // Avancer la position Y pour la prochaine ligne (hauteur du bloc + espacement custom)
        currentY += lineData.height + fontSize * lineSpacing;
      });

      yOffset += scrollSpeed / 30;

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Générer vidéo TypeWriter (AMÉLIORÉ)
  async generateTypeWriterVideo(audioBuffer, transcript, options = {}) {
    await this.loadFont();

    const {
      width = 1920,
      height = 1080,
      backgroundColor = '#192040',
      textColor = '#FFFFFF',
      fontSize = 64,
      charsPerSecond = 15,
      backgroundImage = null,
      shadowColor = 'rgba(0, 0, 0, 0.5)',
      shadowBlur = 5,
      shadowOffsetX = 0,
      shadowOffsetY = 0
    } = options;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    let bgImage = null;
    if (backgroundImage) {
      bgImage = await this.loadBackgroundImage(backgroundImage);
    }

    const stream = this.canvas.captureStream(30);
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);

    const audioTrack = destination.stream.getAudioTracks()[0];
    stream.addTrack(audioTrack);

    const chunks = [];
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 5000000
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (bgImage) URL.revokeObjectURL(bgImage.src);
        resolve(blob);
      };

      this.mediaRecorder.onerror = (e) => {
        reject(new Error('Erreur enregistrement vidéo'));
      };

      this.mediaRecorder.start();
      source.start(0);

      this.animateTypeWriter(
        transcript,
        audioBuffer.duration,
        { width, height, backgroundColor, textColor, fontSize, charsPerSecond, bgImage, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY }
      );
    });
  }

  // Animation TypeWriter
  animateTypeWriter(transcript, duration, options) {
    const { width, height, backgroundColor, textColor, fontSize, charsPerSecond, bgImage, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } = options;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed >= duration) {
        this.mediaRecorder.stop();
        return;
      }

      const currentSegment = transcript.find(
        seg => elapsed >= seg.startTime && elapsed <= seg.endTime
      );

      this.drawBackground(bgImage, width, height, backgroundColor);

      if (currentSegment) {
        const segmentElapsed = elapsed - currentSegment.startTime;
        const charsToShow = Math.floor(segmentElapsed * charsPerSecond);
        const displayText = currentSegment.text.substring(0, charsToShow);

        // Calculer dimensions encadré
        const padding = 40;
        const maxWidth = width * 0.85;
        const boxX = (width - maxWidth) / 2 - padding;
        const boxWidth = maxWidth + padding * 2;

        // Pré-calculer hauteur texte
        this.ctx.font = `600 ${fontSize}px "Montserrat Alternates", Arial`;
        const lines = this.wrapText(this.ctx, displayText, maxWidth);

        const textHeight = lines.length * fontSize * 1.5;
        const boxY = (height - textHeight) / 2 - padding;
        const boxHeight = textHeight + padding * 2;

        // Dessiner encadré
        if (bgImage) {
          this.drawTextBox(boxX, boxY, boxWidth, boxHeight, 30);
        }

        // Dessiner texte
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = shadowColor;
        this.ctx.shadowBlur = shadowBlur;
        this.ctx.shadowOffsetX = shadowOffsetX;
        this.ctx.shadowOffsetY = shadowOffsetY;

        const x = width * 0.075;
        let y = boxY + padding + fontSize;

        lines.forEach((line, index) => {
          const isLastLine = index === lines.length - 1;
          const showCursor = Math.floor(elapsed * 2) % 2 === 0;
          this.ctx.fillText(
            line + (isLastLine && showCursor ? '|' : ''),
            x,
            y + (index * fontSize * 1.5)
          );
        });
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Générer vidéo simple (AMÉLIORÉ)
  async generateSimpleVideo(audioBuffer, transcript, options = {}) {
    await this.loadFont();

    const {
      width = 1920,
      height = 1080,
      backgroundColor = '#192040',
      textColor = '#FFFFFF',
      fontSize = 64,
      backgroundImage = null,
      shadowColor = 'rgba(0, 0, 0, 0.5)',
      shadowBlur = 5,
      shadowOffsetX = 0,
      shadowOffsetY = 0
    } = options;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    let bgImage = null;
    if (backgroundImage) {
      bgImage = await this.loadBackgroundImage(backgroundImage);
    }

    const stream = this.canvas.captureStream(30);
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);

    const audioTrack = destination.stream.getAudioTracks()[0];
    stream.addTrack(audioTrack);

    const chunks = [];
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 5000000
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (bgImage) URL.revokeObjectURL(bgImage.src);
        resolve(blob);
      };

      this.mediaRecorder.onerror = (e) => {
        reject(new Error('Erreur enregistrement vidéo'));
      };

      this.mediaRecorder.start();
      source.start(0);

      this.animateSimple(
        transcript,
        audioBuffer.duration,
        { width, height, backgroundColor, textColor, fontSize, bgImage, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY }
      );
    });
  }

  // Animation simple
  animateSimple(transcript, duration, options) {
    const { width, height, backgroundColor, textColor, fontSize, bgImage, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } = options;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed >= duration) {
        this.mediaRecorder.stop();
        return;
      }

      const currentSegment = transcript.find(
        seg => elapsed >= seg.startTime && elapsed <= seg.endTime
      );

      this.drawBackground(bgImage, width, height, backgroundColor);

      if (currentSegment) {
        this.ctx.font = `600 ${fontSize}px "Montserrat Alternates", Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const maxWidth = width * 0.8;
        const lines = this.wrapText(this.ctx, currentSegment.text, maxWidth);

        const lineHeight = fontSize * 1.5;
        const totalHeight = lines.length * lineHeight;
        const boxY = (height - totalHeight) / 2 - 40;
        const boxHeight = totalHeight + 80;

        if (bgImage) {
          this.drawTextBox(width * 0.05, boxY, width * 0.9, boxHeight, 30);
        }

        this.ctx.fillStyle = textColor;
        this.ctx.shadowColor = shadowColor;
        this.ctx.shadowBlur = shadowBlur;
        this.ctx.shadowOffsetX = shadowOffsetX;
        this.ctx.shadowOffsetY = shadowOffsetY;

        this.drawMultilineText(this.ctx, lines, width / 2, height / 2, lineHeight);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}

export const videoService = new VideoService();
