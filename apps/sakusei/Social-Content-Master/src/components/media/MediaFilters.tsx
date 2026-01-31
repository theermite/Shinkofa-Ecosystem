'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export type MediaFolder = 'RAW_JAY' | 'EDITED_ANGE' | 'PUBLISHED' | 'TEMPLATES';
export type MediaStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
export type FTPStatus = 'PENDING' | 'TRANSFERRING' | 'COMPLETED' | 'FAILED';

export interface MediaFilterValues {
  folder: MediaFolder | 'all';
  status: MediaStatus | 'all';
  ftpStatus: FTPStatus | 'all';
  tags: string[];
  search: string;
}

export interface MediaFiltersProps {
  filters: MediaFilterValues;
  onFiltersChange: (filters: MediaFilterValues) => void;
  availableTags?: string[];
}

const FOLDER_OPTIONS: { value: MediaFolder | 'all'; label: string }[] = [
  { value: 'all', label: 'All Folders' },
  { value: 'RAW_JAY', label: 'Raw (Jay)' },
  { value: 'EDITED_ANGE', label: 'Edited (Ange)' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'TEMPLATES', label: 'Templates' },
];

const STATUS_OPTIONS: { value: MediaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'UPLOADED', label: 'Uploaded' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY', label: 'Ready' },
  { value: 'FAILED', label: 'Failed' },
];

const FTP_STATUS_OPTIONS: { value: FTPStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All FTP Status' },
  { value: 'PENDING', label: 'Pending Transfer' },
  { value: 'TRANSFERRING', label: 'Transferring' },
  { value: 'COMPLETED', label: 'On CDN' },
  { value: 'FAILED', label: 'Transfer Failed' },
];

export function MediaFilters({
  filters,
  onFiltersChange,
  availableTags = [],
}: MediaFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof MediaFilterValues, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      folder: 'all',
      status: 'all',
      ftpStatus: 'all',
      tags: [],
      search: '',
    });
  };

  const hasActiveFilters =
    filters.folder !== 'all' ||
    filters.status !== 'all' ||
    filters.ftpStatus !== 'all' ||
    filters.tags.length > 0 ||
    filters.search !== '';

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {[
                filters.folder !== 'all',
                filters.status !== 'all',
                filters.ftpStatus !== 'all',
                filters.tags.length > 0,
                filters.search !== '',
              ].filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">Search</label>
            <input
              type="text"
              placeholder="Search by filename..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full rounded-md border border-input bg-background text-foreground font-semibold px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Folder Filter */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">Folder</label>
            <div className="grid grid-cols-2 gap-2">
              {FOLDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('folder', option.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    filters.folder === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-input bg-background text-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('status', option.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    filters.status === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-input bg-background text-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* FTP Status Filter */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">FTP Transfer</label>
            <div className="grid grid-cols-2 gap-2">
              {FTP_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('ftpStatus', option.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    filters.ftpStatus === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-input bg-background text-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter (if available) */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter((t) => t !== tag)
                        : [...filters.tags, tag];
                      handleFilterChange('tags', newTags);
                    }}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
