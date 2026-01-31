import Groq from 'groq-sdk';
import { readFileSync } from 'fs';

// Lazy initialize Groq client (to allow env vars to be loaded first)
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export interface TranscriptionSegment {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  fullText: string;
  language: string;
  duration: number;
}

/**
 * Transcribe audio/video file using Groq Whisper v3
 * @param audioFilePath - Path to audio file (mp3, wav, etc.)
 * @param language - Optional language code (e.g., 'fr', 'en'). Auto-detect if not provided.
 * @returns Transcription result with segments and full text
 */
export async function transcribeWithGroq(
  audioFilePath: string,
  language?: string
): Promise<TranscriptionResult> {
  try {
    console.log('[Groq] Starting transcription:', audioFilePath);
    const startTime = Date.now();

    // Read audio file
    const audioFile = readFileSync(audioFilePath);

    // Call Groq Whisper API with verbose_json response
    const groq = getGroqClient();
    const transcription = await groq.audio.transcriptions.create({
      file: new File([audioFile], 'audio.mp3'),
      model: 'whisper-large-v3-turbo', // Fastest Whisper v3 model
      response_format: 'verbose_json', // Get segments with timestamps
      language: language, // Optional: 'fr' for French, 'en' for English
      temperature: 0.0, // Deterministic output
    });

    const processingTime = Date.now() - startTime;
    console.log(`[Groq] Transcription completed in ${processingTime}ms`);

    // Parse response (cast to any to access verbose_json fields)
    const transcriptionData = transcription as any;
    const result: TranscriptionResult = {
      segments: [],
      fullText: transcription.text,
      language: language || 'unknown',
      duration: 0, // Will be calculated from segments or audio metadata
    };

    // Extract segments with timestamps
    if (transcriptionData.segments && Array.isArray(transcriptionData.segments)) {
      result.segments = transcriptionData.segments.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      }));
    } else {
      // Fallback: create single segment if no timestamps
      result.segments = [
        {
          start: 0,
          end: result.duration,
          text: transcription.text,
        },
      ];
    }

    console.log(`[Groq] Extracted ${result.segments.length} segments`);
    return result;
  } catch (error) {
    console.error('[Groq] Transcription error:', error);

    // Handle specific Groq errors
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        throw new Error('Groq API quota exceeded. Try again later or use backup provider.');
      }
      if (error.message.includes('file size')) {
        throw new Error('Audio file too large for Groq API (max 25MB).');
      }
    }

    throw new Error(`Groq transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert transcription segments to SRT subtitle format
 * @param segments - Transcription segments
 * @returns SRT formatted string
 */
export function segmentsToSRT(segments: TranscriptionSegment[]): string {
  let srt = '';

  segments.forEach((segment, index) => {
    const startTime = formatSRTTime(segment.start);
    const endTime = formatSRTTime(segment.end);

    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${segment.text}\n`;
    srt += `\n`;
  });

  return srt;
}

/**
 * Convert transcription segments to VTT subtitle format
 * @param segments - Transcription segments
 * @returns VTT formatted string
 */
export function segmentsToVTT(segments: TranscriptionSegment[]): string {
  let vtt = 'WEBVTT\n\n';

  segments.forEach((segment, index) => {
    const startTime = formatVTTTime(segment.start);
    const endTime = formatVTTTime(segment.end);

    vtt += `${index + 1}\n`;
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${segment.text}\n`;
    vtt += `\n`;
  });

  return vtt;
}

/**
 * Format seconds to SRT time format (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * Format seconds to VTT time format (HH:MM:SS.mmm)
 */
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}
