import { useState, useCallback } from 'react';

interface UploadProgress {
  progress: number;
  uploading: boolean;
  error: string | null;
}

interface UploadResult {
  success: boolean;
  file?: {
    id: string;
    filename: string;
    size: number;
    type: string;
    path: string;
  };
  error?: string;
}

export function useUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false,
    error: null,
  });

  const upload = useCallback(
    async (file: File, userId?: string): Promise<UploadResult> => {
      setUploadProgress({ progress: 0, uploading: true, error: null });

      return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('file', file);
        if (userId) formData.append('userId', userId);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress((prev) => ({ ...prev, progress }));
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            setUploadProgress({ progress: 100, uploading: false, error: null });
            resolve(result);
          } else {
            const error =
              JSON.parse(xhr.responseText).error || 'Upload failed';
            setUploadProgress({ progress: 0, uploading: false, error });
            resolve({ success: false, error });
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          const error = 'Network error during upload';
          setUploadProgress({ progress: 0, uploading: false, error });
          resolve({ success: false, error });
        });

        xhr.addEventListener('abort', () => {
          const error = 'Upload cancelled';
          setUploadProgress({ progress: 0, uploading: false, error });
          resolve({ success: false, error });
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    },
    []
  );

  const reset = useCallback(() => {
    setUploadProgress({ progress: 0, uploading: false, error: null });
  }, []);

  return {
    upload,
    reset,
    ...uploadProgress,
  };
}
