'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Palette, Type, AlignCenter, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  SubtitleStyle,
  DEFAULT_SUBTITLE_STYLE,
  SUBTITLE_PRESETS,
  FONT_OPTIONS,
} from '@/types/subtitle';

interface SubtitleStylePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: SubtitleStyle | null;
  onStyleChange: (style: SubtitleStyle) => void;
  previewText?: string;
}

export function SubtitleStylePanel({
  open,
  onOpenChange,
  currentStyle,
  onStyleChange,
  previewText = 'Exemple de sous-titre',
}: SubtitleStylePanelProps) {
  const [style, setStyle] = useState<SubtitleStyle>(
    currentStyle || DEFAULT_SUBTITLE_STYLE
  );

  useEffect(() => {
    if (currentStyle) {
      setStyle(currentStyle);
    }
  }, [currentStyle]);

  const updateStyle = (updates: Partial<SubtitleStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }));
  };

  const applyPreset = (presetKey: string) => {
    const preset = SUBTITLE_PRESETS[presetKey];
    if (preset) {
      setStyle({ ...DEFAULT_SUBTITLE_STYLE, ...preset.style });
      toast.success(`Preset "${preset.name}" appliqué`);
    }
  };

  const handleSave = () => {
    onStyleChange(style);
    onOpenChange(false);
    toast.success('Style sauvegardé');
  };

  // Generate preview style
  const previewStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: style.textColor,
    backgroundColor: style.backgroundColor,
    padding: '8px 16px',
    borderRadius: '4px',
    textAlign: 'center',
    textShadow:
      style.strokeWidth > 0
        ? `
      -${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
      ${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
      -${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor},
      ${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor}
    `
        : 'none',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style des Sous-titres
          </DialogTitle>
          <DialogDescription>
            Personnalisez l'apparence des sous-titres sur la vidéo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="p-6 bg-gray-900 rounded-lg flex items-center justify-center min-h-[100px]">
            <div style={previewStyle}>{previewText}</div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Presets</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SUBTITLE_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(key)}
                  className="h-8"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-1">
                <Type className="h-3.5 w-3.5" />
                Police
              </Label>
              <Select
                value={style.fontFamily}
                onValueChange={(value) => updateStyle({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Épaisseur</Label>
              <Select
                value={style.fontWeight}
                onValueChange={(value) =>
                  updateStyle({ fontWeight: value as SubtitleStyle['fontWeight'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="bolder">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-semibold">Taille</Label>
              <span className="text-sm text-muted-foreground">{style.fontSize}px</span>
            </div>
            <Slider
              value={[style.fontSize]}
              onValueChange={([value]) => updateStyle({ fontSize: value })}
              min={14}
              max={48}
              step={1}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Couleur texte</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.textColor}
                  onChange={(e) => updateStyle({ textColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={style.textColor}
                  onChange={(e) => updateStyle({ textColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Couleur fond</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.backgroundColor.startsWith('rgba') ? '#000000' : style.backgroundColor}
                  onChange={(e) => {
                    // Convert hex to rgba with opacity
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    updateStyle({ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.75)` });
                  }}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Select
                  value={style.backgroundColor === 'transparent' ? 'transparent' : 'solid'}
                  onValueChange={(value) =>
                    updateStyle({
                      backgroundColor: value === 'transparent' ? 'transparent' : 'rgba(0, 0, 0, 0.75)',
                    })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Avec fond</SelectItem>
                    <SelectItem value="transparent">Transparent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stroke */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Contour</Label>
                <span className="text-sm text-muted-foreground">{style.strokeWidth}px</span>
              </div>
              <Slider
                value={[style.strokeWidth]}
                onValueChange={([value]) => updateStyle({ strokeWidth: value })}
                min={0}
                max={6}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Couleur contour</Label>
              <input
                type="color"
                value={style.strokeColor}
                onChange={(e) => updateStyle({ strokeColor: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
                disabled={style.strokeWidth === 0}
              />
            </div>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-1">
              <AlignCenter className="h-3.5 w-3.5" />
              Position
            </Label>
            <div className="flex gap-2">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <Button
                  key={pos}
                  variant={style.position === pos ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateStyle({ position: pos })}
                  className="flex-1"
                >
                  {pos === 'top' ? 'Haut' : pos === 'center' ? 'Centre' : 'Bas'}
                </Button>
              ))}
            </div>
          </div>

          {/* Margin (only for bottom position) */}
          {style.position === 'bottom' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Marge du bas</Label>
                <span className="text-sm text-muted-foreground">{style.marginBottom}px</span>
              </div>
              <Slider
                value={[style.marginBottom]}
                onValueChange={([value]) => updateStyle({ marginBottom: value })}
                min={20}
                max={200}
                step={10}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
