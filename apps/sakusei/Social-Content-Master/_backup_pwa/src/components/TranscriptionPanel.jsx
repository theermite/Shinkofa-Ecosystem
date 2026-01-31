import { useState, useEffect } from 'react';
import { transcriptionService } from '../services/transcriptionService';

function TranscriptionPanel({ audioFile, audioBuffer, onTranscriptGenerated, colors }) {
  const [transcript, setTranscript] = useState([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [cancelTranscription, setCancelTranscription] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState(null);
  const [whisperKey, setWhisperKey] = useState('');
  const [assemblyKey, setAssemblyKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');

  useEffect(() => {
    const savedWhisper = transcriptionService.getWhisperKey();
    const savedAssembly = transcriptionService.getAssemblyKey();

    if (savedWhisper) setWhisperKey(savedWhisper);
    if (savedAssembly) setAssemblyKey(savedAssembly);

    if (!savedAssembly) {
      const initialKey = '6bdeef319e27402387deb7ba14fffcd5';
      setAssemblyKey(initialKey);
      transcriptionService.setAssemblyKey(initialKey);
    }
  }, []);

  const handleSaveSettings = () => {
    if (whisperKey.trim()) transcriptionService.setWhisperKey(whisperKey);
    if (assemblyKey.trim()) transcriptionService.setAssemblyKey(assemblyKey);
    setShowSettings(false);
  };

  const handleCancelTranscription = () => {
    setCancelTranscription(true);
    setIsTranscribing(false);
    setProgress(0);
    setProgressLabel('Transcription annulée');
  };

  const handleTranscribe = async (method) => {
    setIsTranscribing(true);
    setError(null);
    setProgress(0);
    setCancelTranscription(false);
    setProgressLabel('Préparation...');

    try {
      let result;
      if (method === 'whisper') {
        setProgress(10);
        setProgressLabel('Envoi audio à Whisper OpenAI...');
        if (cancelTranscription) return;

        result = await transcriptionService.transcribeWithWhisper(
          audioFile,
          (msg) => {
            setProgressLabel(msg);
            setProgress(50);
          }
        );

        if (cancelTranscription) return;
        setProgress(90);
        setProgressLabel('Finalisation...');
      } else {
        setProgress(10);
        setProgressLabel('Envoi audio à AssemblyAI...');
        if (cancelTranscription) return;

        result = await transcriptionService.transcribeWithAssemblyAI(
          audioFile,
          (msg) => {
            setProgressLabel(msg);
            if (msg.includes('Upload')) setProgress(30);
            else if (msg.includes('Analyse')) setProgress(60);
            else setProgress(50);
          }
        );

        if (cancelTranscription) return;
        setProgress(90);
        setProgressLabel('Finalisation...');
      }

      if (cancelTranscription) return;
      setTranscript(result);
      if (onTranscriptGenerated) onTranscriptGenerated(result);
      setProgress(100);
      setProgressLabel('Transcription terminée !');
      setTimeout(() => {
        setIsTranscribing(false);
        setProgress(0);
        setProgressLabel('');
      }, 500);
    } catch (err) {
      console.error('Erreur transcription:', err);
      setError(err.message);
      setIsTranscribing(false);
      setProgress(0);
      setProgressLabel('');
    }
  };

  const handleManualTranscript = () => {
    const segments = transcriptionService.parseManualTranscript(manualText, audioBuffer.duration);
    setTranscript(segments);
    if (onTranscriptGenerated) onTranscriptGenerated(segments);
    setManualMode(false);
  };

  const handleStartEdit = () => {
    const text = transcript.map(seg =>
      `${seg.startTime.toFixed(1)}-${seg.endTime.toFixed(1)}: ${seg.text}`
    ).join('\n');
    setEditedTranscript(text);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const segments = transcriptionService.parseManualTranscript(editedTranscript, audioBuffer.duration);
    setTranscript(segments);
    if (onTranscriptGenerated) onTranscriptGenerated(segments);
    setIsEditing(false);
  };

  const handleDownloadSRT = () => {
    const srt = transcriptionService.generateSRT(transcript);
    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVTT = () => {
    const vtt = transcriptionService.generateVTT(transcript);
    const blob = new Blob([vtt], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasWhisper = transcriptionService.getWhisperKey();
  const hasAssembly = transcriptionService.getAssemblyKey();

  return (
    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cremeBlanc }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold" style={{ color: colors.bleuProfond }}>
          Transcription Audio
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 rounded-lg text-white font-bold text-sm"
          style={{ backgroundColor: colors.bleuClair }}
        >
          Config API
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 rounded-lg border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <h4 className="font-bold mb-3" style={{ color: colors.bleuProfond }}>
            Configuration APIs
          </h4>

          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1" style={{ color: colors.bleuProfond }}>
              Whisper OpenAI (ultra rapide, ~$0.006/min)
            </label>
            <input
              type="password"
              value={whisperKey}
              onChange={(e) => setWhisperKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 border-2 rounded"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
            />
            <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
              platform.openai.com/api-keys
            </p>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1" style={{ color: colors.bleuProfond }}>
              AssemblyAI (gratuit 5h/mois, rapide)
            </label>
            <input
              type="password"
              value={assemblyKey}
              onChange={(e) => setAssemblyKey(e.target.value)}
              placeholder="Cle API AssemblyAI"
              className="w-full p-2 border-2 rounded"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
            />
            <p className="text-xs mt-1" style={{ color: colors.bleuRoyal }}>
              assemblyai.com/app/signup
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: colors.vertEmeraude }}
          >
            Enregistrer
          </button>
        </div>
      )}

      {transcript.length === 0 && !isTranscribing && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTranscribe('whisper')}
              className="px-6 py-4 rounded-lg text-white font-bold"
              style={{ backgroundColor: hasWhisper ? colors.bleuRoyal : '#ccc' }}
              disabled={!hasWhisper}
            >
              <div className="text-lg mb-1">Ultra Rapide</div>
              <div className="text-xs">Whisper OpenAI</div>
            </button>

            <button
              onClick={() => handleTranscribe('assembly')}
              className="px-6 py-4 rounded-lg text-white font-bold"
              style={{ backgroundColor: hasAssembly ? colors.vertEmeraude : '#ccc' }}
              disabled={!hasAssembly}
            >
              <div className="text-lg mb-1">Gratuit 5h/mois</div>
              <div className="text-xs">AssemblyAI</div>
            </button>
          </div>

          <button
            onClick={() => setManualMode(!manualMode)}
            className="w-full px-6 py-3 rounded-lg text-white font-bold"
            style={{ backgroundColor: colors.jauneMoutarde }}
          >
            Saisie Manuelle
          </button>

          {!hasWhisper && !hasAssembly && (
            <p className="text-sm text-center text-red-600">
              Configure au moins une API pour transcription auto
            </p>
          )}
        </div>
      )}

      {manualMode && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: colors.bleuRoyal }}>
            Format: 0-5: Texte (ou juste texte)
          </p>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full h-40 p-3 border-2 rounded-lg"
            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
            placeholder="0-5: Bonjour&#10;5-12: Bienvenue"
          />
          <div className="flex gap-3">
            <button
              onClick={handleManualTranscript}
              className="flex-1 px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              Valider
            </button>
            <button
              onClick={() => setManualMode(false)}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {isTranscribing && (
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
              onClick={handleCancelTranscription}
              className="px-6 py-2 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
          Erreur: {error}
        </div>
      )}

      {transcript.length > 0 && !isEditing && (
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto p-3 rounded border-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <p className="text-xs mb-3 font-bold" style={{ color: colors.bleuRoyal }}>
              {transcript.length} segments
            </p>
            {transcript.map((segment, index) => (
              <div key={index} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: colors.borderColor }}>
                <p className="text-xs mb-1" style={{ color: colors.bleuRoyal }}>
                  [{segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s]
                </p>
                <p className="text-sm" style={{ color: colors.bleuProfond }}>{segment.text}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadSRT}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              Telecharger SRT
            </button>
            <button
              onClick={handleDownloadVTT}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.bleuRoyal }}
            >
              Telecharger VTT
            </button>
            <button
              onClick={handleStartEdit}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.jauneMoutarde }}
            >
              Editer Texte
            </button>
            <button
              onClick={() => setTranscript([])}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: colors.bleuRoyal }}>
            Mode Edition - Corrige les erreurs
          </p>
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="w-full h-64 p-3 border-2 rounded-lg font-mono text-sm"
            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor, color: colors.bleuProfond }}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              Enregistrer Corrections
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranscriptionPanel;
