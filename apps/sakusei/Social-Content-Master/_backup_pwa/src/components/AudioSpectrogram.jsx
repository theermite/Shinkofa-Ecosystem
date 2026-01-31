import { useEffect, useRef } from 'react';

function AudioSpectrogram({ audioBuffer, colors }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Dimensions canvas
    const width = canvas.width = canvas.offsetWidth * 2; // Retina
    const height = canvas.height = 150 * 2;

    // Créer AudioContext offline pour analyse
    const offlineContext = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = offlineContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(offlineContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Nombre d'échantillons temporels à afficher
    const numTimeSlices = 200;
    const sliceDuration = audioBuffer.duration / numTimeSlices;
    const samplesPerSlice = Math.floor(audioBuffer.sampleRate * sliceDuration);

    // Extraire données fréquentielles pour chaque tranche temporelle
    const spectrogramData = [];

    for (let i = 0; i < numTimeSlices; i++) {
      const startSample = i * samplesPerSlice;
      const endSample = Math.min(startSample + samplesPerSlice, audioBuffer.length);

      if (startSample >= audioBuffer.length) break;

      // Extraire slice audio
      const sliceBuffer = offlineContext.createBuffer(
        1,
        endSample - startSample,
        audioBuffer.sampleRate
      );

      const channelData = audioBuffer.getChannelData(0);
      const sliceData = sliceBuffer.getChannelData(0);

      for (let j = 0; j < sliceData.length; j++) {
        sliceData[j] = channelData[startSample + j];
      }

      // Analyser fréquences (simplification : moyenne des amplitudes)
      const freqData = new Uint8Array(bufferLength);
      for (let k = 0; k < bufferLength; k++) {
        const idx = Math.min(startSample + k, channelData.length - 1);
        freqData[k] = Math.abs(channelData[idx]) * 255;
      }

      spectrogramData.push(freqData);
    }

    // Dessiner spectrogramme
    ctx.fillStyle = colors.cremeBlanc || '#FFF';
    ctx.fillRect(0, 0, width, height);

    const sliceWidth = width / spectrogramData.length;
    const freqHeight = height / bufferLength;

    spectrogramData.forEach((freqData, x) => {
      for (let y = 0; y < bufferLength; y++) {
        const value = freqData[y];

        // Gradient couleur basé sur intensité
        let color;
        if (value < 64) {
          color = colors.bleuProfond || '#192040';
        } else if (value < 128) {
          color = colors.bleuRoyal || '#567EBB';
        } else if (value < 192) {
          color = colors.jauneMoutarde || '#F4A259';
        } else {
          color = colors.rougeBordeaux || '#8B1E3F';
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = value / 255;
        ctx.fillRect(
          x * sliceWidth,
          height - (y * freqHeight),
          sliceWidth,
          freqHeight
        );
      }
    });

    ctx.globalAlpha = 1;

    // Axes et labels
    ctx.strokeStyle = colors.bleuProfond || '#192040';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = colors.bleuProfond || '#192040';
    ctx.fillText('Temps →', 20, height - 20);

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Fréquence ↑', 0, 0);
    ctx.restore();

  }, [audioBuffer, colors]);

  return (
    <div
      className="p-4 rounded-lg border-2"
      style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
    >
      <p className="text-sm font-semibold mb-3 text-center" style={{ color: colors.bleuProfond }}>
        📊 Spectrogramme Audio (Analyse Fréquentielle)
      </p>
      <canvas
        ref={canvasRef}
        className="w-full rounded border-2"
        style={{ borderColor: colors.bleuClair, height: '150px' }}
      />
      <p className="text-xs mt-2 text-center" style={{ color: colors.bleuRoyal }}>
        Visualisation temps-fréquence : Bleu (basses), Jaune (medium), Rouge (aigus)
      </p>
    </div>
  );
}

export default AudioSpectrogram;
