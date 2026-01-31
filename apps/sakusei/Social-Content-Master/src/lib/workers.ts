/**
 * Workers initialization for Next.js
 * Workers are started automatically when the server starts
 */

let workersInitialized = false;

export async function initializeWorkers() {
  // Prevent multiple initializations (Next.js hot reload)
  if (workersInitialized) {
    console.log('[Workers] Already initialized, skipping...');
    return;
  }

  console.log('🚀 [Workers] Initializing background workers...');

  try {
    // Import workers dynamically (side effects will start them)
    await Promise.all([
      import('@/workers/transcribe.worker'),
      import('@/workers/ftp.worker'),
      import('@/workers/transcode.worker'),
    ]);

    workersInitialized = true;
    console.log('✅ [Workers] All workers initialized successfully');
  } catch (error) {
    console.error('❌ [Workers] Failed to initialize workers:', error);
    throw error;
  }
}

// Initialize workers in production/development
if (typeof window === 'undefined') {
  // Server-side only
  initializeWorkers().catch((err) => {
    console.error('[Workers] Initialization error:', err);
  });
}
