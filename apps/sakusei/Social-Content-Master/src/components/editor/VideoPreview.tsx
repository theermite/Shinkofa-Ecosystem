'use client';

import { useRef, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useAudioPreview } from '@/hooks/useAudioPreview';
import { Play, Pause, Volume2, VolumeX, Music, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DEFAULT_SUBTITLE_STYLE } from '@/types/subtitle';

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    sourceUrl,
    currentTime,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    inPoint,
    outPoint,
    duration,
    transcription,
    subtitleStyle,
    setCurrentTime,
    setIsPlaying,
    togglePlay,
    toggleMute,
    setVolume,
    // Multi-segment
    segments,
    selectedSegmentId,
    isMultiSegmentMode,
    cutSegmentAtTime,
    deleteSegment,
    undo,
    redo,
  } = useEditorStore();

  // Audio preview (music + frequency sync with video)
  const { resumeAudioContext, hasMusicTrack, hasFrequencyTrack } = useAudioPreview();

  // Find current subtitle segment
  const currentSubtitle = transcription?.segments?.find(
    (seg: any) => currentTime >= seg.start && currentTime <= seg.end
  );

  // Sync video current time with store
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Auto-loop between in/out points if markers are set
      if (outPoint !== null && time >= outPoint) {
        video.currentTime = inPoint ?? 0;
        if (!isPlaying) {
          video.pause();
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleLoadedMetadata = () => {
      // Set initial time to in point if set
      if (inPoint !== null) {
        video.currentTime = inPoint;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [inPoint, outPoint, isPlaying, setCurrentTime, setIsPlaying]);

  // Sync store currentTime to video (when user seeks on timeline)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only update if difference is significant (avoid loop)
    if (Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.error('Play failed:', err);
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Sync volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // Blade cut handler
  const handleBladeCut = () => {
    if (!isMultiSegmentMode) return;

    // Valider max segments
    const MAX_SEGMENTS = 50;
    const activeCount = segments.filter((s) => !s.isDeleted).length;
    if (activeCount >= MAX_SEGMENTS) {
      toast.error(`Maximum ${MAX_SEGMENTS} segments atteint`);
      return;
    }

    // Trouver segment sous le playhead
    const segmentAtPlayhead = segments.find(
      (s) => !s.isDeleted && currentTime >= s.startTime && currentTime <= s.endTime
    );

    if (!segmentAtPlayhead) {
      toast.warning('Aucun segment sous le playhead');
      return;
    }

    // Valider distance minimale des bordures (0.5s)
    const MIN_DISTANCE = 0.5;
    if (
      currentTime - segmentAtPlayhead.startTime < MIN_DISTANCE ||
      segmentAtPlayhead.endTime - currentTime < MIN_DISTANCE
    ) {
      toast.warning('Trop proche du bord du segment (min 0.5s)');
      return;
    }

    cutSegmentAtTime(segmentAtPlayhead.id, currentTime);
    toast.success(`Segment coupé à ${currentTime.toFixed(2)}s`);
  };

  // Delete segment handler
  const handleDeleteSegment = () => {
    if (!isMultiSegmentMode) return;

    if (!selectedSegmentId) {
      toast.warning('Aucun segment sélectionné');
      return;
    }

    deleteSegment(selectedSegmentId);
    toast.success('Segment supprimé (Cmd+Z pour annuler)');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'KeyI':
          e.preventDefault();
          useEditorStore.getState().setInPoint(currentTime);
          break;

        case 'KeyO':
          e.preventDefault();
          useEditorStore.getState().setOutPoint(currentTime);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          setCurrentTime(currentTime - (e.shiftKey ? 5 : 1));
          break;

        case 'ArrowRight':
          e.preventDefault();
          setCurrentTime(currentTime + (e.shiftKey ? 5 : 1));
          break;

        case 'Home':
          e.preventDefault();
          setCurrentTime(inPoint ?? 0);
          break;

        case 'End':
          e.preventDefault();
          setCurrentTime(outPoint ?? duration);
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'KeyC':
          e.preventDefault();
          handleBladeCut();
          break;

        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDeleteSegment();
          break;

        case 'KeyZ':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
              toast.info('Redo');
            } else {
              undo();
              toast.info('Undo');
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTime,
    inPoint,
    outPoint,
    duration,
    setCurrentTime,
    togglePlay,
    toggleMute,
    isMultiSegmentMode,
    segments,
    selectedSegmentId,
    cutSegmentAtTime,
    deleteSegment,
    undo,
    redo,
  ]);

  if (!sourceUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <p>Aucune vidéo chargée</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={sourceUrl}
        className="w-full h-full object-contain"
        preload="metadata"
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      {/* Subtitle Overlay */}
      {currentSubtitle && (() => {
        const style = subtitleStyle || DEFAULT_SUBTITLE_STYLE;

        // Position classes
        const positionClasses = {
          top: 'top-8',
          center: 'top-1/2 -translate-y-1/2',
          bottom: '',
        };

        // Stroke/outline as text-shadow
        const textShadow = style.strokeWidth > 0
          ? `
            -${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
            ${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
            -${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor},
            ${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor}
          `
          : 'none';

        return (
          <div
            className={`absolute left-0 right-0 flex justify-center px-4 pointer-events-none ${positionClasses[style.position]}`}
            style={{
              bottom: style.position === 'bottom' ? `${style.marginBottom}px` : undefined,
            }}
          >
            <div
              className="px-6 py-3 rounded-lg shadow-lg max-w-2xl text-center"
              style={{
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                fontWeight: style.fontWeight,
                color: style.textColor,
                backgroundColor: style.backgroundColor,
                textShadow,
              }}
            >
              <p className="leading-relaxed">
                {currentSubtitle.text}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Overlay Controls (show on hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                resumeAudioContext(); // Resume AudioContext on user interaction
                togglePlay();
              }}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            {/* Audio Track Indicators */}
            {(hasMusicTrack || hasFrequencyTrack) && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded">
                {hasMusicTrack && (
                  <span className="flex items-center gap-1 text-purple-400" title="Musique active">
                    <Music className="h-3 w-3" />
                  </span>
                )}
                {hasFrequencyTrack && (
                  <span className="flex items-center gap-1 text-teal-400" title="Frequence active">
                    <Waves className="h-3 w-3" />
                  </span>
                )}
              </div>
            )}

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              {/* Mute Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : Math.round(volume * 100)}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value) / 100;
                  setVolume(newVolume);
                  // Unmute if user moves slider
                  if (isMuted && newVolume > 0) {
                    toggleMute();
                  }
                }}
                className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />

              {/* Volume Percentage */}
              <span className="text-white text-xs font-mono w-8 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
