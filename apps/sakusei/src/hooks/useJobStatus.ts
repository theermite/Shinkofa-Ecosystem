import { useState, useEffect, useCallback, useRef } from 'react';

export interface JobStatus {
  jobId: string;
  queue: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  data: Record<string, unknown>;
  timestamp: number;
  result?: {
    success: boolean;
    cdnUrl?: string;
    duration?: number;
  };
  error?: string;
  currentProgress?: number;
}

export interface UseJobStatusReturn {
  status: JobStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  startPolling: (interval?: number) => void;
  stopPolling: () => void;
  isPolling: boolean;
}

/**
 * Hook to poll job status from BullMQ
 * @param jobId - Job ID to poll
 * @param autoStart - Start polling automatically (default: false)
 * @param pollInterval - Polling interval in ms (default: 2000)
 */
export function useJobStatus(
  jobId: string | null,
  autoStart = false,
  pollInterval = 2000
): UseJobStatusReturn {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!jobId) {
      setError('No job ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/processing/status/${jobId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch job status');
      }

      const data: JobStatus = await response.json();
      setStatus(data);

      // Stop polling if job is completed or failed
      if (data.state === 'completed' || data.state === 'failed') {
        stopPolling();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useJobStatus] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const startPolling = useCallback((interval = pollInterval) => {
    if (!jobId) return;

    setIsPolling(true);

    // Fetch immediately
    fetchStatus();

    // Then poll at interval
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, interval);
  }, [jobId, pollInterval, fetchStatus]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Auto-start polling if enabled
  useEffect(() => {
    if (autoStart && jobId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoStart, jobId, startPolling, stopPolling]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    startPolling,
    stopPolling,
    isPolling,
  };
}
