"""Test backend compatibility with Qt event loop.

This script validates that Hibiki's audio capture, VAD, and transcription
backend components work correctly with Qt6's event loop.
"""
import sys
from pathlib import Path

from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QLabel
from PySide6.QtCore import Qt

from src.core.audio_capture import AudioCapture
from src.core.vad_processor import VADProcessor
from src.models.config import AppSettings


class TestWindow(QMainWindow):
    """Test window to validate backend compatibility with Qt6."""

    def __init__(self, config: AppSettings):
        super().__init__()
        self.config = config
        self.audio_capture = None
        self.vad_processor = None
        self.is_recording = False
        self.segment_count = 0

        self.setWindowTitle("Qt6 Backend Compatibility Test")
        self.setGeometry(100, 100, 600, 400)

        # Layout
        central = QWidget()
        layout = QVBoxLayout()
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        # Title
        title = QLabel("Hibiki Qt6 Backend Test")
        title.setStyleSheet("font-size: 24px; font-weight: bold;")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Status
        self.status_label = QLabel("Backend NOT initialized")
        self.status_label.setStyleSheet("font-size: 16px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setWordWrap(True)
        layout.addWidget(self.status_label)

        # Segment counter
        self.segment_label = QLabel("Speech segments detected: 0")
        self.segment_label.setStyleSheet("font-size: 14px; color: #6b7280;")
        self.segment_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.segment_label)

        # Initialize button
        init_btn = QPushButton("1. Initialize Backend")
        init_btn.setStyleSheet("""
            QPushButton {
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2563eb;
            }
            QPushButton:pressed {
                background-color: #1d4ed8;
            }
        """)
        init_btn.clicked.connect(self.init_backend)
        layout.addWidget(init_btn)

        # Record button
        self.record_btn = QPushButton("2. Start Recording (speak to test VAD)")
        self.record_btn.setStyleSheet("""
            QPushButton {
                background-color: #10b981;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #059669;
            }
            QPushButton:pressed {
                background-color: #047857;
            }
            QPushButton:disabled {
                background-color: #d1d5db;
                color: #9ca3af;
            }
        """)
        self.record_btn.clicked.connect(self.toggle_recording)
        self.record_btn.setEnabled(False)
        layout.addWidget(self.record_btn)

        # Info
        info = QLabel("This test validates that audio capture and VAD work with Qt6 event loop.\nNo actual transcription will be performed.")
        info.setStyleSheet("font-size: 12px; color: #6b7280; margin-top: 10px;")
        info.setAlignment(Qt.AlignCenter)
        info.setWordWrap(True)
        layout.addWidget(info)

        # Spacer
        layout.addStretch()

        central.setLayout(layout)
        self.setCentralWidget(central)

    def init_backend(self):
        """Initialize backend components."""
        try:
            self.status_label.setText("Initializing VAD processor...")
            self.status_label.setStyleSheet("font-size: 16px; padding: 20px; background-color: #fef3c7; border-radius: 8px;")
            QApplication.processEvents()

            # Initialize VAD
            self.vad_processor = VADProcessor(self.config.vad)

            self.status_label.setText("Initializing audio capture...")
            QApplication.processEvents()

            # Initialize audio capture
            self.audio_capture = AudioCapture(
                config=self.config.audio,
                callback=self.on_audio_chunk
            )

            self.status_label.setText("✅ Backend initialized successfully!\n\nQt6 event loop is compatible with Hibiki backend.")
            self.status_label.setStyleSheet("font-size: 16px; padding: 20px; background-color: #d1fae5; border-radius: 8px;")
            self.record_btn.setEnabled(True)

            print("✅ Backend initialization successful")

        except Exception as e:
            error_msg = f"❌ Backend initialization failed:\n{str(e)}"
            self.status_label.setText(error_msg)
            self.status_label.setStyleSheet("font-size: 16px; padding: 20px; background-color: #fee2e2; border-radius: 8px;")
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

    def toggle_recording(self):
        """Toggle recording state."""
        if self.is_recording:
            self.stop_recording()
        else:
            self.start_recording()

    def start_recording(self):
        """Start recording."""
        if not self.audio_capture:
            return

        print("Starting recording...")
        self.is_recording = True
        self.segment_count = 0

        if self.vad_processor:
            self.vad_processor.reset()

        self.status_label.setText("🎤 Recording... Speak to test VAD detection")
        self.status_label.setStyleSheet("font-size: 16px; padding: 20px; background-color: #dbeafe; border-radius: 8px;")
        self.record_btn.setText("Stop Recording")
        self.segment_label.setText("Speech segments detected: 0")

        self.audio_capture.start()

    def stop_recording(self):
        """Stop recording."""
        if not self.audio_capture:
            return

        print("Stopping recording...")
        self.is_recording = False

        self.audio_capture.stop()

        # Flush VAD
        if self.vad_processor:
            final_segment = self.vad_processor.flush()
            if final_segment:
                self.segment_count += 1
                print(f"✅ Final speech segment: {final_segment.duration:.2f}s")

        self.status_label.setText(f"✅ Recording stopped\n\nTotal segments detected: {self.segment_count}")
        self.status_label.setStyleSheet("font-size: 16px; padding: 20px; background-color: #d1fae5; border-radius: 8px;")
        self.record_btn.setText("2. Start Recording (speak to test VAD)")
        self.segment_label.setText(f"Speech segments detected: {self.segment_count}")

    def on_audio_chunk(self, chunk):
        """Handle audio chunk from capture."""
        if self.vad_processor and self.is_recording:
            segment = self.vad_processor.process_chunk(chunk)
            if segment:
                self.segment_count += 1
                print(f"✅ Speech segment detected: {segment.duration:.2f}s (total: {self.segment_count})")
                self.segment_label.setText(f"Speech segments detected: {self.segment_count}")

    def closeEvent(self, event):
        """Handle window close."""
        if self.is_recording and self.audio_capture:
            self.audio_capture.stop()
        print("Test window closed")
        event.accept()


def main():
    """Run Qt6 backend compatibility test."""
    print("=== Hibiki Qt6 Backend Compatibility Test ===")
    print("This test validates that Hibiki's backend works with Qt6 event loop")
    print()

    # Load config
    try:
        config = AppSettings.load()
        print(f"✅ Config loaded from: {config.config_file}")
    except Exception as e:
        print(f"❌ Failed to load config: {e}")
        sys.exit(1)

    # Create Qt application
    app = QApplication(sys.argv)
    app.setApplicationName("Hibiki Qt6 Backend Test")

    # Create and show test window
    window = TestWindow(config)
    window.show()

    print()
    print("Instructions:")
    print("1. Click 'Initialize Backend' button")
    print("2. Click 'Start Recording' button")
    print("3. Speak into your microphone")
    print("4. Watch for speech segment detection")
    print("5. Click 'Stop Recording' when done")
    print()

    # Run event loop
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
