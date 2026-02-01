'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Music, Waves, Volume2, Loader2, Upload, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import {
  FREQUENCY_OPTIONS,
  MUSIC_LIBRARY,
  DEFAULT_AUDIO_CONFIG,
} from '@/constants/audio';
import { audioService } from '@/services/audio/audioService';

interface AudioConfigPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaFileId: string;
  mediaDuration: number;
  onMixComplete?: (mediaFileId: string) => void;
}

export function AudioConfigPanel({
  open,
  onOpenChange,
  mediaFileId,
  mediaDuration: _mediaDuration,
  onMixComplete,
}: AudioConfigPanelProps) {
  // State
  const [selectedFrequency, setSelectedFrequency] = useState<string>('none');
  const [selectedMusic, setSelectedMusic] = useState<string>('none');
  const [frequencyVolume, setFrequencyVolume] = useState(DEFAULT_AUDIO_CONFIG.frequencyVolume * 100);
  const [musicVolume, setMusicVolume] = useState(DEFAULT_AUDIO_CONFIG.musicVolume * 100);
  const [videoVolume, setVideoVolume] = useState(100);
  const [fadeIn, setFadeIn] = useState(DEFAULT_AUDIO_CONFIG.fadeInDuration);
  const [fadeOut, setFadeOut] = useState(DEFAULT_AUDIO_CONFIG.fadeOutDuration);
  const [customMusicFile, setCustomMusicFile] = useState<File | null>(null);
  const [isMixing, setIsMixing] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Get selected options
  const frequencyOption = FREQUENCY_OPTIONS.find((f) => String(f.value) === selectedFrequency);
  const _musicOption = MUSIC_LIBRARY.find((m) => m.id === selectedMusic);

  // Preview frequency
  const handlePreviewFrequency = () => {
    if (isPreviewPlaying) {
      audioService.stopAudio();
      setIsPreviewPlaying(false);
      return;
    }

    if (!frequencyOption || frequencyOption.type === null) {
      return;
    }

    const buffer = audioService.generateFromOption(frequencyOption, 5); // 5 second preview
    if (buffer) {
      audioService.playWithFade(buffer, frequencyVolume / 100, 0.5, 0.5, 5);
      setIsPreviewPlaying(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        setIsPreviewPlaying(false);
      }, 5000);
    }
  };

  // Stop preview when closing
  useEffect(() => {
    if (!open) {
      audioService.stopAudio();
      setIsPreviewPlaying(false);
    }
  }, [open]);

  // Handle mix
  const handleMix = async () => {
    if (selectedFrequency === 'none' && selectedMusic === 'none' && videoVolume === 100) {
      toast.error('Selectionnez une frequence ou une musique, ou ajustez le volume');
      return;
    }

    setIsMixing(true);

    try {
      toast.loading('Mixage audio en cours...', { id: 'mix-audio' });

      const response = await fetch('/api/editor/mix-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaFileId,
          frequencyId: selectedFrequency !== 'none' ? selectedFrequency : undefined,
          musicId: selectedMusic !== 'none' ? selectedMusic : undefined,
          videoVolume: videoVolume / 100,
          frequencyVolume: frequencyVolume / 100,
          musicVolume: musicVolume / 100,
          fadeInDuration: fadeIn,
          fadeOutDuration: fadeOut,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Mixage echoue');
      }

      const data = await response.json();

      toast.success('Audio mixe avec succes !', { id: 'mix-audio' });

      if (onMixComplete) {
        onMixComplete(data.mediaFile.id);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('[AudioConfigPanel] Mix error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors du mixage',
        { id: 'mix-audio' }
      );
    } finally {
      setIsMixing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            Configuration Audio
          </DialogTitle>
          <DialogDescription>
            Ajoutez des frequences therapeutiques et/ou une musique d&apos;ambiance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequencies */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-purple-500" />
              <h3 className="font-semibold">Frequences Therapeutiques</h3>
              <span className="text-xs text-muted-foreground">(Niveau subliminal)</span>
            </div>

            <div className="space-y-3">
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une frequence" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <SelectItem key={String(freq.value)} value={String(freq.value)}>
                      <div className="flex flex-col">
                        <span>{freq.name}</span>
                        <span className="text-xs text-muted-foreground">{freq.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFrequency !== 'none' && (
                <>
                  <div className="flex items-center gap-4">
                    <Label className="w-32 text-sm">Volume: {frequencyVolume}%</Label>
                    <Slider
                      value={[frequencyVolume]}
                      onValueChange={([v]) => setFrequencyVolume(v)}
                      min={1}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewFrequency}
                      className="w-24"
                    >
                      {isPreviewPlaying ? (
                        <>
                          <Square className="h-3 w-3 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommande: 4-8% pour un effet subliminal. Maximum 20%.
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Background Music */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">Musique d&apos;Ambiance</h3>
            </div>

            <div className="space-y-3">
              <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une musique" />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_LIBRARY.map((music) => (
                    <SelectItem key={music.id} value={music.id}>
                      <div className="flex items-center gap-2">
                        <span>{music.name}</span>
                        {music.category && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted">
                            {music.category}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Custom music upload */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('custom-music-upload')?.click()}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload personnalise
                </Button>
                <input
                  id="custom-music-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCustomMusicFile(file);
                      setSelectedMusic('custom');
                      toast.success(`Fichier selectionne: ${file.name}`);
                    }
                  }}
                />
                {customMusicFile && (
                  <span className="text-xs text-muted-foreground">
                    {customMusicFile.name}
                  </span>
                )}
              </div>

              {selectedMusic !== 'none' && (
                <div className="flex items-center gap-4">
                  <Label className="w-32 text-sm">Volume: {musicVolume}%</Label>
                  <Slider
                    value={[musicVolume]}
                    onValueChange={([v]) => setMusicVolume(v)}
                    min={1}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Video Volume */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold">Volume Video Original</h3>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-32 text-sm">Volume: {videoVolume}%</Label>
              <Slider
                value={[videoVolume]}
                onValueChange={([v]) => setVideoVolume(v)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
            </div>
          </Card>

          {/* Fade Settings */}
          {(selectedFrequency !== 'none' || selectedMusic !== 'none') && (
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Fades</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Fade In: {fadeIn}s</Label>
                  <Slider
                    value={[fadeIn]}
                    onValueChange={([v]) => setFadeIn(v)}
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Fade Out: {fadeOut}s</Label>
                  <Slider
                    value={[fadeOut]}
                    onValueChange={([v]) => setFadeOut(v)}
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMixing}>
            Annuler
          </Button>
          <Button onClick={handleMix} disabled={isMixing}>
            {isMixing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mixage...
              </>
            ) : (
              'Appliquer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
