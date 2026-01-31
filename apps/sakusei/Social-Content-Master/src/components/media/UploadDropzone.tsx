'use client';

import { useState, useCallback } from 'react';
import { Upload, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUpload } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onUploadComplete?: (fileId: string) => void;
  userId?: string;
}

export function UploadDropzone({ onUploadComplete, userId }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { upload, uploading, progress, error, reset } = useUpload();

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0]; // Single file upload for now

      const result = await upload(file, userId);
      if (result.success && result.file) {
        onUploadComplete?.(result.file.id);
      }
    },
    [upload, userId, onUploadComplete]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const result = await upload(file, userId);
      if (result.success && result.file) {
        onUploadComplete?.(result.file.id);
      }
    },
    [upload, userId, onUploadComplete]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 bg-muted/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {!uploading && !error && progress === 0 && (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Glissez-déposez votre fichier
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground">
                Formats: MP4, MOV, AVI, WebM, MP3, WAV, M4A (Max 2GB)
              </p>
              <input
                type="file"
                onChange={handleFileInput}
                accept="video/*,audio/*,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
            </>
          )}

          {uploading && (
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
                <p className="text-lg font-medium">Upload en cours...</p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {progress}%
              </p>
            </div>
          )}

          {!uploading && progress === 100 && !error && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold text-green-600">
                Upload réussi !
              </p>
              <button
                onClick={() => {
                  reset();
                }}
                className="text-sm text-primary hover:underline mt-2"
              >
                Uploader un autre fichier
              </button>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg font-semibold text-red-600">
                Erreur d'upload
              </p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => {
                  reset();
                }}
                className="text-sm text-primary hover:underline mt-2"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
