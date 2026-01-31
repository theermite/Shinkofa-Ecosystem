"""Hibiki Launcher - Choose between CustomTkinter and Qt6 versions.

This launcher allows testing the new Qt6 version while keeping the stable
CustomTkinter version available.
"""
import sys
from pathlib import Path


def main():
    """Launch selected version of Hibiki."""
    print("=" * 50)
    print("🎙️  HIBIKI - VOICE DICTATION LAUNCHER")
    print("=" * 50)
    print()
    print("Choose your version:")
    print()
    print("  1. CustomTkinter (STABLE - Current production)")
    print("     └─ Proven, stable, fully tested")
    print()
    print("  2. Qt6/PySide6 (NEW - Modern UI)")
    print("     └─ Modern design, SVG icons, glassmorphism")
    print()

    while True:
        choice = input("Enter your choice (1 or 2): ").strip()

        if choice == "1":
            print()
            print("🚀 Launching CustomTkinter version...")
            print()
            from main import main as main_ctk
            main_ctk()
            break

        elif choice == "2":
            print()
            print("🚀 Launching Qt6 version...")
            print()
            try:
                from main_qt import main as main_qt
                main_qt()
            except ImportError as e:
                print()
                print("❌ Qt6 version not yet available or PySide6 not installed")
                print(f"   Error: {e}")
                print()
                print("To install PySide6:")
                print("  pip install -r requirements.txt")
                print()
                sys.exit(1)
            break

        else:
            print("❌ Invalid choice. Please enter 1 or 2.")
            print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        print("Launcher interrupted by user")
        sys.exit(0)
    except Exception as e:
        print()
        print(f"❌ Launcher error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
