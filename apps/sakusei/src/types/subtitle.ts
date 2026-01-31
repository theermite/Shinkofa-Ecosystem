/**
 * Subtitle styling types
 */

export interface SubtitleStyle {
  // Font
  fontFamily: string;
  fontSize: number; // px
  fontWeight: 'normal' | 'bold' | 'bolder';

  // Colors
  textColor: string; // hex
  backgroundColor: string; // hex with alpha
  strokeColor: string; // text outline color
  strokeWidth: number; // px

  // Position
  position: 'bottom' | 'center' | 'top';
  marginBottom: number; // px from bottom (for bottom position)

  // Animation (future)
  animation?: 'none' | 'fade' | 'slide';
}

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 24,
  fontWeight: 'bold',

  textColor: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  strokeColor: '#000000',
  strokeWidth: 0,

  position: 'bottom',
  marginBottom: 80,

  animation: 'none',
};

export const SUBTITLE_PRESETS: Record<string, { name: string; style: Partial<SubtitleStyle> }> = {
  modern: {
    name: 'Moderne',
    style: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      textColor: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      strokeWidth: 0,
      position: 'bottom',
      marginBottom: 80,
    },
  },
  tiktok: {
    name: 'TikTok',
    style: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 28,
      fontWeight: 'bolder',
      textColor: '#FFFFFF',
      backgroundColor: 'transparent',
      strokeColor: '#000000',
      strokeWidth: 3,
      position: 'center',
      marginBottom: 0,
    },
  },
  youtube: {
    name: 'YouTube',
    style: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 22,
      fontWeight: 'normal',
      textColor: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      strokeWidth: 0,
      position: 'bottom',
      marginBottom: 60,
    },
  },
  minimal: {
    name: 'Minimal',
    style: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 20,
      fontWeight: 'normal',
      textColor: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      strokeWidth: 0,
      position: 'bottom',
      marginBottom: 40,
    },
  },
  bold: {
    name: 'Bold Impact',
    style: {
      fontFamily: 'Impact, sans-serif',
      fontSize: 32,
      fontWeight: 'bold',
      textColor: '#FFFF00',
      backgroundColor: 'transparent',
      strokeColor: '#000000',
      strokeWidth: 4,
      position: 'center',
      marginBottom: 0,
    },
  },
};

export const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'system-ui, sans-serif', label: 'System' },
];
