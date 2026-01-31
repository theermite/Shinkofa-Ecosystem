/**
 * Transcription filtering utilities
 * Used to filter and adjust transcription data when cutting video clips
 */

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionData {
  segments: TranscriptionSegment[];
  fullText: string;
  language: string;
  duration?: number;
  srt?: string;
  vtt?: string;
}

/**
 * Filter transcription segments to only include those within a specific time range
 * and adjust their timestamps relative to the new start time (t=0)
 *
 * @param transcription - Original transcription data
 * @param startTime - Start time of the cut (in seconds)
 * @param endTime - End time of the cut (in seconds)
 * @returns Filtered transcription with adjusted timestamps
 *
 * @example
 * // Original video: 0-120s with transcription
 * // Cut: 30-60s
 * // Result: segments between 30-60s, with timestamps adjusted to 0-30s
 */
export function filterTranscriptionByTimeRange(
  transcription: TranscriptionData,
  startTime: number,
  endTime: number
): TranscriptionData {
  console.log(`[TranscriptionFilter] Filtering segments from ${startTime}s to ${endTime}s`);
  console.log(`[TranscriptionFilter] Original segments count: ${transcription.segments.length}`);

  // 1. Filter segments that overlap with the time range
  // Include segments that are partially or fully within the range
  const filteredSegments = transcription.segments.filter(segment =>
    segment.end > startTime && segment.start < endTime
  );

  console.log(`[TranscriptionFilter] Filtered segments count: ${filteredSegments.length}`);

  // 2. Adjust timestamps relative to the new start time (t=0)
  const adjustedSegments = filteredSegments.map(segment => ({
    start: Math.max(0, segment.start - startTime),
    end: Math.min(endTime - startTime, segment.end - startTime),
    text: segment.text
  }));

  // 3. Regenerate fullText from filtered segments
  const newFullText = adjustedSegments.map(s => s.text).join(' ');

  console.log(`[TranscriptionFilter] Adjusted time range: 0-${endTime - startTime}s`);
  console.log(`[TranscriptionFilter] New fullText length: ${newFullText.length} chars`);

  return {
    segments: adjustedSegments,
    fullText: newFullText,
    language: transcription.language,
    duration: endTime - startTime,
    // Don't copy SRT/VTT as they would need to be regenerated
    srt: undefined,
    vtt: undefined,
  };
}
