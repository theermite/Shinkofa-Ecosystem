/**
 * Dictionary utilities for transcription corrections
 */

export interface DictionaryEntry {
  id: string;
  term: string;
  replacement: string;
  caseSensitive: boolean;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

/**
 * Apply dictionary corrections to a single text string
 */
export function applyDictionaryToText(
  text: string,
  dictionary: DictionaryEntry[]
): string {
  let correctedText = text;

  for (const entry of dictionary) {
    if (entry.caseSensitive) {
      // Case-sensitive replacement
      correctedText = correctedText.split(entry.term).join(entry.replacement);
    } else {
      // Case-insensitive replacement using regex
      const regex = new RegExp(escapeRegex(entry.term), 'gi');
      correctedText = correctedText.replace(regex, entry.replacement);
    }
  }

  return correctedText;
}

/**
 * Apply dictionary corrections to all transcription segments
 */
export function applyDictionaryToTranscription(
  segments: TranscriptionSegment[],
  dictionary: DictionaryEntry[]
): TranscriptionSegment[] {
  if (!dictionary || dictionary.length === 0) {
    return segments;
  }

  return segments.map((segment) => ({
    ...segment,
    text: applyDictionaryToText(segment.text, dictionary),
  }));
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Export dictionary to JSON format
 */
export function exportDictionaryToJson(dictionary: DictionaryEntry[]): string {
  const exportData = dictionary.map(({ term, replacement, caseSensitive }) => ({
    term,
    replacement,
    caseSensitive,
  }));
  return JSON.stringify(exportData, null, 2);
}

/**
 * Parse imported dictionary JSON
 */
export function parseDictionaryJson(
  json: string
): Array<{ term: string; replacement: string; caseSensitive?: boolean }> {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) {
      throw new Error('Invalid format: expected array');
    }

    return data.map((item) => {
      if (!item.term || !item.replacement) {
        throw new Error('Invalid entry: missing term or replacement');
      }
      return {
        term: String(item.term),
        replacement: String(item.replacement),
        caseSensitive: Boolean(item.caseSensitive),
      };
    });
  } catch (error) {
    throw new Error(`Failed to parse dictionary JSON: ${error}`);
  }
}
