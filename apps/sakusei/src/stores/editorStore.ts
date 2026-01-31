import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  TimelineSegment,
  SegmentOperation,
  TimelineHistory,
  AudioTrack,
  AudioTrackType,
} from '../types/timeline';
import type { SubtitleStyle } from '../types/subtitle';
import type { MediaMetadata } from '../types/media';

// Générateur d'UUID simple (compatible navigateur)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface EditorState {
  // Media info
  mediaFileId: string | null;
  sourceUrl: string | null;
  duration: number; // total duration in seconds

  // Playback state
  currentTime: number; // current playhead position in seconds
  isPlaying: boolean;
  volume: number; // 0-1
  isMuted: boolean;
  playbackRate: number; // 0.5, 1, 1.5, 2

  // Trim markers (legacy, kept for backward compatibility)
  inPoint: number | null; // start trim point in seconds
  outPoint: number | null; // end trim point in seconds

  // Multi-segment timeline (new)
  segments: TimelineSegment[];
  selectedSegmentId: string | null;
  history: TimelineHistory;
  isMultiSegmentMode: boolean;

  // Audio tracks (multi-pistes)
  audioTracks: AudioTrack[];

  // Timeline state
  zoom: number; // zoom level (1 = fit to screen, >1 = zoomed in)
  scrollOffset: number; // horizontal scroll position

  // Edited clip (if editing existing clip)
  editedClipId: string | null;
  clipName: string;

  // Transcription
  transcription: {
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  } | null;

  // Subtitle style
  subtitleStyle: SubtitleStyle | null;

  // Media metadata
  mediaMetadata: MediaMetadata | null;

  // Actions
  setMediaFile: (id: string, url: string, duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;

  // Marker actions
  setInPoint: (time: number | null) => void;
  setOutPoint: (time: number | null) => void;
  clearMarkers: () => void;
  getTrimDuration: () => number;

  // Timeline actions
  setZoom: (zoom: number) => void;
  setScrollOffset: (offset: number) => void;

  // Clip actions
  setEditedClip: (id: string, name: string) => void;
  setClipName: (name: string) => void;

  // Transcription actions
  setTranscription: (transcription: EditorState['transcription']) => void;

  // Subtitle style actions
  setSubtitleStyle: (style: SubtitleStyle | null) => void;

  // Media metadata actions
  setMediaMetadata: (metadata: MediaMetadata | null) => void;

  // Multi-segment actions
  addSegment: (segment: TimelineSegment) => void;
  deleteSegment: (id: string) => void;
  restoreSegment: (id: string) => void;
  cutSegmentAtTime: (segmentId: string, cutTime: number) => void;
  selectSegment: (id: string | null) => void;
  getActiveSegments: () => TimelineSegment[];
  undo: () => void;
  redo: () => void;
  addToHistory: (operation: SegmentOperation) => void;
  convertMarkersToSegments: () => void;
  convertSegmentsToMarkers: () => void;
  replaceAllSegments: (newSegments: Array<{ startTime: number; endTime: number }>) => void;

  // Audio track actions
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (id: string) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  setAudioTrackVolume: (id: string, volume: number) => void;
  toggleAudioTrack: (id: string) => void;
  getAudioTrack: (type: AudioTrackType) => AudioTrack | undefined;

  // Reset
  reset: () => void;
}

const initialState = {
  mediaFileId: null,
  sourceUrl: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  inPoint: null,
  outPoint: null,
  segments: [] as TimelineSegment[],
  selectedSegmentId: null,
  history: { operations: [], currentIndex: -1 } as TimelineHistory,
  isMultiSegmentMode: true, // Activé par défaut pour MVP
  audioTracks: [] as AudioTrack[],
  zoom: 1,
  scrollOffset: 0,
  editedClipId: null,
  clipName: 'Nouveau clip',
  transcription: null,
  subtitleStyle: null,
  mediaMetadata: null,
};

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Media file
        setMediaFile: (id, url, duration) => {
          const { isMultiSegmentMode } = get();

          // Créer un segment initial couvrant toute la vidéo si mode multi-segments
          const initialSegments: TimelineSegment[] = isMultiSegmentMode
            ? [
                {
                  id: generateUUID(),
                  startTime: 0,
                  endTime: duration,
                  isDeleted: false,
                  createdAt: Date.now(),
                },
              ]
            : [];

          set({
            mediaFileId: id,
            sourceUrl: url,
            duration,
            currentTime: 0,
            inPoint: null,
            outPoint: null,
            segments: initialSegments,
            selectedSegmentId: initialSegments.length > 0 ? initialSegments[0].id : null,
            history: { operations: [], currentIndex: -1 },
          });
        },

        // Playback controls
        setCurrentTime: (time) => {
          const { duration } = get();
          const clampedTime = Math.max(0, Math.min(time, duration));
          set({ currentTime: clampedTime });
        },

        setIsPlaying: (playing) => set({ isPlaying: playing }),

        togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

        setVolume: (volume) => {
          const clampedVolume = Math.max(0, Math.min(1, volume));
          set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
        },

        toggleMute: () =>
          set((state) => ({
            isMuted: !state.isMuted,
          })),

        setPlaybackRate: (rate) => {
          const validRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
          const clampedRate = validRates.includes(rate) ? rate : 1;
          set({ playbackRate: clampedRate });
        },

        // Marker controls
        setInPoint: (time) => {
          const { outPoint, duration } = get();
          if (time !== null) {
            const clampedTime = Math.max(0, Math.min(time, duration));
            // Ensure in point is before out point
            if (outPoint !== null && clampedTime >= outPoint) {
              set({ inPoint: outPoint - 0.1, currentTime: clampedTime });
            } else {
              set({ inPoint: clampedTime, currentTime: clampedTime });
            }
          } else {
            set({ inPoint: null });
          }
        },

        setOutPoint: (time) => {
          const { inPoint, duration } = get();
          if (time !== null) {
            const clampedTime = Math.max(0, Math.min(time, duration));
            // Ensure out point is after in point
            if (inPoint !== null && clampedTime <= inPoint) {
              set({ outPoint: inPoint + 0.1, currentTime: clampedTime });
            } else {
              set({ outPoint: clampedTime, currentTime: clampedTime });
            }
          } else {
            set({ outPoint: null });
          }
        },

        clearMarkers: () => set({ inPoint: null, outPoint: null }),

        getTrimDuration: () => {
          const { inPoint, outPoint, duration } = get();
          const start = inPoint ?? 0;
          const end = outPoint ?? duration;
          return Math.max(0, end - start);
        },

        // Timeline controls
        setZoom: (zoom) => {
          const clampedZoom = Math.max(1, Math.min(10, zoom));
          set({ zoom: clampedZoom });
        },

        setScrollOffset: (offset) => {
          const clampedOffset = Math.max(0, offset);
          set({ scrollOffset: clampedOffset });
        },

        // Clip info
        setEditedClip: (id, name) =>
          set({ editedClipId: id, clipName: name }),

        setClipName: (name) => set({ clipName: name }),

        // Transcription
        setTranscription: (transcription) => set({ transcription }),

        // Subtitle style
        setSubtitleStyle: (subtitleStyle) => set({ subtitleStyle }),

        // Media metadata
        setMediaMetadata: (mediaMetadata) => set({ mediaMetadata }),

        // Multi-segment operations
        addSegment: (segment) => {
          const { segments } = get();
          const newSegments = [...segments, segment].sort(
            (a, b) => a.startTime - b.startTime
          );
          set({ segments: newSegments });

          get().addToHistory({
            type: 'create',
            segmentId: segment.id,
            timestamp: Date.now(),
            previousState: undefined,
          });
        },

        deleteSegment: (id) => {
          const { segments } = get();
          const segment = segments.find((s) => s.id === id);
          if (!segment) return;

          const updatedSegments = segments.map((s) =>
            s.id === id ? { ...s, isDeleted: true } : s
          );

          set({
            segments: updatedSegments,
            selectedSegmentId: null,
          });

          get().addToHistory({
            type: 'delete',
            segmentId: id,
            timestamp: Date.now(),
            previousState: { ...segment },
          });
        },

        restoreSegment: (id) => {
          const { segments } = get();
          const updatedSegments = segments.map((s) =>
            s.id === id ? { ...s, isDeleted: false } : s
          );
          set({ segments: updatedSegments });

          get().addToHistory({
            type: 'restore',
            segmentId: id,
            timestamp: Date.now(),
          });
        },

        cutSegmentAtTime: (segmentId, cutTime) => {
          const { segments } = get();
          const segment = segments.find((s) => s.id === segmentId);
          if (!segment) return;

          // Validation: max 50 segments
          const MAX_SEGMENTS = 50;
          const activeCount = segments.filter((s) => !s.isDeleted).length;
          if (activeCount >= MAX_SEGMENTS) {
            console.warn(`Maximum ${MAX_SEGMENTS} segments reached`);
            return;
          }

          // Validation: durée minimale de 0.5s pour chaque segment
          const MIN_DURATION = 0.5;
          if (
            cutTime - segment.startTime < MIN_DURATION ||
            segment.endTime - cutTime < MIN_DURATION
          ) {
            console.warn('Cut too close to segment boundary');
            return;
          }

          // Créer 2 nouveaux segments
          const leftSegment: TimelineSegment = {
            id: generateUUID(),
            startTime: segment.startTime,
            endTime: cutTime,
            isDeleted: false,
            createdAt: Date.now(),
          };

          const rightSegment: TimelineSegment = {
            id: generateUUID(),
            startTime: cutTime,
            endTime: segment.endTime,
            isDeleted: false,
            createdAt: Date.now() + 1, // +1 pour garantir l'ordre
          };

          // Remplacer l'original par les 2 nouveaux
          const newSegments = segments
            .filter((s) => s.id !== segmentId)
            .concat([leftSegment, rightSegment])
            .sort((a, b) => a.startTime - b.startTime);

          set({
            segments: newSegments,
            selectedSegmentId: rightSegment.id,
          });

          get().addToHistory({
            type: 'cut',
            segmentId,
            timestamp: Date.now(),
            previousState: { ...segment },
            createdSegmentIds: [leftSegment.id, rightSegment.id],
          });
        },

        selectSegment: (id) => set({ selectedSegmentId: id }),

        getActiveSegments: () => {
          const { segments } = get();
          return segments
            .filter((s) => !s.isDeleted)
            .sort((a, b) => a.startTime - b.startTime);
        },

        undo: () => {
          const { history, segments } = get();
          if (history.currentIndex < 0) {
            console.log('Nothing to undo');
            return;
          }

          const operation = history.operations[history.currentIndex];

          if (operation.type === 'delete' && operation.previousState) {
            // Restaurer segment supprimé
            const restored = { ...operation.previousState, isDeleted: false };
            const updatedSegments = segments.map((s) =>
              s.id === operation.segmentId ? restored : s
            );
            set({
              segments: updatedSegments,
              history: {
                ...history,
                currentIndex: history.currentIndex - 1,
              },
            });
          } else if (operation.type === 'cut') {
            // Restaurer segment original, supprimer les 2 splits
            if (
              !operation.previousState ||
              !operation.createdSegmentIds ||
              operation.createdSegmentIds.length !== 2
            ) {
              console.error('Invalid cut operation state for undo');
              return;
            }

            const restoredSegment = {
              ...operation.previousState,
              isDeleted: false,
            };
            const updatedSegments = segments
              .filter((s) => !operation.createdSegmentIds!.includes(s.id))
              .concat([restoredSegment])
              .sort((a, b) => a.startTime - b.startTime);

            set({
              segments: updatedSegments,
              selectedSegmentId: restoredSegment.id,
              history: {
                ...history,
                currentIndex: history.currentIndex - 1,
              },
            });
          } else if (operation.type === 'create') {
            // Supprimer segment créé
            const updatedSegments = segments.filter(
              (s) => s.id !== operation.segmentId
            );
            set({
              segments: updatedSegments,
              history: {
                ...history,
                currentIndex: history.currentIndex - 1,
              },
            });
          }
        },

        redo: () => {
          const { history, segments } = get();
          if (history.currentIndex >= history.operations.length - 1) {
            console.log('Nothing to redo');
            return;
          }

          const operation = history.operations[history.currentIndex + 1];

          if (operation.type === 'delete') {
            // Re-delete segment
            const updatedSegments = segments.map((s) =>
              s.id === operation.segmentId ? { ...s, isDeleted: true } : s
            );
            set({
              segments: updatedSegments,
              selectedSegmentId: null,
              history: {
                ...history,
                currentIndex: history.currentIndex + 1,
              },
            });
          } else if (operation.type === 'cut' && operation.previousState) {
            // Re-execute cut
            const cutTime =
              operation.createdSegmentIds && operation.createdSegmentIds.length === 2
                ? segments.find((s) => s.id === operation.createdSegmentIds![0])
                    ?.endTime
                : null;

            if (cutTime) {
              // Recreate the split
              get().cutSegmentAtTime(operation.segmentId, cutTime);
            }
          }
        },

        addToHistory: (operation) => {
          const { history } = get();

          // Si on n'est pas à la fin de l'historique, supprimer les opérations futures
          const operations =
            history.currentIndex < history.operations.length - 1
              ? history.operations.slice(0, history.currentIndex + 1)
              : history.operations;

          set({
            history: {
              operations: [...operations, operation],
              currentIndex: operations.length, // Nouveau index
            },
          });
        },

        convertMarkersToSegments: () => {
          const { inPoint, outPoint, duration } = get();
          const start = inPoint ?? 0;
          const end = outPoint ?? duration;

          const segment: TimelineSegment = {
            id: generateUUID(),
            startTime: start,
            endTime: end,
            isDeleted: false,
            createdAt: Date.now(),
          };

          set({
            segments: [segment],
            isMultiSegmentMode: true,
            selectedSegmentId: segment.id,
          });
        },

        convertSegmentsToMarkers: () => {
          const { segments } = get();
          const activeSegments = segments.filter((s) => !s.isDeleted);

          if (activeSegments.length > 0) {
            const firstSegment = activeSegments[0];
            set({
              inPoint: firstSegment.startTime,
              outPoint: firstSegment.endTime,
              isMultiSegmentMode: false,
              segments: [],
              selectedSegmentId: null,
            });
          }
        },

        replaceAllSegments: (newSegments) => {
          const segments: TimelineSegment[] = newSegments.map((seg, index) => ({
            id: generateUUID(),
            startTime: seg.startTime,
            endTime: seg.endTime,
            isDeleted: false,
            createdAt: Date.now() + index,
          }));

          set({
            segments,
            selectedSegmentId: segments.length > 0 ? segments[0].id : null,
            history: { operations: [], currentIndex: -1 }, // Reset history
          });
        },

        // Audio track actions
        addAudioTrack: (track) => {
          const { audioTracks } = get();
          // Ne garder qu'une seule piste par type
          const filteredTracks = audioTracks.filter((t) => t.type !== track.type);
          set({ audioTracks: [...filteredTracks, track] });
        },

        removeAudioTrack: (id) => {
          const { audioTracks } = get();
          set({ audioTracks: audioTracks.filter((t) => t.id !== id) });
        },

        updateAudioTrack: (id, updates) => {
          const { audioTracks } = get();
          set({
            audioTracks: audioTracks.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          });
        },

        setAudioTrackVolume: (id, volume) => {
          const { audioTracks } = get();
          const clampedVolume = Math.max(0, Math.min(1, volume));
          set({
            audioTracks: audioTracks.map((t) =>
              t.id === id ? { ...t, volume: clampedVolume } : t
            ),
          });
        },

        toggleAudioTrack: (id) => {
          const { audioTracks } = get();
          set({
            audioTracks: audioTracks.map((t) =>
              t.id === id ? { ...t, isActive: !t.isActive } : t
            ),
          });
        },

        getAudioTrack: (type) => {
          const { audioTracks } = get();
          return audioTracks.find((t) => t.type === type && t.isActive);
        },

        // Reset to initial state
        reset: () => set(initialState),
      }),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          // Only persist these fields
          volume: state.volume,
          isMuted: state.isMuted,
          playbackRate: state.playbackRate,
          zoom: state.zoom,
        }),
      }
    ),
    { name: 'EditorStore' }
  )
);
