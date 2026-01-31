'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, Music, Waves } from 'lucide-react';
import { FREQUENCY_OPTIONS, MUSIC_LIBRARY } from '@/constants/audio';

export interface ExportFormat {
  id: string;
  name: string;
  resolution: string;
  aspectRatio: string;
  width: number;
  height: number;
  description: string;
  icon: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    resolution: '1080x1920',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Format vertical pour TikTok, Reels',
    icon: '📱',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    resolution: '1920x1080',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    description: 'Format paysage Full HD',
    icon: '🎬',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    resolution: '1920x1080',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    description: 'Format paysage pour LinkedIn',
    icon: '💼',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    resolution: '1080x1080',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    description: 'Format carré pour Instagram Feed',
    icon: '📷',
  },
];

export interface AudioExportConfig {
  frequencyId: string;
  musicId: string;
  frequencyVolume: number;
  musicVolume: number;
  fadeIn: number;
  fadeOut: number;
}

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clipId: string;
  clipName: string;
  hasSubtitles: boolean;
  onExport: (formats: string[], burnSubtitles: boolean, audioConfig?: AudioExportConfig) => Promise<void>;
}

export function ExportModal({
  open,
  onOpenChange,
  clipId,
  clipName,
  hasSubtitles,
  onExport,
}: ExportModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['tiktok']);
  const [burnSubtitles, setBurnSubtitles] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Audio config
  const [selectedFrequency, setSelectedFrequency] = useState<string>('none');
  const [selectedMusic, setSelectedMusic] = useState<string>('none');
  const [frequencyVolume, setFrequencyVolume] = useState(6); // 6%
  const [musicVolume, setMusicVolume] = useState(10); // 10%

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats((prev) =>
      prev.includes(formatId)
        ? prev.filter((id) => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0) return;

    setIsExporting(true);
    try {
      // Build audio config if any audio options selected
      const hasAudioConfig = selectedFrequency !== 'none' || selectedMusic !== 'none';
      const audioConfig: AudioExportConfig | undefined = hasAudioConfig
        ? {
            frequencyId: selectedFrequency,
            musicId: selectedMusic,
            frequencyVolume: frequencyVolume / 100,
            musicVolume: musicVolume / 100,
            fadeIn: 2,
            fadeOut: 3,
          }
        : undefined;

      await onExport(selectedFormats, burnSubtitles && hasSubtitles, audioConfig);
      onOpenChange(false);
    } catch (error) {
      console.error('[ExportModal] Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Exporter : {clipName}
          </DialogTitle>
          <DialogDescription className="text-foreground/90 font-medium">
            Sélectionnez les formats d'export pour votre vidéo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-foreground">
              Formats d'export ({selectedFormats.length} sélectionné{selectedFormats.length > 1 ? 's' : ''})
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((format) => {
                const isSelected = selectedFormats.includes(format.id);
                return (
                  <div
                    key={format.id}
                    onClick={() => handleFormatToggle(format.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all bg-background ${
                      isSelected
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleFormatToggle(format.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{format.icon}</span>
                          <h4 className="font-bold text-foreground">{format.name}</h4>
                        </div>
                        <p className="text-xs font-semibold text-blue-600">
                          {format.resolution} ({format.aspectRatio})
                        </p>
                        <p className="text-xs text-foreground/80 font-medium mt-1">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Options */}
          <div className="space-y-4 p-4 rounded-lg border-2 border-gray-300 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Music className="h-4 w-4 text-purple-600" />
              <Label className="font-bold text-foreground text-sm">Audio (Optionnel)</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Frequency */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Waves className="h-3 w-3 text-purple-500" />
                  <Label className="text-xs font-semibold text-foreground">Frequence</Label>
                </div>
                <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <SelectItem key={String(freq.value)} value={String(freq.value)}>
                        {freq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFrequency !== 'none' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">{frequencyVolume}%</span>
                    <Slider
                      value={[frequencyVolume]}
                      onValueChange={([v]) => setFrequencyVolume(v)}
                      min={1}
                      max={15}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>

              {/* Music */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Music className="h-3 w-3 text-blue-500" />
                  <Label className="text-xs font-semibold text-foreground">Musique</Label>
                </div>
                <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSIC_LIBRARY.map((music) => (
                      <SelectItem key={music.id} value={music.id}>
                        {music.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMusic !== 'none' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">{musicVolume}%</span>
                    <Slider
                      value={[musicVolume]}
                      onValueChange={([v]) => setMusicVolume(v)}
                      min={1}
                      max={25}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Les frequences sont au niveau subliminal (recommande: 4-8%)
            </p>
          </div>

          {/* Subtitle Burn-in Option */}
          {hasSubtitles && (
            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-300 bg-gray-50">
              <Checkbox
                id="burn-subtitles"
                checked={burnSubtitles}
                onCheckedChange={(checked) => setBurnSubtitles(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="burn-subtitles"
                  className="font-bold text-foreground cursor-pointer text-sm"
                >
                  Incruster les sous-titres
                </Label>
                <p className="text-xs text-foreground/80 font-medium mt-1">
                  Les sous-titres seront gravés directement dans la vidéo (recommandé pour les réseaux sociaux)
                </p>
              </div>
            </div>
          )}

          {/* Export Summary */}
          {selectedFormats.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-200">
              <p className="text-sm font-bold text-foreground">
                📦 {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''} sera{selectedFormats.length > 1 ? 'ont' : ''} généré{selectedFormats.length > 1 ? 's' : ''}
                {hasSubtitles && burnSubtitles && ' avec sous-titres incrustés'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleExport}
            disabled={selectedFormats.length === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
