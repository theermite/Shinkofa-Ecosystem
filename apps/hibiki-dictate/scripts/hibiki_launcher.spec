# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Hibiki Launcher
Crée un exécutable unique qui gère installation + lancement

Usage:
    pyinstaller hibiki_launcher.spec
"""

import sys
from pathlib import Path

block_cipher = None

# Collecter tous les fichiers de l'application à embarquer
app_datas = [
    # Fichiers source Python
    ('src', 'app/src'),

    # Fichiers de configuration
    ('requirements.txt', 'app'),

    # Documentation
    ('README.md', 'app'),
    ('USER-GUIDE.md', 'app'),
    ('COPYRIGHT.md', 'app'),
    ('CHANGELOG.md', 'app'),

    # Assets (si présents)
]

# Ajouter assets si le dossier existe
assets_dir = Path('assets')
if assets_dir.exists():
    app_datas.append(('assets', 'app/assets'))

# Analyse: Collecter dépendances du launcher
a = Analysis(
    ['hibiki_launcher.py'],
    pathex=[],
    binaries=[],
    datas=app_datas,
    hiddenimports=[
        'installer',  # Notre module d'installation
        'installer_gui_native',  # Interface native Windows (pas de tkinter)
        'winreg',
        'urllib.request',
        'json',
        'logging',
        'subprocess',
        'zipfile',
        'shutil',
        'ctypes',  # Pour l'interface native Windows
        'ctypes.wintypes',
        'threading',
        'datetime',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclure packages lourds non nécessaires pour le LAUNCHER
        # (seront installés plus tard par l'installer)
        'torch',
        'whisperx',
        'transformers',
        'numpy',
        'scipy',
        'customtkinter',
        'tkinter',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# PYZ: Archive Python bytecode
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# EXE: Créer l'exécutable unique
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Hibiki',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,  # Compression UPX
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Console pour voir logs d'installation
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/hibiki_icon.ico' if Path('assets/hibiki_icon.ico').exists() else None,
)

# Note: On crée un SEUL fichier .exe (pas de COLLECT)
# Tout est embarqué dans l'exe unique
