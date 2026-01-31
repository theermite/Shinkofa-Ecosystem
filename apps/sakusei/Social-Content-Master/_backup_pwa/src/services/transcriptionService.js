// Service transcription avec Whisper (OpenAI) ET AssemblyAI
export class TranscriptionService {
  constructor() {
    this.whisperApiKey = null;
    this.assemblyApiKey = null;
  }

  setWhisperKey(key) {
    this.whisperApiKey = key;
    localStorage.setItem('whisper_api_key', key);
  }

  setAssemblyKey(key) {
    this.assemblyApiKey = key;
    localStorage.setItem('assembly_api_key', key);
  }

  getWhisperKey() {
    if (!this.whisperApiKey) {
      this.whisperApiKey = localStorage.getItem('whisper_api_key');
    }
    return this.whisperApiKey;
  }

  getAssemblyKey() {
    if (!this.assemblyApiKey) {
      this.assemblyApiKey = localStorage.getItem('assembly_api_key');
    }
    return this.assemblyApiKey;
  }

  // Whisper OpenAI
  async transcribeWithWhisper(audioFile, onProgress) {
    const apiKey = this.getWhisperKey();
    if (!apiKey) {
      throw new Error('Cle API Whisper manquante');
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'fr');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    try {
      if (onProgress) onProgress('Transcription Whisper en cours...');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Whisper');
      }

      const result = await response.json();

      const transcript = result.segments.map(segment => ({
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text.trim()
      }));

      return transcript;
    } catch (error) {
      console.error('Erreur Whisper:', error);
      throw error;
    }
  }

  // AssemblyAI avec meilleure gestion erreur
  async transcribeWithAssemblyAI(audioFile, onProgress) {
    const apiKey = this.getAssemblyKey();
    if (!apiKey) {
      throw new Error('Cle API AssemblyAI manquante');
    }

    try {
      // Vérifier taille fichier (max 5 GB pour AssemblyAI, mais recommandé < 500 MB)
      const maxSize = 500 * 1024 * 1024; // 500 MB
      if (audioFile.size > maxSize) {
        throw new Error(`Fichier trop volumineux (${(audioFile.size / 1024 / 1024).toFixed(1)} MB). Max 500 MB.`);
      }

      if (onProgress) onProgress('Upload fichier...');

      // Lire fichier comme ArrayBuffer
      const arrayBuffer = await audioFile.arrayBuffer();

      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'authorization': apiKey
        },
        body: arrayBuffer
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Erreur upload AssemblyAI:', errorText);
        throw new Error(`Erreur upload (${uploadResponse.status}): ${errorText || 'Format fichier non supporte'}`);
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.upload_url) {
        throw new Error('URL upload manquante dans reponse');
      }

      if (onProgress) onProgress('Transcription en cours...');

      const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: uploadResult.upload_url,
          language_code: 'fr',
          punctuate: true,
          format_text: true
        })
      });

      if (!transcriptResponse.ok) {
        const errorText = await transcriptResponse.text();
        console.error('Erreur transcription AssemblyAI:', errorText);
        throw new Error(`Erreur lancement transcription (${transcriptResponse.status})`);
      }

      const transcriptResult = await transcriptResponse.json();

      if (!transcriptResult.id) {
        throw new Error('ID transcription manquant');
      }

      const id = transcriptResult.id;

      // Polling résultat
      let transcript = null;
      let attempts = 0;
      const maxAttempts = 120;

      while (!transcript && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const resultResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
          headers: { 'authorization': apiKey }
        });

        if (!resultResponse.ok) {
          throw new Error(`Erreur polling (${resultResponse.status})`);
        }

        const result = await resultResponse.json();

        if (result.status === 'completed') {
          transcript = result;
          break;
        } else if (result.status === 'error') {
          throw new Error(result.error || 'Erreur transcription inconnue');
        }

        if (onProgress) onProgress(`Transcription... ${attempts * 5}s`);
        attempts++;
      }

      if (!transcript) {
        throw new Error('Timeout transcription (10 min)');
      }

      return this.parseAssemblyAIOutput(transcript);
    } catch (error) {
      console.error('Erreur AssemblyAI:', error);
      throw error;
    }
  }

  parseAssemblyAIOutput(result) {
    if (!result.words || result.words.length === 0) {
      return [{
        startTime: 0,
        endTime: 10,
        text: result.text || 'Transcription vide'
      }];
    }

    const segments = [];
    let currentSegment = {
      startTime: result.words[0].start / 1000,
      endTime: result.words[0].end / 1000,
      text: result.words[0].text
    };

    for (let i = 1; i < result.words.length; i++) {
      const word = result.words[i];
      const wordStart = word.start / 1000;
      const wordEnd = word.end / 1000;

      if (wordStart - currentSegment.endTime > 2 || wordEnd - currentSegment.startTime > 10) {
        segments.push(currentSegment);
        currentSegment = {
          startTime: wordStart,
          endTime: wordEnd,
          text: word.text
        };
      } else {
        currentSegment.endTime = wordEnd;
        currentSegment.text += ' ' + word.text;
      }
    }

    segments.push(currentSegment);
    return segments;
  }

  parseManualTranscript(text, duration) {
    const lines = text.split('\n').filter(line => line.trim());

    return lines.map((line, index) => {
      const match = line.match(/^(\d+\.?\d*)-(\d+\.?\d*):\s*(.+)$/);
      if (match) {
        return {
          startTime: parseFloat(match[1]),
          endTime: parseFloat(match[2]),
          text: match[3].trim()
        };
      }

      const segmentDuration = duration / lines.length;
      return {
        startTime: index * segmentDuration,
        endTime: (index + 1) * segmentDuration,
        text: line.trim()
      };
    });
  }

  generateSRT(transcript) {
    let srt = '';
    transcript.forEach((segment, index) => {
      const startTime = this.formatSRTTime(segment.startTime);
      const endTime = this.formatSRTTime(segment.endTime);
      srt += `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n\n`;
    });
    return srt;
  }

  generateVTT(transcript) {
    let vtt = 'WEBVTT\n\n';
    transcript.forEach((segment, index) => {
      const startTime = this.formatVTTTime(segment.startTime);
      const endTime = this.formatVTTTime(segment.endTime);
      vtt += `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n\n`;
    });
    return vtt;
  }

  formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
  }

  formatVTTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
}

export const transcriptionService = new TranscriptionService();
