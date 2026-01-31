import db from '@/lib/db';
import { MediaPageClient } from '@/components/media/MediaPageClient';

async function getMediaFiles() {
  const files = await db.mediaFile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to 50 most recent files
  });

  return files;
}

export default async function MediaPage() {
  const files = await getMediaFiles();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Bibliothèque Média</h1>
        <p className="text-muted-foreground">
          Gérez vos fichiers audio, vidéo et images
        </p>
      </div>

      <MediaPageClient initialFiles={files} />
    </div>
  );
}
