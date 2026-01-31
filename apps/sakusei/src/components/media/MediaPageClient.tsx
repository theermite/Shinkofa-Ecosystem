'use client';

import { useState, useMemo } from 'react';
import { UploadDropzone } from './UploadDropzone';
import { MediaGrid } from './MediaGrid';
import { MediaFilters, MediaFilterValues } from './MediaFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  tags: string[];
  createdAt: Date;
}

interface MediaPageClientProps {
  initialFiles: MediaFile[];
}

export function MediaPageClient({ initialFiles }: MediaPageClientProps) {
  const [filters, setFilters] = useState<MediaFilterValues>({
    folder: 'all',
    status: 'all',
    ftpStatus: 'all',
    tags: [],
    search: '',
  });

  // Get unique tags from all files
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialFiles.forEach((file) => {
      file.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [initialFiles]);

  // Apply filters
  const filteredFiles = useMemo(() => {
    return initialFiles.filter((file) => {
      // Search filter
      if (filters.search && !file.filename.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Folder filter
      if (filters.folder !== 'all' && file.folder !== filters.folder) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && file.status !== filters.status) {
        return false;
      }

      // FTP Status filter
      if (filters.ftpStatus !== 'all' && file.ftpStatus !== filters.ftpStatus) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((tag) => file.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [initialFiles, filters]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Fichier</CardTitle>
          <CardDescription>
            Glissez-déposez ou cliquez pour sélectionner un fichier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadDropzone
            onUploadComplete={(fileId) => {
              // Refresh page to show new file
              window.location.reload();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bibliothèque Média</CardTitle>
          <CardDescription>
            {filteredFiles.length} fichier{filteredFiles.length > 1 ? 's' : ''} affiché{filteredFiles.length > 1 ? 's' : ''}
            {filteredFiles.length !== initialFiles.length && ` sur ${initialFiles.length} au total`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags}
          />
          <MediaGrid files={filteredFiles} />
        </CardContent>
      </Card>
    </div>
  );
}
