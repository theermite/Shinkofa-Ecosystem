'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Music, Waves, Plus, Trash2, Volume2 } from 'lucide-react';
import { FREQUENCY_OPTIONS, MUSIC_LIBRARY } from '@/constants/audio';
import type { AudioTrack } from '@/types/timeline';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function AudioTrackPanel() {
  const { audioTracks, addAudioTrack, removeAudioTrack, setAudioTrackVolume, duration } =
    useEditorStore();

  const [selectedMusic, setSelectedMusic] = useState<string>('none');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('none');
  const [musicVolume, setMusicVolume] = useState(10);
  const [frequencyVolume, setFrequencyVolume] = useState(6);

  const musicTrack = audioTracks.find((t) => t.type === 'music');
  const frequencyTrack = audioTracks.find((t) => t.type === 'frequency');

  const handleAddMusic = () => {
    if (selectedMusic === 'none') return;

    const music = MUSIC_LIBRARY.find((m) => m.id === selectedMusic);
    if (!music) return;

    const track: AudioTrack = {
      id: generateUUID(),
      type: 'music',
      sourceId: music.id,
      name: music.name,
      volume: musicVolume / 100,
      fadeIn: 2,
      fadeOut: 3,
      url: music.url,
      isActive: true,
    };

    addAudioTrack(track);
  };

  const handleAddFrequency = () => {
    if (selectedFrequency === 'none') return;

    const freq = FREQUENCY_OPTIONS.find((f) => String(f.value) === selectedFrequency);
    if (!freq) return;

    const track: AudioTrack = {
      id: generateUUID(),
      type: 'frequency',
      sourceId: String(freq.value),
      name: freq.name,
      volume: frequencyVolume / 100,
      fadeIn: 2,
      fadeOut: 3,
      url: null, // Generated client-side
      isActive: true,
    };

    addAudioTrack(track);
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Music className="h-5 w-5 text-purple-500" />
        <h3 className="font-bold text-sm">Pistes Audio</h3>
      </div>

      {/* Music Track */}
      <div className="space-y-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-purple-500" />
            <Label className="text-xs font-semibold">Piste 2: Musique</Label>
          </div>
          {musicTrack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAudioTrack(musicTrack.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {musicTrack ? (
          <div className="space-y-2">
            <p className="text-xs text-purple-300 font-medium">{musicTrack.name}</p>
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 text-purple-400" />
              <Slider
                value={[musicTrack.volume * 100]}
                onValueChange={([v]) => setAudioTrackVolume(musicTrack.id, v / 100)}
                min={1}
                max={30}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-purple-300 w-8">
                {Math.round(musicTrack.volume * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Select value={selectedMusic} onValueChange={setSelectedMusic}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choisir une musique" />
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
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">{musicVolume}%</span>
                  <Slider
                    value={[musicVolume]}
                    onValueChange={([v]) => setMusicVolume(v)}
                    min={1}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddMusic}
                  className="w-full h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter a la timeline
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Frequency Track */}
      <div className="space-y-2 p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-teal-500" />
            <Label className="text-xs font-semibold">Piste 3: Frequence</Label>
          </div>
          {frequencyTrack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAudioTrack(frequencyTrack.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {frequencyTrack ? (
          <div className="space-y-2">
            <p className="text-xs text-teal-300 font-medium">{frequencyTrack.name}</p>
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 text-teal-400" />
              <Slider
                value={[frequencyTrack.volume * 100]}
                onValueChange={([v]) => setAudioTrackVolume(frequencyTrack.id, v / 100)}
                min={1}
                max={15}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-teal-300 w-8">
                {Math.round(frequencyTrack.volume * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Niveau subliminal (4-8% recommande)</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choisir une frequence" />
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
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">{frequencyVolume}%</span>
                  <Slider
                    value={[frequencyVolume]}
                    onValueChange={([v]) => setFrequencyVolume(v)}
                    min={1}
                    max={15}
                    step={1}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">Niveau subliminal recommande: 4-8%</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddFrequency}
                  className="w-full h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter a la timeline
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      {(musicTrack || frequencyTrack) && (
        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30">
          <p className="text-xs text-blue-300">
            Les pistes audio seront mixees lors de l'export final.
          </p>
        </div>
      )}
    </div>
  );
}
