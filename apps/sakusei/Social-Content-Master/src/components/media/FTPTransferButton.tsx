'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useJobStatus } from '@/hooks/useJobStatus';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export interface FTPTransferButtonProps {
  mediaFileId: string;
  currentFtpStatus: 'PENDING' | 'TRANSFERRING' | 'COMPLETED' | 'FAILED';
  cdnUrl?: string | null;
  onTransferComplete?: (cdnUrl: string) => void;
  size?: 'default' | 'sm' | 'lg';
}

export function FTPTransferButton({
  mediaFileId,
  currentFtpStatus,
  cdnUrl,
  onTransferComplete,
  size = 'default',
}: FTPTransferButtonProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { status, error: pollingError, startPolling } = useJobStatus(jobId, !!jobId);

  const handleTransfer = async () => {
    try {
      setInitiating(true);
      setErrorMessage(null);

      const response = await fetch('/api/ftp/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaFileId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start FTP transfer');
      }

      const data = await response.json();
      setJobId(data.jobId);
      startPolling(2000); // Poll every 2 seconds
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(message);
      console.error('[FTPTransferButton] Error:', err);
    } finally {
      setInitiating(false);
    }
  };

  // Handle transfer completion
  if (status?.state === 'completed' && status.result?.cdnUrl) {
    if (onTransferComplete) {
      onTransferComplete(status.result.cdnUrl);
    }
  }

  // Already completed
  if (currentFtpStatus === 'COMPLETED' && cdnUrl) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Transferred to CDN</span>
      </div>
    );
  }

  // Failed
  if (currentFtpStatus === 'FAILED' || status?.state === 'failed') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">Transfer failed</span>
        </div>
        <Button
          onClick={handleTransfer}
          size={size}
          variant="outline"
          disabled={initiating}
        >
          {initiating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Retry Transfer
        </Button>
        {(errorMessage || pollingError) && (
          <p className="text-xs text-red-500">{errorMessage || pollingError}</p>
        )}
      </div>
    );
  }

  // Transferring
  if (currentFtpStatus === 'TRANSFERRING' || status?.state === 'active') {
    const progress = typeof status?.progress === 'number' ? status.progress : 0;

    return (
      <div className="space-y-2 w-full max-w-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-600">Transferring to CDN...</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-gray-500">{progress}%</p>
      </div>
    );
  }

  // Pending - show button
  return (
    <div className="space-y-2">
      <Button
        onClick={handleTransfer}
        size={size}
        variant="default"
        disabled={initiating || status?.state === 'waiting'}
      >
        {(initiating || status?.state === 'waiting') && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!initiating && !status && <Upload className="mr-2 h-4 w-4" />}
        Transfer to CDN
      </Button>
      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
