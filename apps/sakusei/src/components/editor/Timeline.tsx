'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Scissors } from 'lucide-react';

// Multi-track timeline constants
const RULER_HEIGHT = 24;
const TRACK_HEIGHT = 50;
const TRACK_LABEL_WIDTH = 80;
const TRACK_GAP = 2;
const NUM_TRACKS = 3; // Video, Music, Frequency
const TIMELINE_HEIGHT = RULER_HEIGHT + (TRACK_HEIGHT + TRACK_GAP) * NUM_TRACKS;

// Track colors
const TRACK_COLORS = {
  video: { bg: '#1e3a5f', segment: 'rgba(59, 130, 246, 0.3)', border: '#3b82f6' },
  music: { bg: '#3d1f4a', segment: 'rgba(168, 85, 247, 0.3)', border: '#a855f7' },
  frequency: { bg: '#1f3d3d', segment: 'rgba(20, 184, 166, 0.3)', border: '#14b8a6' },
};

export function Timeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'playhead' | 'inPoint' | 'outPoint' | null>(null);
  const [isBladeMode, setIsBladeMode] = useState(false);
  const [bladeCursorX, setBladeCursorX] = useState<number | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  const {
    duration,
    currentTime,
    inPoint,
    outPoint,
    zoom,
    setCurrentTime,
    setInPoint,
    setOutPoint,
    setZoom,
    clearMarkers,
    // Multi-segment
    segments,
    selectedSegmentId,
    isMultiSegmentMode,
    getActiveSegments,
    selectSegment,
    // Audio tracks
    audioTracks,
  } = useEditorStore();

  // Debug: Log component mount
  useEffect(() => {
    console.log('🎬 [Timeline] Component mounted!', { duration, currentTime });
    return () => console.log('🎬 [Timeline] Component unmounted');
  }, []);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);


  // Convert time to pixel position
  const timeToPixel = useCallback(
    (time: number) => {
      const timelineWidth = containerWidth - 40; // Padding
      return (time / duration) * timelineWidth * zoom + 20;
    },
    [duration, containerWidth, zoom]
  );

  // Convert pixel position to time
  const pixelToTime = useCallback(
    (pixel: number) => {
      const timelineWidth = containerWidth - 40;
      const adjustedPixel = pixel - 20;
      return Math.max(0, Math.min(duration, (adjustedPixel / (timelineWidth * zoom)) * duration));
    },
    [duration, containerWidth, zoom]
  );

  // Helper to get track Y position
  const getTrackY = useCallback((trackIndex: number) => {
    return RULER_HEIGHT + trackIndex * (TRACK_HEIGHT + TRACK_GAP);
  }, []);

  // Draw timeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('[Timeline] ❌ Canvas ref is null!');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[Timeline] ❌ Cannot get 2D context!');
      return;
    }

    // Set canvas size
    canvas.width = containerWidth;
    canvas.height = TIMELINE_HEIGHT;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ruler
    drawRuler(ctx);

    // Draw track backgrounds and labels
    drawTrackBackgrounds(ctx);

    // Draw video segments (Track 1)
    if (isMultiSegmentMode) {
      drawVideoSegments(ctx);
    } else {
      // Mode legacy IN/OUT
      if (inPoint !== null && outPoint !== null) {
        const inX = timeToPixel(inPoint);
        const outX = timeToPixel(outPoint);
        const trackY = getTrackY(0);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(inX, trackY, outX - inX, TRACK_HEIGHT);
      }
      if (inPoint !== null) {
        drawMarker(ctx, timeToPixel(inPoint), 'IN', '#22c55e');
      }
      if (outPoint !== null) {
        drawMarker(ctx, timeToPixel(outPoint), 'OUT', '#ef4444');
      }
    }

    // Draw audio tracks (Track 2 & 3)
    drawAudioTracks(ctx);

    // Draw playhead (full height)
    const playheadX = timeToPixel(currentTime);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();

    // Draw playhead handle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX - 8, 20);
    ctx.lineTo(playheadX + 8, 20);
    ctx.closePath();
    ctx.fill();

    // Draw blade cursor preview
    if (isBladeMode && bladeCursorX !== null) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(bladeCursorX, 0);
      ctx.lineTo(bladeCursorX, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    currentTime,
    inPoint,
    outPoint,
    duration,
    containerWidth,
    zoom,
    timeToPixel,
    isMultiSegmentMode,
    segments,
    selectedSegmentId,
    hoveredSegmentId,
    isBladeMode,
    bladeCursorX,
    audioTracks,
    getTrackY,
  ]);

  const drawRuler = (ctx: CanvasRenderingContext2D) => {
    // Ruler background
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, containerWidth, RULER_HEIGHT);

    ctx.strokeStyle = '#64748b'; // slate-500
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#cbd5e1'; // slate-300
    ctx.textAlign = 'center';

    const interval = duration > 60 ? 10 : duration > 30 ? 5 : 1;
    for (let t = 0; t <= duration; t += interval) {
      const x = timeToPixel(t);

      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, RULER_HEIGHT - 8);
      ctx.lineTo(x, RULER_HEIGHT);
      ctx.stroke();

      // Draw time label
      ctx.fillText(formatTimeShort(t), x, RULER_HEIGHT - 12);
    }

    // Draw ruler bottom border
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, RULER_HEIGHT);
    ctx.lineTo(containerWidth, RULER_HEIGHT);
    ctx.stroke();
  };

  const drawTrackBackgrounds = (ctx: CanvasRenderingContext2D) => {
    const trackInfo = [
      { name: 'Video', color: TRACK_COLORS.video, icon: '🎬' },
      { name: 'Music', color: TRACK_COLORS.music, icon: '🎵' },
      { name: 'Freq', color: TRACK_COLORS.frequency, icon: '〰️' },
    ];

    trackInfo.forEach((track, index) => {
      const y = getTrackY(index);

      // Track background
      ctx.fillStyle = track.color.bg;
      ctx.fillRect(0, y, containerWidth, TRACK_HEIGHT);

      // Track label background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, y, TRACK_LABEL_WIDTH, TRACK_HEIGHT);

      // Track label text
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${track.icon} ${track.name}`, 8, y + TRACK_HEIGHT / 2 + 4);

      // Track separator
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + TRACK_HEIGHT);
      ctx.lineTo(containerWidth, y + TRACK_HEIGHT);
      ctx.stroke();
    });
  };

  const drawVideoSegments = (ctx: CanvasRenderingContext2D) => {
    const activeSegments = getActiveSegments();
    const trackY = getTrackY(0);

    activeSegments.forEach((segment) => {
      const startX = Math.max(timeToPixel(segment.startTime), TRACK_LABEL_WIDTH);
      const endX = timeToPixel(segment.endTime);
      const width = endX - startX;
      const isSelected = segment.id === selectedSegmentId;
      const isHovered = segment.id === hoveredSegmentId;

      if (width <= 0) return;

      // Segment background
      ctx.fillStyle = isSelected
        ? 'rgba(59, 130, 246, 0.4)'
        : TRACK_COLORS.video.segment;
      ctx.fillRect(startX, trackY + 4, width, TRACK_HEIGHT - 8);

      // Segment border
      ctx.strokeStyle = isHovered ? '#60a5fa' : (isSelected ? '#3b82f6' : TRACK_COLORS.video.border);
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(startX, trackY + 4, width, TRACK_HEIGHT - 8);

      // Segment duration label
      if (width > 40) {
        const segDuration = segment.endTime - segment.startTime;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${segDuration.toFixed(1)}s`, startX + width / 2, trackY + TRACK_HEIGHT / 2 + 3);
      }

      // Segment handles (for drag/resize)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX, trackY + 4, 4, TRACK_HEIGHT - 8);
      ctx.fillRect(endX - 4, trackY + 4, 4, TRACK_HEIGHT - 8);
    });
  };

  const drawAudioTracks = (ctx: CanvasRenderingContext2D) => {
    // Draw music track (Track 2)
    const musicTrack = audioTracks.find((t) => t.type === 'music' && t.isActive);
    if (musicTrack) {
      const trackY = getTrackY(1);
      const startX = TRACK_LABEL_WIDTH;
      const endX = timeToPixel(duration);
      const width = endX - startX;

      // Music clip background
      ctx.fillStyle = TRACK_COLORS.music.segment;
      ctx.fillRect(startX, trackY + 6, width, TRACK_HEIGHT - 12);

      // Music clip border
      ctx.strokeStyle = TRACK_COLORS.music.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, trackY + 6, width, TRACK_HEIGHT - 12);

      // Music name
      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      const displayName = musicTrack.name.length > 25 ? musicTrack.name.substring(0, 22) + '...' : musicTrack.name;
      ctx.fillText(`🎵 ${displayName}`, startX + 8, trackY + TRACK_HEIGHT / 2 + 3);

      // Volume indicator
      ctx.fillStyle = '#a855f7';
      const volWidth = 40 * musicTrack.volume;
      ctx.fillRect(endX - 50, trackY + 10, volWidth, 6);
      ctx.strokeStyle = '#7c3aed';
      ctx.strokeRect(endX - 50, trackY + 10, 40, 6);
    }

    // Draw frequency track (Track 3)
    const freqTrack = audioTracks.find((t) => t.type === 'frequency' && t.isActive);
    if (freqTrack) {
      const trackY = getTrackY(2);
      const startX = TRACK_LABEL_WIDTH;
      const endX = timeToPixel(duration);
      const width = endX - startX;

      // Frequency clip background
      ctx.fillStyle = TRACK_COLORS.frequency.segment;
      ctx.fillRect(startX, trackY + 6, width, TRACK_HEIGHT - 12);

      // Frequency clip border
      ctx.strokeStyle = TRACK_COLORS.frequency.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, trackY + 6, width, TRACK_HEIGHT - 12);

      // Frequency name
      ctx.fillStyle = '#99f6e4';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`〰️ ${freqTrack.name}`, startX + 8, trackY + TRACK_HEIGHT / 2 + 3);

      // Volume indicator
      ctx.fillStyle = '#14b8a6';
      const volWidth = 40 * freqTrack.volume;
      ctx.fillRect(endX - 50, trackY + 10, volWidth, 6);
      ctx.strokeStyle = '#0d9488';
      ctx.strokeRect(endX - 50, trackY + 10, 40, 6);
    }
  };

  const drawMarker = (ctx: CanvasRenderingContext2D, x: number, label: string, color: string) => {
    const trackY = getTrackY(0);

    // Draw marker line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, trackY);
    ctx.lineTo(x, trackY + TRACK_HEIGHT);
    ctx.stroke();

    // Draw flag
    const flagWidth = 40;
    const flagHeight = 18;
    const flagX = label === 'IN' ? x : x - flagWidth;

    ctx.fillStyle = color;
    ctx.fillRect(flagX, trackY, flagWidth, flagHeight);

    // Label text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, flagX + flagWidth / 2, trackY + flagHeight / 2);
  };


  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('🖱️ [Timeline] MouseDown EVENT FIRED!', e.clientX, e.clientY);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      console.error('❌ [Timeline] No rect!');
      return;
    }

    const x = e.clientX - rect.left;
    const time = pixelToTime(x);

    console.log('🖱️ [Timeline] MouseDown:', { x, time, duration, containerWidth });

    const playheadX = timeToPixel(currentTime);

    // Check if clicking on playhead (larger hit area)
    if (Math.abs(x - playheadX) < 20) {
      console.log('✅ [Timeline] Clicked on playhead');
      setIsDragging(true);
      setDragType('playhead');
      return;
    }

    // Mode multi-segments
    if (isMultiSegmentMode) {
      // Détecter clic sur segment
      const clickedSegment = getActiveSegments().find((segment) => {
        const startX = timeToPixel(segment.startTime);
        const endX = timeToPixel(segment.endTime);
        return x >= startX && x <= endX;
      });

      if (clickedSegment) {
        console.log('✅ [Timeline] Clicked on segment:', clickedSegment.id);
        selectSegment(clickedSegment.id);
        return;
      } else {
        console.log('✅ [Timeline] Clicked on empty area, deselecting');
        selectSegment(null); // clic sur fond = désélectionner
      }
    } else {
      // Mode legacy : détection markers IN/OUT
      const inX = inPoint !== null ? timeToPixel(inPoint) : null;
      const outX = outPoint !== null ? timeToPixel(outPoint) : null;

      // Check if clicking on in marker (larger hit area)
      if (inX !== null && Math.abs(x - inX) < 40) {
        console.log('✅ [Timeline] Clicked on IN marker');
        setIsDragging(true);
        setDragType('inPoint');
        return;
      }

      // Check if clicking on out marker (larger hit area)
      if (outX !== null && Math.abs(x - outX) < 40) {
        console.log('✅ [Timeline] Clicked on OUT marker');
        setIsDragging(true);
        setDragType('outPoint');
        return;
      }
    }

    // Otherwise, seek to clicked position
    console.log('✅ [Timeline] Seeking to:', time);
    setCurrentTime(time);
    setIsDragging(true);
    setDragType('playhead');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const time = pixelToTime(x);

    // Gestion du blade cursor preview
    if (isBladeMode) {
      setBladeCursorX(x);
    }

    // Détection du survol de segment (mode multi-segments)
    if (isMultiSegmentMode && !isDragging) {
      const hoveredSegment = getActiveSegments().find((segment) => {
        const startX = timeToPixel(segment.startTime);
        const endX = timeToPixel(segment.endTime);
        return x >= startX && x <= endX;
      });

      setHoveredSegmentId(hoveredSegment ? hoveredSegment.id : null);
    }

    // Gestion du drag
    if (isDragging) {
      console.log('🔄 [Timeline] MouseMove:', { dragType, time });

      if (dragType === 'playhead') {
        setCurrentTime(time);
      } else if (dragType === 'inPoint') {
        setInPoint(time);
      } else if (dragType === 'outPoint') {
        setOutPoint(time);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log('🛑 [Timeline] MouseUp - stopping drag');
    }
    setIsDragging(false);
    setDragType(null);
  };

  const handleMouseLeave = () => {
    handleMouseUp();
    setHoveredSegmentId(null);
    setBladeCursorX(null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.5, 10));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.5, 1));
  };

  return (
    <div className="space-y-2">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInPoint(currentTime)}
            className="font-semibold bg-green-50 border-green-500/40 hover:bg-green-500 hover:text-white h-7 text-xs"
          >
            In Point (I)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOutPoint(currentTime)}
            className="font-semibold bg-red-50 border-red-500/40 hover:bg-red-500 hover:text-white h-7 text-xs"
          >
            Out Point (O)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMarkers}
            disabled={inPoint === null && outPoint === null}
            className="font-semibold h-7 text-xs"
          >
            <Scissors className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white bg-primary px-3 py-1 rounded-md shadow-sm">
            Zoom: {zoom.toFixed(1)}x
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="h-7 w-7"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 10}
            className="h-7 w-7"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div
        ref={containerRef}
        className="relative border-4 border-yellow-500 rounded-lg bg-gray-900 shadow-lg"
        style={{ minHeight: `${TIMELINE_HEIGHT}px` }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="w-full"
          style={{
            display: 'block',
            height: `${TIMELINE_HEIGHT}px`,
            cursor: isBladeMode ? 'crosshair' : 'default',
            pointerEvents: 'auto',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-mono">
        <span>Current: {formatTime(currentTime)}</span>
        {inPoint !== null && <span>In: {formatTime(inPoint)}</span>}
        {outPoint !== null && <span>Out: {formatTime(outPoint)}</span>}
        {inPoint !== null && outPoint !== null && (
          <span className="text-green-600 font-semibold">
            Trim: {formatTime(outPoint - inPoint)}
          </span>
        )}
      </div>
    </div>
  );
}

function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00.00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
