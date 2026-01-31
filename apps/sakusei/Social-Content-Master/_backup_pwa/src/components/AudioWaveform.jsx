import { useEffect, useRef } from 'react';

function AudioWaveform({ audioBuffer, colors }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Dimensions canvas
    const width = canvas.width = canvas.offsetWidth * 2; // Retina
    const height = canvas.height = 200 * 2;

    // Fond
    ctx.fillStyle = colors.inputBg || '#F5F5F5';
    ctx.fillRect(0, 0, width, height);

    // Extraire données audio
    const data = audioBuffer.getChannelData(0); // Premier canal (mono ou stéréo gauche)
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    // Ligne centrale
    ctx.strokeStyle = colors.borderColor || '#CCC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Dessiner waveform
    ctx.strokeStyle = colors.bleuRoyal || '#567EBB';
    ctx.fillStyle = colors.bleuClair || '#B8C4D8';
    ctx.lineWidth = 1;

    // Méthode 1 : Forme d'onde classique (haut + bas)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      // Trouver min/max dans la plage de samples
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum !== undefined) {
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
      }

      // Dessiner barre verticale min/max
      const yMin = (1 + min) * amp;
      const yMax = (1 + max) * amp;

      // Ligne verticale
      ctx.moveTo(i, yMin);
      ctx.lineTo(i, yMax);
    }

    ctx.stroke();

    // Remplir forme (optionnel)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.bleuRoyal || '#567EBB';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < width; i++) {
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum !== undefined && datum > max) max = datum;
      }
      const yMax = (1 + max) * amp;
      ctx.lineTo(i, yMax);
    }

    ctx.lineTo(width, height / 2);

    for (let i = width - 1; i >= 0; i--) {
      let min = 1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum !== undefined && datum < min) min = datum;
      }
      const yMin = (1 + min) * amp;
      ctx.lineTo(i, yMin);
    }

    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Bordure
    ctx.strokeStyle = colors.bleuProfond || '#192040';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);

    // Labels
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = colors.bleuProfond || '#192040';
    ctx.fillText('Temps →', 20, height - 20);
    ctx.fillText('Amplitude', 20, 40);

  }, [audioBuffer, colors]);

  return (
    <div
      className="p-4 rounded-lg border-2"
      style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
    >
      <p className="text-sm font-semibold mb-3 text-center" style={{ color: colors.bleuProfond }}>
        📈 Forme d'Onde Audio (Waveform)
      </p>
      <canvas
        ref={canvasRef}
        className="w-full rounded border-2"
        style={{ borderColor: colors.bleuClair, height: '200px' }}
      />
      <p className="text-xs mt-2 text-center" style={{ color: colors.bleuRoyal }}>
        Visualisation amplitude audio dans le temps (style Audacity)
      </p>
    </div>
  );
}

export default AudioWaveform;
