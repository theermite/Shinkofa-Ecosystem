/**
 * Timeline Multi-Segments Types
 *
 * Types pour le système de timeline avec blade tool et segments multiples.
 * Utilisé pour remplacer le système IN/OUT simple par une timeline NLE professionnelle.
 */

/**
 * Segment de timeline représentant une portion de vidéo à conserver.
 * Les segments sont concaténés lors de l'export.
 */
export interface TimelineSegment {
  /** Identifiant unique du segment (UUID) */
  id: string;

  /** Temps de début en secondes (absolu dans la vidéo source) */
  startTime: number;

  /** Temps de fin en secondes (absolu dans la vidéo source) */
  endTime: number;

  /** Indique si le segment est supprimé (soft delete pour undo) */
  isDeleted: boolean;

  /** Timestamp de création (pour tri et historique) */
  createdAt: number;
}

/**
 * Opération effectuée sur un segment (pour système undo/redo).
 */
export interface SegmentOperation {
  /** Type d'opération */
  type: 'create' | 'delete' | 'restore' | 'cut';

  /** ID du segment concerné */
  segmentId: string;

  /** Timestamp de l'opération */
  timestamp: number;

  /** État précédent du segment (pour undo) */
  previousState?: TimelineSegment;

  /** IDs des segments créés (pour cut qui crée 2 segments) */
  createdSegmentIds?: string[];
}

/**
 * Historique des opérations pour undo/redo.
 */
export interface TimelineHistory {
  /** Liste des opérations effectuées */
  operations: SegmentOperation[];

  /** Index de l'opération courante (-1 si aucune) */
  currentIndex: number;
}

/**
 * Résultat de concaténation de segments.
 */
export interface ConcatResult {
  /** Chemin du fichier de sortie */
  outputPath: string;

  /** Durée totale en secondes */
  duration: number;

  /** Nombre de segments concaténés */
  segmentCount: number;

  /** Taille du fichier en bytes */
  fileSize: number;
}

/**
 * Options pour la concaténation de segments.
 */
export interface ConcatOptions {
  /** Chemin du fichier d'entrée */
  inputPath: string;

  /** Chemin du fichier de sortie */
  outputPath: string;

  /** Segments à concaténer (dans l'ordre) */
  segments: TimelineSegment[];

  /** Callback de progression (0-100) */
  onProgress?: (progress: number) => void;

  /** Préset FFmpeg (default: 'fast') */
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';

  /** Qualité CRF (default: 23) */
  crf?: number;
}

/**
 * Type de piste audio
 */
export type AudioTrackType = 'music' | 'frequency';

/**
 * Piste audio (musique de fond ou fréquence)
 */
export interface AudioTrack {
  /** Identifiant unique */
  id: string;

  /** Type de piste */
  type: AudioTrackType;

  /** ID de la source (ID de musique ou valeur de fréquence) */
  sourceId: string;

  /** Nom affiché */
  name: string;

  /** Volume (0-1) */
  volume: number;

  /** Durée de fade in en secondes */
  fadeIn: number;

  /** Durée de fade out en secondes */
  fadeOut: number;

  /** URL du fichier audio (pour musique) ou null (pour fréquence générée) */
  url: string | null;

  /** Actif ou non */
  isActive: boolean;
}
