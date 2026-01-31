import { ftpQueue, transcribeQueue, transcodeQueue } from '@/lib/queue';

async function checkQueues() {
  console.log('📊 Checking BullMQ queues...\n');

  // FTP Queue
  const ftpCounts = await ftpQueue.getJobCounts();
  console.log('1. FTP Queue:');
  console.log('   Waiting:', ftpCounts.waiting);
  console.log('   Active:', ftpCounts.active);
  console.log('   Completed:', ftpCounts.completed);
  console.log('   Failed:', ftpCounts.failed);

  // Transcribe Queue
  const transcribeCounts = await transcribeQueue.getJobCounts();
  console.log('\n2. Transcribe Queue:');
  console.log('   Waiting:', transcribeCounts.waiting);
  console.log('   Active:', transcribeCounts.active);
  console.log('   Completed:', transcribeCounts.completed);
  console.log('   Failed:', transcribeCounts.failed);

  // Transcode Queue
  const transcodeCounts = await transcodeQueue.getJobCounts();
  console.log('\n3. Transcode Queue:');
  console.log('   Waiting:', transcodeCounts.waiting);
  console.log('   Active:', transcodeCounts.active);
  console.log('   Completed:', transcodeCounts.completed);
  console.log('   Failed:', transcodeCounts.failed);

  // Get waiting transcode jobs
  if (transcodeCounts.waiting > 0) {
    console.log('\n📋 Waiting transcode jobs:');
    const waitingJobs = await transcodeQueue.getWaiting();
    waitingJobs.slice(0, 5).forEach((job, i) => {
      console.log(`   ${i + 1}. Job ${job.id}:`, job.data);
    });
  }

  // Get failed transcode jobs
  if (transcodeCounts.failed > 0) {
    console.log('\n❌ Failed transcode jobs:');
    const failedJobs = await transcodeQueue.getFailed();
    failedJobs.slice(0, 5).forEach((job, i) => {
      console.log(`   ${i + 1}. Job ${job.id}:`, job.failedReason);
    });
  }

  await ftpQueue.close();
  await transcribeQueue.close();
  await transcodeQueue.close();
}

checkQueues().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
