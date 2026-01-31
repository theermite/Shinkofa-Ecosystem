'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileVideo,
  Save,
  X,
  Plus,
  Clock,
  HardDrive,
  Monitor,
  Film,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MediaMetadata,
  DEFAULT_MEDIA_METADATA,
  formatFileSize,
  formatDuration,
  formatBitrate,
  formatResolution,
} from '@/types/media';

interface MediaMetadataPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaMetadataPanel({ open, onOpenChange }: MediaMetadataPanelProps) {
  const { mediaMetadata, setMediaMetadata, sourceUrl, duration } = useEditorStore();

  const [metadata, setMetadata] = useState<MediaMetadata>(
    mediaMetadata || DEFAULT_MEDIA_METADATA
  );
  const [newTag, setNewTag] = useState('');

  // Sync with store when opening
  useEffect(() => {
    if (open && mediaMetadata) {
      setMetadata(mediaMetadata);
    }
  }, [open, mediaMetadata]);

  // Update duration from store
  useEffect(() => {
    if (duration > 0 && metadata.duration !== duration) {
      setMetadata((prev) => ({ ...prev, duration }));
    }
  }, [duration]);

  const updateField = <K extends keyof MediaMetadata>(
    field: K,
    value: MediaMetadata[K]
  ) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag) return;

    if (metadata.tags.includes(tag)) {
      toast.warning('Ce tag existe déjà');
      return;
    }

    if (metadata.tags.length >= 20) {
      toast.warning('Maximum 20 tags');
      return;
    }

    setMetadata((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    setMediaMetadata(metadata);
    onOpenChange(false);
    toast.success('Métadonnées sauvegardées');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Métadonnées du Média
          </DialogTitle>
          <DialogDescription>
            Éditez les informations associées à votre vidéo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Technical Info (Read-only) */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Film className="h-4 w-4" />
              Informations Techniques
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Durée:</span>
                <span className="font-medium">{formatDuration(metadata.duration)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Résolution:</span>
                <span className="font-medium">
                  {formatResolution(metadata.width, metadata.height)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Taille:</span>
                <span className="font-medium">{formatFileSize(metadata.fileSize)}</span>
              </div>

              {metadata.bitrate > 0 && (
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Bitrate:</span>
                  <span className="font-medium">{formatBitrate(metadata.bitrate)}</span>
                </div>
              )}

              {metadata.frameRate > 0 && (
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">FPS:</span>
                  <span className="font-medium">{metadata.frameRate}</span>
                </div>
              )}

              {metadata.codec && (
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Codec:</span>
                  <span className="font-medium">{metadata.codec}</span>
                </div>
              )}
            </div>

            {metadata.fileName && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Fichier: {metadata.fileName}
              </div>
            )}
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Titre
              </Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Titre de la vidéo"
                maxLength={100}
              />
              <span className="text-xs text-muted-foreground">
                {metadata.title.length}/100 caractères
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Description de la vidéo..."
                rows={4}
                maxLength={5000}
              />
              <span className="text-xs text-muted-foreground">
                {metadata.description.length}/5000 caractères
              </span>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-semibold">
                Auteur
              </Label>
              <Input
                id="author"
                value={metadata.author}
                onChange={(e) => updateField('author', e.target.value)}
                placeholder="Nom de l'auteur"
                maxLength={50}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags ({metadata.tags.length}/20)
              </Label>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ajouter un tag..."
                  maxLength={30}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {metadata.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Recorded Date */}
            <div className="space-y-2">
              <Label htmlFor="recordedAt" className="text-sm font-semibold">
                Date d'enregistrement
              </Label>
              <Input
                id="recordedAt"
                type="date"
                value={
                  metadata.recordedAt
                    ? new Date(metadata.recordedAt).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  updateField(
                    'recordedAt',
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
