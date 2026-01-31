'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FTPTransferButton } from './FTPTransferButton';
import { MediaPlayer } from './MediaPlayer';
import { formatBytes } from '@/lib/utils';
import { Play, ExternalLink, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: bigint;
  duration: number | null;
  width: number | null;
  height: number | null;
  vpsPath: string | null;
  cdnUrl: string | null;
  thumbnailUrl: string | null;
  folder: string;
  status: string;
  ftpStatus: string;
  createdAt: Date;
}

interface MediaGridProps {
  files: MediaFile[];
}

export function MediaGrid({ files }: MediaGridProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (fileId: string, filename: string) => {
    setDeletingId(fileId);

    try {
      toast.loading(`Suppression de ${filename}...`, { id: 'delete' });

      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }

      toast.success('Fichier supprimé avec succès', { id: 'delete' });

      // Refresh page to update grid
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[Delete] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la suppression',
        { id: 'delete' }
      );
      setDeletingId(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">
          Aucun fichier trouvé
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Essayez de modifier les filtres ou uploadez de nouveaux fichiers
        </p>
      </div>
    );
  }

  // Get media URL for playback
  const getMediaUrl = (file: MediaFile) => {
    if (file.cdnUrl) return file.cdnUrl;
    // Use streaming API for VPS files
    if (file.vpsPath) return `/api/media/${file.id}/stream`;
    return null;
  };

  const isMediaPlayable = (file: MediaFile) => {
    return (
      file.mimeType.startsWith('video/') ||
      file.mimeType.startsWith('audio/')
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => {
          const mediaUrl = getMediaUrl(file);
          const playable = isMediaPlayable(file);

          return (
            <Card key={file.id} className="overflow-hidden flex flex-col">
              <CardHeader className="p-4">
                <CardTitle className="text-base truncate">{file.filename}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {file.status}
                  </span>
                  {file.ftpStatus === 'COMPLETED' && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      CDN
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col">
                {/* File Info */}
                <div className="text-sm space-y-1 flex-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{file.mimeType.split('/')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taille:</span>
                    <span className="font-medium">{formatBytes(Number(file.fileSize))}</span>
                  </div>
                  {file.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée:</span>
                      <span className="font-medium">{Math.round(file.duration)}s</span>
                    </div>
                  )}
                  {file.width && file.height && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Résolution:</span>
                      <span className="font-medium">{file.width}x{file.height}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dossier:</span>
                    <span className="font-medium">{file.folder.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t pt-3">
                  {/* FTP Transfer Button */}
                  <FTPTransferButton
                    mediaFileId={file.id}
                    currentFtpStatus={file.ftpStatus as 'PENDING' | 'TRANSFERRING' | 'COMPLETED' | 'FAILED'}
                    cdnUrl={file.cdnUrl}
                    onTransferComplete={() => window.location.reload()}
                    size="sm"
                  />

                  {/* Play/View Buttons */}
                  <div className="flex gap-2">
                    {playable && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 font-semibold"
                          onClick={() => router.push(`/editor/${file.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
                          Éditer
                        </Button>
                        {mediaUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFile(file)}
                            title="Lire la vidéo"
                          >
                            <Play className="h-5 w-5" />
                          </Button>
                        )}
                      </>
                    )}
                    {file.cdnUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.cdnUrl!, '_blank')}
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    )}

                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild suppressHydrationWarning>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === file.id}
                          className="border-destructive/40 hover:bg-destructive"
                          title="Supprimer"
                          suppressHydrationWarning
                        >
                          {deletingId === file.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5 text-destructive hover:text-white" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le fichier ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer <strong>{file.filename}</strong> ?
                            Cette action est irréversible et supprimera également tous les clips édités associés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(file.id, file.filename)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Media Player Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between text-white">
              <h3 className="text-lg font-medium">{selectedFile.filename}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="text-white hover:bg-white/20"
              >
                Fermer
              </Button>
            </div>
            <MediaPlayer
              src={getMediaUrl(selectedFile)!}
              type={selectedFile.mimeType.startsWith('video/') ? 'video' : 'audio'}
              poster={selectedFile.thumbnailUrl || undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}
