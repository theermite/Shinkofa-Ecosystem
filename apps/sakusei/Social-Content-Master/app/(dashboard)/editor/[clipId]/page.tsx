import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { EditorPageClient } from '@/components/editor/EditorPageClient';

type Params = Promise<{ clipId: string }>;

async function getMediaFile(id: string) {
  const mediaFile = await db.mediaFile.findUnique({
    where: { id },
  });

  return mediaFile;
}

export default async function EditorPage({ params }: { params: Params }) {
  const { clipId } = await params;

  const mediaFile = await getMediaFile(clipId);

  if (!mediaFile) {
    notFound();
  }

  // Get media URL for playback
  const mediaUrl = mediaFile.cdnUrl || (mediaFile.vpsPath ? `/api/media/${mediaFile.id}/stream` : null);

  if (!mediaUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Fichier non disponible</h1>
          <p className="text-muted-foreground">
            Ce fichier n'a pas encore été uploadé ou transféré.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditorPageClient
      mediaFile={{
        id: mediaFile.id,
        filename: mediaFile.filename,
        mimeType: mediaFile.mimeType,
        duration: mediaFile.duration || 0,
        url: mediaUrl,
      }}
    />
  );
}
