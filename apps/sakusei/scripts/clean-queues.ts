import { transcodeQueue } from '@/lib/queue';

async function cleanQueues() {
  console.log('🧹 Cleaning BullMQ queues...\n');

  // Clean transcode queue
  console.log('Cleaning transcode queue...');
  await transcodeQueue.drain(); // Remove all jobs
  await transcodeQueue.clean(0, 1000, 'completed'); // Clean completed
  await transcodeQueue.clean(0, 1000, 'failed'); // Clean failed

  const counts = await transcodeQueue.getJobCounts();
  console.log('Transcode Queue after cleanup:');
  console.log('  Waiting:', counts.waiting);
  console.log('  Active:', counts.active);
  console.log('  Completed:', counts.completed);
  console.log('  Failed:', counts.failed);

  await transcodeQueue.close();
  console.log('\n✅ Queue cleanup complete');
}

cleanQueues().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
