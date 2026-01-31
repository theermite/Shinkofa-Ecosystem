"""
Threading utilities for Voice Dictation application.
Provides thread-safe queues and worker patterns.
"""

import threading
import queue
from typing import Optional, Callable, Any
from dataclasses import dataclass
from enum import Enum
import time

from loguru import logger


class WorkerState(Enum):
    """Worker thread states."""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"


@dataclass
class AudioChunk:
    """Audio data chunk with metadata."""
    data: Any  # numpy array
    timestamp: float
    sample_rate: int
    duration: float


@dataclass
class TranscriptionResult:
    """Transcription result with metadata."""
    text: str
    language: str
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    timestamp: Optional[float] = None


class ThreadSafeWorker(threading.Thread):
    """
    Base class for thread-safe worker threads.
    Provides common functionality like start/stop/pause controls.
    """

    def __init__(self, name: str = "Worker"):
        super().__init__(name=name, daemon=True)
        self._state = WorkerState.IDLE
        self._state_lock = threading.Lock()
        self._stop_event = threading.Event()
        self._pause_event = threading.Event()
        self._pause_event.set()  # Not paused by default

    @property
    def state(self) -> WorkerState:
        """Get current worker state."""
        with self._state_lock:
            return self._state

    def _set_state(self, new_state: WorkerState):
        """Thread-safe state update."""
        with self._state_lock:
            old_state = self._state
            self._state = new_state
            logger.debug(f"Worker '{self.name}' state: {old_state.value} -> {new_state.value}")

    def start_worker(self):
        """Start the worker thread."""
        if self.state == WorkerState.IDLE:
            self._set_state(WorkerState.RUNNING)
            self.start()
            logger.info(f"Worker '{self.name}' started")

    def stop_worker(self, timeout: float = 5.0):
        """
        Stop the worker thread gracefully.

        Args:
            timeout: Maximum time to wait for thread to stop (seconds)
        """
        if self.state in [WorkerState.RUNNING, WorkerState.PAUSED]:
            logger.info(f"Stopping worker '{self.name}'...")
            self._stop_event.set()
            self._pause_event.set()  # Unpause if paused
            self.join(timeout=timeout)

            if self.is_alive():
                logger.warning(f"Worker '{self.name}' did not stop gracefully")
            else:
                self._set_state(WorkerState.STOPPED)
                logger.info(f"Worker '{self.name}' stopped")

    def pause_worker(self):
        """Pause the worker thread."""
        if self.state == WorkerState.RUNNING:
            self._pause_event.clear()
            self._set_state(WorkerState.PAUSED)
            logger.info(f"Worker '{self.name}' paused")

    def resume_worker(self):
        """Resume the worker thread."""
        if self.state == WorkerState.PAUSED:
            self._pause_event.set()
            self._set_state(WorkerState.RUNNING)
            logger.info(f"Worker '{self.name}' resumed")

    def should_stop(self) -> bool:
        """Check if worker should stop."""
        return self._stop_event.is_set()

    def wait_if_paused(self):
        """Wait if worker is paused."""
        self._pause_event.wait()

    def run(self):
        """Override this method in subclasses."""
        raise NotImplementedError("Subclasses must implement run()")


class QueueWorker(ThreadSafeWorker):
    """
    Worker that processes items from a queue.
    """

    def __init__(
        self,
        name: str,
        process_func: Callable[[Any], Optional[Any]],
        input_queue: queue.Queue,
        output_queue: Optional[queue.Queue] = None,
        timeout: float = 0.1
    ):
        """
        Initialize queue worker.

        Args:
            name: Worker name
            process_func: Function to process each item
            input_queue: Input queue to read from
            output_queue: Optional output queue for results
            timeout: Queue get timeout (seconds)
        """
        super().__init__(name=name)
        self.process_func = process_func
        self.input_queue = input_queue
        self.output_queue = output_queue
        self.timeout = timeout
        self.items_processed = 0
        self.errors_count = 0

    def run(self):
        """Process items from queue until stopped."""
        logger.info(f"QueueWorker '{self.name}' running")
        self._set_state(WorkerState.RUNNING)

        while not self.should_stop():
            self.wait_if_paused()

            try:
                # Try to get item from queue
                item = self.input_queue.get(timeout=self.timeout)

                # Process item
                start_time = time.time()
                result = self.process_func(item)
                processing_time = time.time() - start_time

                self.items_processed += 1
                logger.debug(
                    f"Worker '{self.name}' processed item #{self.items_processed} "
                    f"in {processing_time*1000:.1f}ms"
                )

                # Put result in output queue if available
                if self.output_queue is not None and result is not None:
                    self.output_queue.put(result)

                self.input_queue.task_done()

            except queue.Empty:
                # No item available, continue
                continue

            except Exception as e:
                self.errors_count += 1
                logger.error(f"Worker '{self.name}' error processing item: {e}")
                logger.exception(e)
                self.input_queue.task_done()

        logger.info(
            f"QueueWorker '{self.name}' finished. "
            f"Processed: {self.items_processed}, Errors: {self.errors_count}"
        )


class BoundedQueue:
    """
    Thread-safe bounded queue with automatic dropping of old items.
    Useful for audio buffers where we want to keep only recent data.
    """

    def __init__(self, maxsize: int = 100):
        """
        Initialize bounded queue.

        Args:
            maxsize: Maximum number of items in queue
        """
        self.queue = queue.Queue(maxsize=maxsize)
        self.maxsize = maxsize
        self.dropped_count = 0

    def put(self, item: Any, block: bool = False, timeout: Optional[float] = None):
        """
        Put item in queue, dropping oldest if full.

        Args:
            item: Item to add
            block: Whether to block if queue is full
            timeout: Optional timeout for blocking
        """
        try:
            self.queue.put(item, block=block, timeout=timeout)
        except queue.Full:
            # Drop oldest item and add new one
            try:
                self.queue.get_nowait()
                self.queue.put_nowait(item)
                self.dropped_count += 1
                if self.dropped_count % 10 == 0:
                    logger.warning(f"BoundedQueue dropped {self.dropped_count} items")
            except queue.Empty:
                pass

    def get(self, block: bool = True, timeout: Optional[float] = None) -> Any:
        """Get item from queue."""
        return self.queue.get(block=block, timeout=timeout)

    def get_nowait(self) -> Any:
        """Get item without blocking."""
        return self.queue.get_nowait()

    def qsize(self) -> int:
        """Get approximate queue size."""
        return self.queue.qsize()

    def empty(self) -> bool:
        """Check if queue is empty."""
        return self.queue.empty()

    def clear(self):
        """Clear all items from queue."""
        while not self.empty():
            try:
                self.get_nowait()
            except queue.Empty:
                break


if __name__ == "__main__":
    # Test threading utilities
    from loguru import logger
    import numpy as np

    logger.info("Testing threading utilities...")

    # Test QueueWorker
    def process_number(x):
        time.sleep(0.1)  # Simulate processing
        return x * 2

    input_q = queue.Queue()
    output_q = queue.Queue()

    worker = QueueWorker(
        name="TestWorker",
        process_func=process_number,
        input_queue=input_q,
        output_queue=output_q
    )

    worker.start_worker()

    # Add items
    for i in range(5):
        input_q.put(i)
        logger.info(f"Added {i} to queue")

    # Wait for processing
    time.sleep(1)

    # Get results
    results = []
    while not output_q.empty():
        results.append(output_q.get())

    logger.info(f"Results: {results}")

    # Test pause/resume
    worker.pause_worker()
    time.sleep(0.2)
    worker.resume_worker()

    # Stop worker
    worker.stop_worker()

    # Test BoundedQueue
    logger.info("\nTesting BoundedQueue...")
    bq = BoundedQueue(maxsize=3)

    for i in range(5):
        bq.put(i)
        logger.info(f"Queue size: {bq.qsize()}, Dropped: {bq.dropped_count}")

    logger.success("Threading utilities test completed!")
