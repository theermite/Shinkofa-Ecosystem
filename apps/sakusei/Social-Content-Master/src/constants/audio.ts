/**
 * Audio constants for frequencies and music library
 * Frequencies are kept at subliminal levels (quasi-subliminal)
 */

export interface FrequencyOption {
  value: string | number;
  type: 'pure' | 'binaural' | null;
  name: string;
  description: string;
  base?: number;
  offset?: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  type: 'none' | 'library' | 'upload';
  url: string | null;
  category?: 'ambient' | 'upbeat' | 'meditation' | 'frequency';
}

export interface AudioConfig {
  frequency: FrequencyOption | null;
  music: MusicTrack | null;
  frequencyVolume: number; // 0-1, default ~0.06 (subliminal)
  musicVolume: number; // 0-1, default ~0.10
  fadeInDuration: number; // seconds
  fadeOutDuration: number; // seconds
}

/**
 * Healing frequencies - subliminal level recommended
 * Pure: single tone
 * Binaural: stereo difference creates perceived frequency (requires headphones)
 */
export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'none',
    type: null,
    name: 'Aucune',
    description: 'Audio original sans frequence'
  },
  {
    value: 432,
    type: 'pure',
    name: '432 Hz (Frequence Sacree)',
    description: 'Harmonie naturelle, reduction stress'
  },
  {
    value: 528,
    type: 'pure',
    name: '528 Hz (Reparation ADN)',
    description: 'Transformation, guerison cellulaire'
  },
  {
    value: 639,
    type: 'pure',
    name: '639 Hz (Relations)',
    description: 'Communication, connexion'
  },
  {
    value: 741,
    type: 'pure',
    name: '741 Hz (Eveil)',
    description: 'Intuition, expression'
  },
  {
    value: 'binaural-40',
    base: 200,
    offset: 40,
    type: 'binaural',
    name: 'Binaural 40 Hz (Concentration)',
    description: 'Focus intense, attention soutenue'
  },
  {
    value: 'binaural-10',
    base: 150,
    offset: 10,
    type: 'binaural',
    name: 'Binaural 10 Hz (Alpha)',
    description: 'Relaxation, meditation legere'
  },
  {
    value: 'binaural-6',
    base: 100,
    offset: 6,
    type: 'binaural',
    name: 'Binaural 6 Hz (Theta)',
    description: 'Meditation profonde, creativite'
  },
  {
    value: 'binaural-3',
    base: 100,
    offset: 3,
    type: 'binaural',
    name: 'Binaural 3 Hz (Delta)',
    description: 'Sommeil profond, regeneration'
  }
];

/**
 * Background music library - royalty-free tracks
 */
export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'none',
    name: 'Aucune musique',
    type: 'none',
    url: null
  },
  {
    id: 'brazilian-streets',
    name: 'Brazilian Streets',
    type: 'library',
    url: '/music/brazilian-streets.mp3',
    category: 'upbeat'
  },
  {
    id: 'calm-soul',
    name: 'Calm Soul Meditation',
    type: 'library',
    url: '/music/calm-soul-meditation.mp3',
    category: 'meditation'
  },
  {
    id: 'chamanic-flute',
    name: 'Chamanic Flute 432 Hz',
    type: 'library',
    url: '/music/chamanic-flute-432-hz-healing-chakras-opening-spiritual-frequency.mp3',
    category: 'frequency'
  },
  {
    id: 'eona-ambient',
    name: 'Eona Emotional Ambient',
    type: 'library',
    url: '/music/eona-emotional-ambient-pop.mp3',
    category: 'ambient'
  },
  {
    id: 'healing-sleep',
    name: 'Healing Sleep Atmosphere',
    type: 'library',
    url: '/music/healing-sleep-atmosphere.mp3',
    category: 'meditation'
  },
  {
    id: 'meditation-bg',
    name: 'Meditation Background',
    type: 'library',
    url: '/music/meditation-background.mp3',
    category: 'meditation'
  },
  {
    id: 'pure-theta',
    name: 'Pure Theta 4-7Hz (Water Flow)',
    type: 'library',
    url: '/music/pure-theta-4-7hz-gentle-water-flow.mp3',
    category: 'frequency'
  },
  {
    id: 'vlog-beat',
    name: 'Vlog Beat Background',
    type: 'library',
    url: '/music/vlog-beat-background.mp3',
    category: 'upbeat'
  }
];

/**
 * Default audio config - subliminal frequency level
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  frequency: null,
  music: null,
  frequencyVolume: 0.06, // 6% - quasi-subliminal
  musicVolume: 0.10, // 10% - soft background
  fadeInDuration: 2, // 2 seconds fade in
  fadeOutDuration: 3, // 3 seconds fade out
};

/**
 * Silence detection config
 */
export const SILENCE_DETECTION_CONFIG = {
  minSilenceDuration: 0.8, // seconds - silences > 0.8s will be detected
  silenceThreshold: -35, // dB - audio below this is considered silence (more sensitive)
  minSegmentDuration: 0.3, // seconds - minimum segment after cutting
};
