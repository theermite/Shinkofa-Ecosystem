import { useState, useRef, useEffect } from 'react';

function AudioRecorder({ onRecordingComplete, colors }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [volume, setVolume] = useState(0); // 0-100
  const [isTesting, setIsTesting] = useState(false); // Mode test micro

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null); // Garder référence au stream pour test

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Setup Audio Context pour visualisation volume
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());

        // Cleanup audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Erreur accès microphone:', err);
      alert('Impossible d\'accéder au microphone. Vérifie les permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleUseRecording = () => {
    if (audioBlob) {
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
      onRecordingComplete(file);
    }
  };

  const handleResetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Audio Context pour visualisation volume
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsTesting(true);
    } catch (err) {
      console.error('Erreur accès microphone:', err);
      alert('Impossible d\'accéder au microphone. Vérifie les permissions.');
    }
  };

  const stopTest = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsTesting(false);
    setVolume(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Analyser volume en temps réel (test ou enregistrement)
  useEffect(() => {
    const shouldAnalyze = (isTesting || (isRecording && !isPaused)) && analyserRef.current;

    if (!shouldAnalyze) {
      setVolume(0);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculer niveau moyen
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      // Convertir 0-255 vers 0-100 avec boost pour meilleure visibilité
      const normalizedVolume = Math.min(100, (average / 255) * 200);
      setVolume(normalizedVolume);

      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isPaused, isTesting]);

  return (
    <div
      className="p-6 rounded-lg border-2"
      style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.bleuProfond }}>
        🎤 Enregistrer Audio Direct
      </h3>

      {!audioBlob ? (
        <>
          {/* Mode Test Micro */}
          {isTesting && !isRecording && (
            <div className="text-center mb-4">
              <p className="text-sm font-bold mb-3" style={{ color: colors.bleuRoyal }}>
                🎤 Test Micro en cours
              </p>
              <div className="max-w-md mx-auto">
                <p className="text-xs mb-2 font-semibold" style={{ color: colors.bleuProfond }}>
                  Niveau Micro: {Math.round(volume)}%
                </p>
                <div
                  className="w-full h-6 rounded-full overflow-hidden border-2"
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}
                >
                  <div
                    className="h-full transition-all duration-100 rounded-full"
                    style={{
                      width: `${volume}%`,
                      backgroundColor:
                        volume < 20 ? colors.bleuClair :
                        volume < 50 ? colors.vertEmeraude :
                        volume < 80 ? colors.jauneMoutarde :
                        colors.rougeBordeaux
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-center font-semibold" style={{ color: colors.bleuRoyal }}>
                  {volume < 20 ? 'Trop faible' : volume < 50 ? 'Bon niveau' : volume < 80 ? 'Optimal' : 'Attention saturation'}
                </p>
              </div>
            </div>
          )}

          {/* Timer enregistrement */}
          {isRecording && (
            <div className="text-center mb-4">
              <div
                className="inline-block text-4xl font-bold"
                style={{ color: colors.rougeBordeaux }}
              >
                {formatTime(recordingTime)}
              </div>
              <p className="text-sm mt-1" style={{ color: colors.bleuRoyal }}>
                {isPaused ? 'En pause' : 'Enregistrement...'}
              </p>

              {/* Indicateur volume micro */}
              {!isPaused && (
                <div className="mt-4 max-w-md mx-auto">
                  <p className="text-xs mb-2 font-semibold" style={{ color: colors.bleuProfond }}>
                    🎤 Niveau Micro: {Math.round(volume)}%
                  </p>
                  <div
                    className="w-full h-6 rounded-full overflow-hidden border-2"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.borderColor }}
                  >
                    <div
                      className="h-full transition-all duration-100 rounded-full"
                      style={{
                        width: `${volume}%`,
                        backgroundColor:
                          volume < 20 ? colors.bleuClair :
                          volume < 50 ? colors.vertEmeraude :
                          volume < 80 ? colors.jauneMoutarde :
                          colors.rougeBordeaux
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-center font-semibold" style={{ color: colors.bleuRoyal }}>
                    {volume < 20 ? 'Trop faible' : volume < 50 ? 'Bon niveau' : volume < 80 ? 'Optimal' : 'Attention saturation'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contrôles */}
          <div className="flex gap-3 justify-center flex-wrap">
            {!isRecording && !isTesting && (
              <>
                <button
                  onClick={startTest}
                  className="px-6 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.bleuRoyal }}
                >
                  🎤 Tester Micro
                </button>
                <button
                  onClick={startRecording}
                  className="px-8 py-4 rounded-lg text-white font-bold text-lg"
                  style={{ backgroundColor: colors.rougeBordeaux }}
                >
                  ⏺ Démarrer Enregistrement
                </button>
              </>
            )}

            {isTesting && !isRecording && (
              <>
                <button
                  onClick={stopTest}
                  className="px-6 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.rougeBordeaux }}
                >
                  ⏹ Arrêter Test
                </button>
                <button
                  onClick={() => {
                    stopTest();
                    startRecording();
                  }}
                  className="px-8 py-4 rounded-lg text-white font-bold text-lg"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  ✓ OK, Enregistrer
                </button>
              </>
            )}

            {isRecording && (
              <>
                <button
                  onClick={pauseRecording}
                  className="px-6 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.jauneMoutarde }}
                >
                  {isPaused ? '▶️ Reprendre' : '⏸ Pause'}
                </button>
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-lg text-white font-bold"
                  style={{ backgroundColor: colors.vertEmeraude }}
                >
                  ⏹ Arrêter
                </button>
              </>
            )}
          </div>

          {!isRecording && !isTesting && (
            <p className="text-sm text-center mt-4" style={{ color: colors.bleuRoyal }}>
              Teste ton micro pour vérifier le niveau, puis lance l'enregistrement
            </p>
          )}
        </>
      ) : (
        <>
          {/* Preview */}
          <div className="text-center mb-4">
            <p className="font-bold mb-2" style={{ color: colors.bleuProfond }}>
              ✅ Enregistrement terminé ({formatTime(recordingTime)})
            </p>
            <audio controls className="mx-auto mb-4">
              <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
            </audio>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleResetRecording}
              className="px-6 py-3 rounded-lg text-white font-bold"
              style={{ backgroundColor: colors.rougeBordeaux }}
            >
              🔄 Recommencer
            </button>
            <button
              onClick={handleUseRecording}
              className="px-8 py-4 rounded-lg text-white font-bold text-lg"
              style={{ backgroundColor: colors.vertEmeraude }}
            >
              ✓ Utiliser cet Enregistrement
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AudioRecorder;
