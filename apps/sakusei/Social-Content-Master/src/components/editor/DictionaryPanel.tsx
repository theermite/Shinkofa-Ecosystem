'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, Download, Upload, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DictionaryEntry } from '@/utils/dictionary';
import { exportDictionaryToJson, parseDictionaryJson } from '@/utils/dictionary';

interface DictionaryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDictionaryChange?: (dictionary: DictionaryEntry[]) => void;
}

export function DictionaryPanel({
  open,
  onOpenChange,
  onDictionaryChange,
}: DictionaryPanelProps) {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [newCaseSensitive, setNewCaseSensitive] = useState(false);

  // Fetch dictionary entries
  const fetchDictionary = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dictionary');
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
        onDictionaryChange?.(data.entries);
      }
    } catch (error) {
      console.error('[DictionaryPanel] Fetch error:', error);
      toast.error('Erreur lors du chargement du dictionnaire');
    } finally {
      setIsLoading(false);
    }
  }, [onDictionaryChange]);

  useEffect(() => {
    if (open) {
      fetchDictionary();
    }
  }, [open, fetchDictionary]);

  // Add new entry
  const handleAdd = async () => {
    if (!newTerm.trim() || !newReplacement.trim()) {
      toast.error('Veuillez remplir les deux champs');
      return;
    }

    try {
      const response = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm.trim(),
          replacement: newReplacement.trim(),
          caseSensitive: newCaseSensitive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout');
      }

      const data = await response.json();
      const updatedEntries = [...entries, data.entry].sort((a, b) =>
        a.term.localeCompare(b.term)
      );
      setEntries(updatedEntries);
      onDictionaryChange?.(updatedEntries);

      // Reset form
      setNewTerm('');
      setNewReplacement('');
      setNewCaseSensitive(false);

      toast.success('Terme ajouté au dictionnaire');
    } catch (error) {
      console.error('[DictionaryPanel] Add error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout');
    }
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/dictionary?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      const updatedEntries = entries.filter((e) => e.id !== id);
      setEntries(updatedEntries);
      onDictionaryChange?.(updatedEntries);

      toast.success('Terme supprimé');
    } catch (error) {
      console.error('[DictionaryPanel] Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Export dictionary
  const handleExport = () => {
    const json = exportDictionaryToJson(entries);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionnaire-transcription.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dictionnaire exporté');
  };

  // Import dictionary
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedEntries = parseDictionaryJson(text);

        // Add each entry
        let added = 0;
        let skipped = 0;

        for (const entry of importedEntries) {
          try {
            const response = await fetch('/api/dictionary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            });

            if (response.ok) {
              added++;
            } else {
              skipped++;
            }
          } catch {
            skipped++;
          }
        }

        await fetchDictionary();
        toast.success(`Import terminé: ${added} ajoutés, ${skipped} ignorés`);
      } catch (error) {
        console.error('[DictionaryPanel] Import error:', error);
        toast.error('Erreur lors de l\'import');
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Dictionnaire de Transcription
          </DialogTitle>
          <DialogDescription>
            Définissez des corrections automatiques pour les termes mal transcrits.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Add new entry form */}
          <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
            <Label className="text-sm font-semibold">Ajouter une correction</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Terme incorrect</Label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="ex: l'ermitte"
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Correction</Label>
                <input
                  type="text"
                  value={newReplacement}
                  onChange={(e) => setNewReplacement(e.target.value)}
                  placeholder="ex: l'Ermite"
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="caseSensitive"
                  checked={newCaseSensitive}
                  onCheckedChange={(checked) => setNewCaseSensitive(checked as boolean)}
                />
                <Label htmlFor="caseSensitive" className="text-xs cursor-pointer">
                  Respecter la casse
                </Label>
              </div>
              <Button size="sm" onClick={handleAdd} disabled={!newTerm || !newReplacement}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Entries list */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Aucun terme dans le dictionnaire
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Terme</th>
                    <th className="text-left px-4 py-2 font-semibold">Correction</th>
                    <th className="text-center px-4 py-2 font-semibold w-20">Casse</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-2 font-mono text-red-600">{entry.term}</td>
                      <td className="px-4 py-2 font-mono text-green-600">{entry.replacement}</td>
                      <td className="px-4 py-2 text-center">
                        {entry.caseSensitive ? '✓' : '-'}
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-1" />
              Importer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={entries.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
          </div>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
