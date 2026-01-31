'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, Loader2, Subtitles, PanelRightOpen, PanelRightClose, Music, Scissors, FileVideo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { VideoPreview } from './VideoPreview';
import { Timeline } from './Timeline';
import { SubtitlePanel } from './SubtitlePanel';
import { ExportModal, type AudioExportConfig } from './ExportModal';
import { AudioConfigPanel } from './AudioConfigPanel';
import { AudioTrackPanel } from './AudioTrackPanel';
import { MediaMetadataPanel } from './MediaMetadataPanel';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';

interface MediaFileInfo {
  id: string;
  filename: string;
  mimeType: string;
  duration: number;
  url: string;
}

interface EditorPageClientProps {
  mediaFile: MediaFileInfo;
}

export function EditorPageClient({ mediaFile }: EditorPageClientProps) {
  const router = useRouter();
  const {
    setMediaFile,
    clipName,
    setClipName,
    inPoint,
    outPoint,
    getTrimDuration,
    transcription,
    setTranscription,
    // Multi-segment
    isMultiSegmentMode,
    getActiveSegments,
    replaceAllSegments,
    // Audio tracks
    audioTracks,
  } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAudioConfigOpen, setIsAudioConfigOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isDetectingSilence, setIsDetectingSilence] = useState(false);

  // Initialize editor with media file
  useEffect(() => {
    console.log('📹 [EditorPageClient] Initializing with mediaFile:', {
      id: mediaFile.id,
      url: mediaFile.url,
      duration: mediaFile.duration,
      filename: mediaFile.filename
    });

    if (!mediaFile.duration || mediaFile.duration === 0) {
      console.error('❌ [EditorPageClient] Duration is 0 or null! Video metadata not loaded from DB.');
    }

    setMediaFile(mediaFile.id, mediaFile.url, mediaFile.duration);

    // Load transcription from EditedClip if available
    fetch(`/api/editor/clip/${mediaFile.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.clip && data.clip.transcription) {
          console.log('📝 [EditorPageClient] Loaded transcription:', data.clip.transcription.segments?.length || 0, 'segments');
          setTranscription(data.clip.transcription);
        }
      })
      .catch((err) => {
        console.error('❌ [EditorPageClient] Failed to load transcription:', err);
      });
  }, [mediaFile, setMediaFile, setTranscription]);

  const trimDuration = getTrimDuration();
  const activeSegments = getActiveSegments();
  const hasMarkers = isMultiSegmentMode
    ? activeSegments.length > 0
    : inPoint !== null || outPoint !== null;
  const hasSubtitles = transcription && transcription.segments && transcription.segments.length > 0;

  // Handle multi-format export
  const handleMultiFormatExport = async (formats: string[], burnSubtitles: boolean, audioConfig?: AudioExportConfig) => {
    try {
      let clipId: string;
      let mediaFileIdForTranscode: string;

      // MODE MULTI-SEGMENTS
      if (isMultiSegmentMode) {
        const activeSegments = getActiveSegments();

        if (activeSegments.length === 0) {
          toast.error('Aucun segment à exporter');
          return;
        }

        toast.loading(
          `Préparation de l'export de ${activeSegments.length} segment${
            activeSegments.length > 1 ? 's' : ''
          } pour ${formats.length} format${formats.length > 1 ? 's' : ''}...`,
          { id: 'export' }
        );

        // Étape 1 : Concaténer segments
        const segmentsResponse = await fetch('/api/editor/export-segments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaFileId: mediaFile.id,
            segments: activeSegments,
            clipName,
          }),
        });

        if (!segmentsResponse.ok) {
          const data = await segmentsResponse.json();
          throw new Error(data.error || 'Segments export failed');
        }

        const segmentsData = await segmentsResponse.json();
        clipId = segmentsData.editedClip?.id;
        mediaFileIdForTranscode = segmentsData.mediaFile?.id;

        if (!clipId) {
          throw new Error('Failed to create segments clip');
        }

        console.log(
          `[Export] Segments concatenated: ${activeSegments.length} segments → clip ${clipId}`
        );
      } else {
        // MODE LEGACY (IN/OUT)
        if (!hasMarkers) {
          toast.error('Définissez les points In et Out avant d\'exporter');
          return;
        }

        toast.loading(
          `Préparation de l'export pour ${formats.length} format${
            formats.length > 1 ? 's' : ''
          }...`,
          { id: 'export' }
        );

        // Cut the video to create the base clip
        const cutResponse = await fetch('/api/editor/cut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaFileId: mediaFile.id,
            startTime: inPoint ?? 0,
            endTime: outPoint ?? mediaFile.duration,
            clipName,
          }),
        });

        if (!cutResponse.ok) {
          const data = await cutResponse.json();
          throw new Error(data.error || 'Cut failed');
        }

        const cutData = await cutResponse.json();
        clipId = cutData.editedClip?.id;
        mediaFileIdForTranscode = cutData.mediaFile?.id;

        if (!clipId) {
          throw new Error('Failed to create clip');
        }
      }

      // Étape 2 : Mix audio
      // Use audio tracks from timeline store, or fallback to ExportModal config
      const musicTrack = audioTracks.find((t) => t.type === 'music' && t.isActive);
      const freqTrack = audioTracks.find((t) => t.type === 'frequency' && t.isActive);

      const hasTimelineAudio = musicTrack || freqTrack;
      const hasModalAudio = audioConfig && (audioConfig.frequencyId !== 'none' || audioConfig.musicId !== 'none');

      if (hasTimelineAudio || hasModalAudio) {
        toast.loading('Mixage audio en cours...', { id: 'export' });

        // Prioritize timeline tracks over modal config
        const mixPayload = hasTimelineAudio
          ? {
              mediaFileId: mediaFileIdForTranscode,
              frequencyId: freqTrack ? freqTrack.sourceId : undefined,
              musicId: musicTrack ? musicTrack.sourceId : undefined,
              frequencyVolume: freqTrack ? freqTrack.volume : undefined,
              musicVolume: musicTrack ? musicTrack.volume : undefined,
              fadeInDuration: freqTrack?.fadeIn || musicTrack?.fadeIn || 2,
              fadeOutDuration: freqTrack?.fadeOut || musicTrack?.fadeOut || 3,
            }
          : {
              mediaFileId: mediaFileIdForTranscode,
              frequencyId: audioConfig!.frequencyId !== 'none' ? audioConfig!.frequencyId : undefined,
              musicId: audioConfig!.musicId !== 'none' ? audioConfig!.musicId : undefined,
              frequencyVolume: audioConfig!.frequencyVolume,
              musicVolume: audioConfig!.musicVolume,
              fadeInDuration: audioConfig!.fadeIn,
              fadeOutDuration: audioConfig!.fadeOut,
            };

        const mixResponse = await fetch('/api/editor/mix-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mixPayload),
        });

        if (!mixResponse.ok) {
          const data = await mixResponse.json();
          throw new Error(data.error || 'Audio mix failed');
        }

        const mixData = await mixResponse.json();
        mediaFileIdForTranscode = mixData.mediaFile?.id;
        console.log(`[Export] Audio mixed → new media ${mediaFileIdForTranscode}`);
      }

      // Étape 2 : Transcode vers formats demandés
      const transcodeResponse = await fetch('/api/processing/transcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId,
          formats,
          burnSubtitles,
        }),
      });

      if (!transcodeResponse.ok) {
        const data = await transcodeResponse.json();
        throw new Error(data.error || 'Transcode failed');
      }

      const { jobIds } = await transcodeResponse.json();

      toast.success(
        `Export lancé pour ${formats.length} format${
          formats.length > 1 ? 's' : ''
        } ! Vous pouvez suivre la progression dans la bibliothèque.`,
        { id: 'export' }
      );

      // Redirect to media library after 2 seconds
      setTimeout(() => {
        router.push('/media');
      }, 2000);
    } catch (error) {
      console.error('[MultiFormatExport] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de l\'export',
        { id: 'export' }
      );
    }
  };

  // Auto-cut: Detect silence, remove blanks, create new video
  const handleAutoCut = async () => {
    setIsDetectingSilence(true);

    try {
      toast.loading('Auto-cut en cours... Detection des silences et creation de la video.', { id: 'autocut' });

      const response = await fetch('/api/editor/auto-cut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaFileId: mediaFile.id,
          minSilenceDuration: 0.8, // Silences > 0.8s
          silenceThreshold: -35, // dB (more sensitive)
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Auto-cut failed');
      }

      const data = await response.json();
      console.log('[AutoCut] Result:', data);

      if (data.noChanges) {
        toast.info(data.message || 'Peu de silence detecte, pas de modifications.', { id: 'autocut' });
        return;
      }

      if (data.success && data.newMediaFile) {
        // Replace video source with the new cut video
        setMediaFile(
          data.newMediaFile.id,
          data.newMediaFile.url,
          data.newMediaFile.duration
        );

        // Clear segments (video is already cut, no virtual segments needed)
        replaceAllSegments([{ startTime: 0, endTime: data.newMediaFile.duration }]);

        toast.success(
          `Auto-cut termine ! ${data.stats.timeSaved}s de silence supprime ` +
          `(${data.stats.silencePercentage}%). Nouvelle duree: ${Math.round(data.stats.newDuration)}s`,
          { id: 'autocut' }
        );
      }
    } catch (error) {
      console.error('[AutoCut] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de l\'auto-cut',
        { id: 'autocut' }
      );
    } finally {
      setIsDetectingSilence(false);
    }
  };

  // Generate subtitles with Groq Whisper
  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setTranscribeProgress(0);

    try {
      toast.loading('Génération des sous-titres...', { id: 'transcribe' });

      // Start transcription job
      const response = await fetch('/api/processing/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaFileId: mediaFile.id,
          provider: 'groq',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Transcription failed');
      }

      const { jobId } = await response.json();
      console.log('[Transcribe] Job created:', jobId);

      // Poll job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/processing/status/${jobId}`);
          const statusData = await statusResponse.json();

          console.log('[Transcribe] Job status:', statusData);

          if (statusData.progress !== undefined) {
            setTranscribeProgress(statusData.progress);
          }

          if (statusData.state === 'completed') {
            clearInterval(pollInterval);
            setIsTranscribing(false);
            setTranscribeProgress(100);

            // Load transcription from database
            const clipResponse = await fetch(`/api/editor/clip/${mediaFile.id}`);
            const clipData = await clipResponse.json();

            if (clipData.clip && clipData.clip.transcription) {
              console.log('📝 [EditorPageClient] Loaded transcription after job:', clipData.clip.transcription.segments?.length || 0, 'segments');
              setTranscription(clipData.clip.transcription);

              toast.success(
                `Sous-titres générés avec succès ! (${clipData.clip.transcription.segments?.length || 0} segments)`,
                { id: 'transcribe' }
              );
            } else {
              console.error('❌ [EditorPageClient] No transcription found in database after job complete');
              toast.error('Les sous-titres ont été générés mais ne peuvent pas être chargés', { id: 'transcribe' });
            }
          } else if (statusData.state === 'failed') {
            clearInterval(pollInterval);
            setIsTranscribing(false);
            throw new Error(statusData.failedReason || 'Transcription failed');
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          setIsTranscribing(false);
          console.error('[Transcribe] Poll error:', pollError);
          toast.error(
            pollError instanceof Error ? pollError.message : 'Erreur lors du polling',
            { id: 'transcribe' }
          );
        }
      }, 2000); // Poll every 2 seconds

    } catch (error) {
      console.error('[Transcribe] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la transcription',
        { id: 'transcribe' }
      );
      setIsTranscribing(false);
      setTranscribeProgress(0);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-2 border-primary/20 bg-card px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="icon"
              onClick={() => router.push('/media')}
              className="bg-primary hover:bg-primary/90 h-8 w-8"
              title="Retour à la bibliothèque"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
            <div className="flex-1">
              <input
                type="text"
                value={clipName}
                onChange={(e) => setClipName(e.target.value)}
                onBlur={() => {
                  console.log('💾 Clip name saved:', clipName);
                  // Name is saved in Zustand store
                }}
                placeholder="Nom du clip..."
                className="text-sm font-semibold bg-background text-foreground border-2 border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md px-2 py-1 w-full min-w-[300px]"
              />
              <p className="text-xs text-muted-foreground mt-0.5 px-1">
                📁 Source: <span className="font-medium">{mediaFile.filename}</span>
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {hasMarkers && (
              <div className="text-xs text-muted-foreground mr-3">
                Durée: {trimDuration.toFixed(2)}s
                {inPoint !== null && ` (${inPoint.toFixed(2)}s`}
                {outPoint !== null && ` - ${outPoint.toFixed(2)}s)`}
              </div>
            )}

            {/* Auto-cut Silences Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={isDetectingSilence || isExporting}
              onClick={handleAutoCut}
              className="h-8"
              title="Supprimer les silences et creer une nouvelle video"
            >
              {isDetectingSilence ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Auto-cut...
                </>
              ) : (
                <>
                  <Scissors className="mr-2 h-3 w-3" />
                  Auto-cut
                </>
              )}
            </Button>

            {/* Audio Config Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAudioConfigOpen(true)}
              className="h-8"
              title="Ajouter frequences et musique d'ambiance"
            >
              <Music className="mr-2 h-3 w-3" />
              Audio
            </Button>

            {/* Media Metadata Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMetadataOpen(true)}
              className="h-8"
              title="Éditer les métadonnées du média"
            >
              <FileVideo className="mr-2 h-3 w-3" />
              Métadonnées
            </Button>

            {/* Transcribe Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={isTranscribing || isExporting}
              onClick={handleTranscribe}
              className="h-8"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Transcription... {transcribeProgress}%
                </>
              ) : (
                <>
                  <Subtitles className="mr-2 h-3 w-3" />
                  Sous-titres
                </>
              )}
            </Button>

            {/* Export Button */}
            <Button
              variant="default"
              size="sm"
              disabled={!hasMarkers}
              onClick={() => setIsExportModalOpen(true)}
              className="h-8"
            >
              <Download className="mr-2 h-3 w-3" />
              Exporter
            </Button>

            {/* Theme Toggle */}
            <div className="border-l pl-2 ml-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Columns Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Video + Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
            {/* Video container with max width to respect aspect ratio */}
            <div className="w-full h-full flex items-center justify-center">
              <VideoPreview />
            </div>

            {/* Toggle Panel Button (Floating) */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border-white/20 text-white z-10"
              title={isPanelOpen ? "Masquer les sous-titres" : "Afficher les sous-titres"}
            >
              {isPanelOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Timeline - Fixed Height (3 tracks: video, music, frequency) */}
          <div className="border-t-4 border-primary bg-card p-3 flex-shrink-0 overflow-visible" style={{ height: '220px' }}>
            <Timeline />
          </div>
        </div>

        {/* Right Column: Audio + Subtitle Panels (Full Height) - Collapsible */}
        {isPanelOpen && (
          <div className="w-96 border-l flex flex-col bg-card overflow-y-auto">
            {/* Audio Track Panel */}
            <div className="border-b">
              <AudioTrackPanel />
            </div>
            {/* Subtitle Panel */}
            <div className="flex-1 min-h-0">
              <SubtitlePanel />
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        clipId={mediaFile.id}
        clipName={clipName}
        hasSubtitles={hasSubtitles}
        onExport={handleMultiFormatExport}
      />

      {/* Audio Config Modal */}
      <AudioConfigPanel
        open={isAudioConfigOpen}
        onOpenChange={setIsAudioConfigOpen}
        mediaFileId={mediaFile.id}
        mediaDuration={mediaFile.duration}
        onMixComplete={(newMediaId) => {
          console.log('[EditorPageClient] Audio mixed, new media:', newMediaId);
          toast.success('Audio mixe ! Vous pouvez maintenant exporter.');
        }}
      />

      {/* Media Metadata Modal */}
      <MediaMetadataPanel
        open={isMetadataOpen}
        onOpenChange={setIsMetadataOpen}
      />

      {/* Keyboard Shortcuts Help */}
      <div className="border-t-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 shadow-inner">
        <div className="flex items-center gap-4 flex-wrap text-xs font-medium text-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-primary text-white border border-primary rounded shadow-sm font-semibold text-xs">Space</kbd>
            <span>Play/Pause</span>
          </span>
          {isMultiSegmentMode ? (
            <>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-blue-500 text-white border border-blue-600 rounded shadow-sm font-semibold text-xs">C</kbd>
                <span>Cut (Blade)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-red-500 text-white border border-red-600 rounded shadow-sm font-semibold text-xs">Del</kbd>
                <span>Supprimer Segment</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-secondary text-secondary-foreground border border-secondary rounded shadow-sm font-semibold text-xs">Cmd+Z</kbd>
                <span>Annuler</span>
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-green-500 text-white border border-green-600 rounded shadow-sm font-semibold text-xs">I</kbd>
                <span>In Point</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-red-500 text-white border border-red-600 rounded shadow-sm font-semibold text-xs">O</kbd>
                <span>Out Point</span>
              </span>
            </>
          )}
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-secondary text-secondary-foreground border border-secondary rounded shadow-sm font-semibold text-xs">←/→</kbd>
            <span>±1s</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-secondary text-secondary-foreground border border-secondary rounded shadow-sm font-semibold text-xs">Home</kbd>
            <span>Début</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-secondary text-secondary-foreground border border-secondary rounded shadow-sm font-semibold text-xs">End</kbd>
            <span>Fin</span>
          </span>
        </div>
      </div>
    </div>
  );
}
