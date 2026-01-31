import { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import TranscriptionPanel from './TranscriptionPanel';
import VideoGenerator from './VideoGenerator';
import ThumbnailGenerator from './ThumbnailGenerator';
import AudioWaveform from './AudioWaveform';
import Accordion from './Accordion';

// Helper pour générer date format YYYYMMDD
const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

function AudioExport({ audioFile, config, onBack, colors, defaultVideoTemplate = null, defaultThumbnailTemplate = null }) {
  const [processing, setProcessing] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [transcript, setTranscript] = useState([]);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [cancelProcessing, setCancelProcessing] = useState(false);
  const [audioFilename, setAudioFilename] = useState(`Podcast-TheErmite-${getDateString()}`);
  const [videoData, setVideoData] = useState(null); // { blob, filename }
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState(null); // { dataUrl, filename }

  useEffect(() => {
    processAudio();
  }, []);

  const handleCancelProcessing = () => {
    setCancelProcessing(true);
    setProcessing(false);
    setProgress(0);
    setProgressLabel('Traitement annulé');
  };

  const processAudio = async () => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    setCancelProcessing(false);
    setProgressLabel('Chargement audio...');

    try {
      const mainBuffer = await audioService.loadAudioFile(audioFile);
      if (cancelProcessing) return;
      setProgress(20);
      setProgressLabel('Audio chargé');
      const duration = mainBuffer.duration;
      const ctx = audioService.initAudioContext();
      const sampleRate = ctx.sampleRate;

      let outputBuffer = ctx.createBuffer(
        mainBuffer.numberOfChannels,
        mainBuffer.length,
        sampleRate
      );

      for (let channel = 0; channel < mainBuffer.numberOfChannels; channel++) {
        const sourceData = mainBuffer.getChannelData(channel);
        const destData = outputBuffer.getChannelData(channel);
        destData.set(sourceData);
      }
      if (cancelProcessing) return;
      setProgress(40);
      setProgressLabel('Copie audio...');

      // Appliquer volume principal
      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        const data = outputBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          data[i] *= masterVolume;
        }
      }
      if (cancelProcessing) return;
      setProgress(50);
      setProgressLabel('Volume principal appliqué');

      if (config.frequency.value !== null && config.frequency.value !== 'none') {
        if (cancelProcessing) return;
        setProgressLabel('Génération fréquence thérapeutique...');
        let freqBuffer;

        if (config.frequency.type === 'pure') {
          freqBuffer = audioService.generateFrequencyBuffer(
            config.frequency.value,
            duration,
            sampleRate
          );
        } else if (config.frequency.type === 'binaural') {
          freqBuffer = audioService.generateBinauralBuffer(
            config.frequency.base,
            config.frequency.offset,
            duration,
            sampleRate
          );
        }

        if (freqBuffer) {
          for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const outputData = outputBuffer.getChannelData(channel);
            const freqData = freqBuffer.getChannelData(Math.min(channel, freqBuffer.numberOfChannels - 1));

            const minLength = Math.min(outputData.length, freqData.length);
            for (let i = 0; i < minLength; i++) {
              outputData[i] += freqData[i] * config.freqVolume;
            }
          }
        }
        if (cancelProcessing) return;
        setProgress(70);
        setProgressLabel('Fréquence mixée');
      }

      if (config.ambient) {
        if (cancelProcessing) return;
        setProgressLabel('Chargement musique ambiance...');
        let bgBuffer;

        if (config.ambient.type === 'library' && config.ambient.url) {
          try {
            const response = await fetch(config.ambient.url);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              bgBuffer = await ctx.decodeAudioData(arrayBuffer);
            } else {
              console.warn('Fichier ambiance introuvable:', config.ambient.url);
            }
          } catch (err) {
            console.warn('Erreur chargement ambiance:', err);
          }
        } else if (config.ambient.type === 'upload' && config.ambient.file) {
          try {
            bgBuffer = await audioService.loadAudioFile(config.ambient.file);
          } catch (err) {
            console.warn('Erreur décodage fichier upload:', err);
          }
        }

        if (bgBuffer) {
          for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const outputData = outputBuffer.getChannelData(channel);
            const bgData = bgBuffer.getChannelData(Math.min(channel, bgBuffer.numberOfChannels - 1));

            for (let i = 0; i < outputData.length; i++) {
              const bgIndex = i % bgData.length;
              outputData[i] += bgData[bgIndex] * config.bgVolume;
            }
          }
        }
        if (cancelProcessing) return;
        setProgress(90);
        setProgressLabel('Ambiance mixée');
      }

      if (cancelProcessing) return;
      setProgress(100);
      setProgressLabel('Traitement terminé !');
      setAudioBuffer(outputBuffer);
      setTimeout(() => setProcessing(false), 500);
    } catch (err) {
      console.error('Erreur processing:', err);
      setError(err.message);
      setProcessing(false);
    }
  };

  const handlePreview = () => {
    if (isPlaying) {
      audioService.stopAudio();
      setIsPlaying(false);
    } else {
      audioService.playAudioBuffer(audioBuffer);
      setIsPlaying(true);

      setTimeout(() => {
        setIsPlaying(false);
      }, audioBuffer.duration * 1000);
    }
  };

  const handleDownload = () => {
    const wavBlob = audioService.bufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audioFilename}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    // Télécharger audio WAV
    handleDownload();

    // Télécharger vidéo si générée
    if (videoData && videoData.blob && videoData.filename) {
      setTimeout(() => {
        const url = URL.createObjectURL(videoData.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = videoData.filename;
        a.click();
        URL.revokeObjectURL(url);
      }, 500); // Delay pour éviter blocage navigateur
    }

    // Télécharger miniature si générée
    if (thumbnailDataUrl && thumbnailDataUrl.dataUrl && thumbnailDataUrl.filename) {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = thumbnailDataUrl.dataUrl;
        a.download = thumbnailDataUrl.filename;
        a.click();
      }, 1000); // Delay supplémentaire
    }
  };

  if (processing) {
    return (
      <div className="text-center py-12">
        <div
          className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
          style={{ borderColor: colors.bleuRoyal }}
        />
        <p className="font-bold mb-4" style={{ color: colors.bleuProfond }}>
          {progressLabel}
        </p>
        {/* Barre de progression */}
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
          {/* Bouton Annuler */}
          <button
            onClick={handleCancelProcessing}
            className="px-6 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: colors.rougeBordeaux }}
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">Erreur : {error}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-white font-bold"
          style={{ backgroundColor: colors.rougeBordeaux }}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.bleuProfond }}
        >
          3. Export Audio Enrichi
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-white font-bold"
          style={{ backgroundColor: colors.rougeBordeaux }}
        >
          ← Retour
        </button>
      </div>

      {/* Section 1 : Audio Enrichi */}
      <Accordion title="Audio Enrichi" icon="🎵" defaultOpen={true} colors={colors}>
        <div className="space-y-4">
          {/* Résumé configuration */}
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: colors.cremeBlanc }}
          >
            <p className="text-sm mb-1" style={{ color: colors.bleuProfond }}>
              <strong>Fichier :</strong> {audioFile.name}
            </p>
            <p className="text-sm mb-1" style={{ color: colors.bleuProfond }}>
              <strong>Frequence :</strong> {config.frequency.name}
              {config.frequency.value && ` (${Math.round(config.freqVolume * 100)}%)`}
            </p>
            <p className="text-sm mb-1" style={{ color: colors.bleuProfond }}>
              <strong>Ambiant :</strong> {config.ambient ? config.ambient.name : 'Aucun'}
              {config.ambient && ` (${Math.round(config.bgVolume * 100)}%)`}
            </p>
            <p className="text-sm" style={{ color: colors.bleuProfond }}>
              <strong>Duree :</strong> {Math.round(audioBuffer?.duration || 0)}s
            </p>
          </div>

          {/* Contrôle Volume */}
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: colors.cremeBlanc }}
          >
            <label className="block mb-2 font-semibold text-sm" style={{ color: colors.bleuProfond }}>
              Volume Audio Principal : {Math.round(masterVolume * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
              Ajuste le volume de ta voix (100% = original)
            </p>
            <button
              onClick={processAudio}
              className="mt-2 px-4 py-2 rounded-lg text-white font-bold text-sm"
              style={{ backgroundColor: colors.bleuRoyal }}
            >
              Regenerer avec Nouveau Volume
            </button>
          </div>

          {/* Preview */}
          <div className="text-center">
            <button
              onClick={handlePreview}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: isPlaying ? colors.jauneMoutarde : colors.bleuRoyal }}
            >
              {isPlaying ? '⏸ Pause Preview' : '▶️ Preview Audio'}
            </button>
          </div>

          {/* Téléchargements */}
          <div>
            {/* Input nom fichier */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1" style={{ color: colors.bleuProfond }}>
                Nom du fichier :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={audioFilename}
                  onChange={(e) => setAudioFilename(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border-2"
                  style={{
                    borderColor: colors.bleuClair,
                    backgroundColor: colors.inputBg,
                    color: colors.bleuProfond
                  }}
                  placeholder="Nom du fichier"
                />
                <span className="text-sm font-semibold" style={{ color: colors.bleuRoyal }}>.wav</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full px-6 py-3 rounded-lg text-white font-bold mb-2"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              ⬇️ Telecharger WAV
            </button>

            <a
              href="https://creators.spotify.com/pod/show/3byQK1bhHNfXwSYtPu8sZL/home"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 rounded-lg text-white font-bold mb-2 text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1DB954' }}
            >
              🎧 Uploader sur Spotify Podcaster
            </a>

            {(videoData || thumbnailDataUrl) && (
              <button
                onClick={handleExportAll}
                className="w-full px-6 py-3 rounded-lg text-white font-bold border-2"
                style={{
                  backgroundColor: colors.bleuRoyal,
                  borderColor: colors.vertEmeraude
                }}
              >
                📦 Tout Exporter (Audio{videoData ? ' + Vidéo' : ''}{thumbnailDataUrl ? ' + Miniature' : ''})
              </button>
            )}

            <p className="text-xs text-center mt-2" style={{ color: colors.bleuRoyal }}>
              Format WAV haute qualite - Compatible tous lecteurs<br/>
              Pour MP3 : <a href="https://cloudconvert.com/wav-to-mp3" target="_blank" rel="noopener noreferrer" className="underline">CloudConvert</a> (gratuit)
            </p>
          </div>
        </div>
      </Accordion>

      {/* Section 2 : Analyse Audio */}
      <Accordion title="Analyse Audio (Waveform)" icon="📊" defaultOpen={false} colors={colors}>
        {audioBuffer && <AudioWaveform audioBuffer={audioBuffer} colors={colors} />}
      </Accordion>

      {/* Section 3 : Transcription */}
      <Accordion title="Transcription" icon="📝" defaultOpen={false} colors={colors}>
        <TranscriptionPanel
          audioFile={audioFile}
          audioBuffer={audioBuffer}
          onTranscriptGenerated={(trans) => setTranscript(trans)}
          colors={colors}
        />
      </Accordion>

      {/* Section 4 : Génération Vidéo */}
      <Accordion title="Génération Vidéo" icon="🎬" defaultOpen={false} colors={colors}>
        <VideoGenerator
          audioBuffer={audioBuffer}
          transcript={transcript}
          colors={colors}
          onVideoGenerated={(blob, filename) => setVideoData({ blob, filename })}
          defaultTemplate={defaultVideoTemplate}
        />
      </Accordion>

      {/* Section 5 : Miniature */}
      <Accordion title="Miniature" icon="🖼️" defaultOpen={false} colors={colors}>
        <ThumbnailGenerator
          podcastTitle={audioFile.name.replace(/\.[^/.]+$/, '')}
          colors={colors}
          onThumbnailGenerated={(dataUrl, filename) => setThumbnailDataUrl({ dataUrl, filename })}
          defaultTemplate={defaultThumbnailTemplate}
        />
      </Accordion>

    </div>
  );
}

export default AudioExport;
