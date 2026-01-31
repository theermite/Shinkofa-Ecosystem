# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Hibiki
Builds standalone executable with all dependencies bundled
"""

import sys
from pathlib import Path
import os

# Determine if we're building for GPU or CPU
# Set via command line: pyinstaller hibiki.spec -- --gpu
# Or default to CPU for wider compatibility
build_gpu = '--gpu' in sys.argv

block_cipher = None

# Find lightning_fabric path for version.info
try:
    import lightning_fabric
    lightning_fabric_path = os.path.dirname(lightning_fabric.__file__)
    lightning_fabric_datas = [(os.path.join(lightning_fabric_path, 'version.info'), 'lightning_fabric')]
except ImportError:
    lightning_fabric_datas = []

# Analysis: collect all Python files and dependencies
a = Analysis(
    ['src/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        # Include config template
        ('src/models/config.py', 'models'),
    ] + lightning_fabric_datas,
    hiddenimports=[
        # Core dependencies
        'whisperx',
        'torch',
        'torchaudio',
        'transformers',
        'faster_whisper',
        'pyannote.audio',
        'customtkinter',
        'pydantic',
        'pydantic_settings',
        'loguru',
        'sounddevice',
        'scipy',
        'numpy',
        'keyboard',
        'pynput',
        'pyperclip',
        'pyautogui',
        # WhisperX dependencies
        'whisperx.alignment',
        'whisperx.asr',
        'whisperx.audio',
        'whisperx.diarize',
        'whisperx.vad',
        # PyTorch
        'torch.nn',
        'torch.nn.functional',
        'torch.utils',
        'torch.utils.data',
        # Transformers
        'transformers.modeling_utils',
        'transformers.configuration_utils',
        # Audio processing
        'scipy.signal',
        'scipy.ndimage',
        # CustomTkinter
        'customtkinter.windows',
        'customtkinter.widgets',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude unnecessary packages to reduce size
        'matplotlib',
        'pandas',
        'pytest',
        'IPython',
        'notebook',
        'jupyter',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# PYZ: Create compressed Python bytecode archive
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# EXE: Create executable
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='Hibiki',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,  # Compress with UPX
    console=True,  # TEMPORARY: Show console to see errors (set to False for release)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/hibiki_icon.ico' if Path('assets/hibiki_icon.ico').exists() else None,
    version_file='version_info.txt' if Path('version_info.txt').exists() else None,
    # Temporarily set console=True to see errors (change back to False for release)
    _console_debug=True,  # Change this to False for windowed release
)

# COLLECT: Gather all files for distribution
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='Hibiki',
)
