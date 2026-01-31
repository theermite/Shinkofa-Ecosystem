export const COLORS = {
  bleuProfond: '#192040',
  bleuRoyal: '#2B4C7E',
  bleuClair: '#567EBB',
  vertEmeraude: '#606D5D',
  jauneMoutarde: '#DCB455',
  rougeBordeaux: '#9A3B3B',
  cremeBlanc: '#E8F4F8',
  cardBg: '#ffffff',
  inputBg: '#ffffff',
  borderColor: '#e0e0e0'
};

export const COLORS_DARK = {
  bleuProfond: '#E8F4F8',
  bleuRoyal: '#9BB4D9',
  bleuClair: '#7896C7',
  vertEmeraude: '#8A9A85',
  jauneMoutarde: '#F0D080',
  rougeBordeaux: '#C76666',
  cremeBlanc: '#192040',
  cardBg: '#243052',
  inputBg: '#1a2538',
  borderColor: '#4a5a7a'
};

export const FREQUENCY_OPTIONS = [
  {
    value: 'none',  // Changé de null à 'none'
    type: null,
    name: 'Aucune',
    description: 'Voix seule sans frequence therapeutique'
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
    value: 'binaural-40',  // Clé unique
    base: 200,
    offset: 40,
    type: 'binaural',
    name: 'Binaural 40 Hz (Concentration)',
    description: 'Focus, attention soutenue'
  },
  {
    value: 'binaural-10',  // Clé unique
    base: 150,
    offset: 10,
    type: 'binaural',
    name: 'Binaural 10 Hz (Alpha)',
    description: 'Relaxation, meditation legere'
  },
  {
    value: 'binaural-6',  // Clé unique
    base: 100,
    offset: 6,
    type: 'binaural',
    name: 'Binaural 6 Hz (Theta)',
    description: 'Meditation profonde, creativite'
  },
  {
    value: 'binaural-3',  // Clé unique
    base: 100,
    offset: 3,
    type: 'binaural',
    name: 'Binaural 3 Hz (Sommeil Delta)',
    description: 'Sommeil profond, regeneration'
  }
];

export const MUSIC_LIBRARY = [
  {
    id: 'none',
    name: 'Aucune ambiance',
    type: 'none',
    url: null
  },
  {
    id: 'brazilian-streets',
    name: 'Brazilian Streets (Upbeat)',
    type: 'library',
    url: '/music/brazilian-streets.mp3'
  },
  {
    id: 'calm-soul',
    name: 'Calm Soul Meditation',
    type: 'library',
    url: '/music/calm-soul-meditation.mp3'
  },
  {
    id: 'chamanic-flute',
    name: 'Chamanic Flute 432 Hz (Healing)',
    type: 'library',
    url: '/music/chamanic-flute-432-hz-healing-chakras-opening-spiritual-frequency.mp3'
  },
  {
    id: 'eona-ambient',
    name: 'Eona Emotional Ambient Pop',
    type: 'library',
    url: '/music/eona-emotional-ambient-pop.mp3'
  },
  {
    id: 'healing-sleep',
    name: 'Healing Sleep Atmosphere',
    type: 'library',
    url: '/music/healing-sleep-atmosphere.mp3'
  },
  {
    id: 'meditation-bg',
    name: 'Meditation Background',
    type: 'library',
    url: '/music/meditation-background.mp3'
  },
  {
    id: 'pure-theta',
    name: 'Pure Theta 4-7Hz (Water Flow)',
    type: 'library',
    url: '/music/pure-theta-4-7hz-gentle-water-flow.mp3'
  },
  {
    id: 'vlog-beat',
    name: 'Vlog Beat Background',
    type: 'library',
    url: '/music/vlog-beat-background.mp3'
  }
];

export const VIDEO_STYLES = [
  { id: 'starwars', name: 'Star Wars Scroll' },
  { id: 'subtitles', name: 'Sous-titres' },
  { id: 'waveform', name: 'Forme d\'onde' }
];
