/**
 * Next.js Instrumentation Hook
 * This runs once when the Node.js server starts (not on every request)
 * Perfect for initializing background workers
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 [Instrumentation] Starting server initialization...');

    // Initialize background workers
    const { initializeWorkers } = await import('@/lib/workers');
    await initializeWorkers();

    console.log('✅ [Instrumentation] Server initialization complete');
  }
}
