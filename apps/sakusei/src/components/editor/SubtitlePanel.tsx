'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Check, X, BookOpen, Wand2, Palette } from 'lucide-react';
import { DictionaryPanel } from './DictionaryPanel';
import { SubtitleStylePanel } from './SubtitleStylePanel';
import { toast } from 'sonner';
import type { DictionaryEntry } from '@/utils/dictionary';
import { applyDictionaryToTranscription } from '@/utils/dictionary';
import type { SubtitleStyle } from '@/types/subtitle';

interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export function SubtitlePanel() {
  const { transcription, setTranscription, currentTime, setCurrentTime, subtitleStyle, setSubtitleStyle } = useEditorStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);

  // Fetch dictionary on mount
  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const response = await fetch('/api/dictionary');
        const data = await response.json();
        if (data.entries) {
          setDictionary(data.entries);
        }
      } catch (error) {
        console.error('[SubtitlePanel] Failed to fetch dictionary:', error);
      }
    };
    fetchDictionary();
  }, []);

  // Apply dictionary corrections to all segments
  const handleApplyDictionary = useCallback(() => {
    if (!transcription || !transcription.segments || dictionary.length === 0) {
      toast.info('Aucune correction à appliquer');
      return;
    }

    const correctedSegments = applyDictionaryToTranscription(
      transcription.segments as SubtitleSegment[],
      dictionary
    );

    setTranscription({
      ...transcription,
      segments: correctedSegments,
    });

    toast.success(`Dictionnaire appliqué (${dictionary.length} règles)`);
  }, [transcription, dictionary, setTranscription]);

  if (!transcription || !transcription.segments || transcription.segments.length === 0) {
    return (
      <Card className="h-full p-4 flex items-center justify-center bg-card">
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">Aucun sous-titre disponible</p>
          <p className="text-xs mt-1 text-foreground/80">Cliquez sur "Sous-titres" pour générer les sous-titres automatiquement</p>
        </div>
      </Card>
    );
  }

  const segments = transcription.segments as SubtitleSegment[];

  // Find current segment based on currentTime
  const currentSegmentIndex = segments.findIndex(
    (seg) => currentTime >= seg.start && currentTime <= seg.end
  );

  const handleEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditText(text);
  };

  const handleSave = (index: number) => {
    if (!transcription) return;

    // Update segment text
    const updatedSegments = [...segments];
    updatedSegments[index] = {
      ...updatedSegments[index],
      text: editText,
    };

    // Update transcription in store
    setTranscription({
      ...transcription,
      segments: updatedSegments,
    });

    setEditingIndex(null);
    setEditText('');
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const handleSegmentClick = (start: number) => {
    setCurrentTime(start);
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col bg-card">
      {/* Header */}
      <div className="p-3 border-b-2 bg-primary/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Sous-titres ({segments.length} segments)
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStyleOpen(true)}
              className="h-7 px-2"
              title="Style des sous-titres"
            >
              <Palette className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleApplyDictionary}
              disabled={dictionary.length === 0}
              className="h-7 px-2"
              title="Appliquer les corrections du dictionnaire"
            >
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDictionaryOpen(true)}
              className="h-7 px-2"
              title="Gérer le dictionnaire"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dictionary Panel */}
      <DictionaryPanel
        open={isDictionaryOpen}
        onOpenChange={setIsDictionaryOpen}
        onDictionaryChange={setDictionary}
      />

      {/* Style Panel */}
      <SubtitleStylePanel
        open={isStyleOpen}
        onOpenChange={setIsStyleOpen}
        currentStyle={subtitleStyle}
        onStyleChange={setSubtitleStyle}
        previewText={segments[0]?.text || 'Exemple de sous-titre'}
      />

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {segments.map((segment, index) => {
          const isActive = index === currentSegmentIndex;
          const isEditing = editingIndex === index;

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => !isEditing && handleSegmentClick(segment.start)}
            >
              {/* Timestamp */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-primary">
                  {formatTime(segment.start)} → {formatTime(segment.end)}
                </span>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(index, segment.text);
                    }}
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                  >
                    <Pencil className="h-3 w-3 text-primary" />
                  </Button>
                )}
              </div>

              {/* Text */}
              {isEditing ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 text-sm text-foreground font-semibold bg-background border-2 border-primary rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSave(index)}
                      className="h-7"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Enregistrer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="h-7"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground font-semibold leading-relaxed">
                  {segment.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
