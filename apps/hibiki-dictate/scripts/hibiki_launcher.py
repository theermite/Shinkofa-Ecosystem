"""
Hibiki Launcher - Installation et Lancement Automatique
Détecte si Hibiki est installé, sinon lance l'installation automatique.
Au premier lancement : installe tout (Python deps, modèles, config)
Aux lancements suivants : lance directement l'application

Copyright © 2025 La Voie Shinkofa
"""

import sys
import os
from pathlib import Path
import subprocess
import json
import logging
from typing import Optional
import winreg

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constantes
APP_NAME = "Hibiki"
APP_VERSION = "1.0.0"
PUBLISHER = "La Voie Shinkofa"

# Chemins d'installation
def get_install_dir() -> Path:
    """Retourne le dossier d'installation (Program Files par défaut)."""
    program_files = os.environ.get('PROGRAMFILES', 'C:\\Program Files')
    return Path(program_files) / APP_NAME

def get_user_data_dir() -> Path:
    """Retourne le dossier de données utilisateur (AppData)."""
    appdata = os.environ.get('APPDATA', os.path.expanduser('~\\AppData\\Roaming'))
    return Path(appdata) / APP_NAME

def is_installed() -> bool:
    """
    Vérifie si Hibiki est déjà installé.
    Cherche :
    1. Dossier installation dans Program Files
    2. Clé registre Windows
    3. Fichier marker .installed
    """
    install_dir = get_install_dir()
    user_data_dir = get_user_data_dir()

    # Check 1 : Dossier installation existe
    if not install_dir.exists():
        return False

    # Check 2 : Fichier marker existe
    marker_file = user_data_dir / '.installed'
    if not marker_file.exists():
        return False

    # Check 3 : Vérifier registre Windows
    try:
        reg_key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\La Voie Shinkofa\Hibiki",
            0,
            winreg.KEY_READ
        )
        winreg.CloseKey(reg_key)
        return True
    except WindowsError:
        return False

def get_python_embedded() -> Optional[Path]:
    """Retourne le chemin vers Python embarqué, ou None si pas installé."""
    install_dir = get_install_dir()
    python_exe = install_dir / "python" / "python.exe"
    return python_exe if python_exe.exists() else None

def launch_application():
    """Lance l'application Hibiki principale."""
    install_dir = get_install_dir()

    # Utiliser pythonw.exe (pas de console) et le launcher
    pythonw_exe = install_dir / "python" / "pythonw.exe"
    launcher_script = install_dir / "launch_hibiki.pyw"

    if not pythonw_exe.exists():
        logger.error("Python embarqué introuvable. Installation corrompue ?")
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)

    if not launcher_script.exists():
        logger.error(f"Launcher introuvable: {launcher_script}")
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)

    logger.info(f"Lancement de {APP_NAME}...")

    try:
        # Lancer l'application via le launcher (processus séparé, non-bloquant, sans console)
        subprocess.Popen(
            [str(pythonw_exe), str(launcher_script)],
            cwd=str(install_dir),
            creationflags=subprocess.CREATE_NO_WINDOW  # Pas de console
        )
        logger.info("Application lancée avec succès.")
    except Exception as e:
        logger.error(f"Erreur au lancement: {e}")
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)

def run_installer():
    """Lance le processus d'installation avec interface graphique."""
    # Vérifier droits administrateur
    if not is_admin():
        logger.warning("Droits administrateur requis pour l'installation.")
        relaunch_as_admin()
        sys.exit(0)

    # Importer et lancer l'interface d'installation
    try:
        from installer import HibikiInstaller
        from installer_gui_native import NativeInstallerGUI

        # Créer instance de l'installateur
        installer = HibikiInstaller(
            install_dir=get_install_dir(),
            user_data_dir=get_user_data_dir()
        )

        # Lancer l'interface native Windows
        gui = NativeInstallerGUI(installer)
        success = gui.run()

        if success:
            # Lancer l'application après installation
            logger.info("Lancement de l'application...")
            launch_application()
        else:
            logger.error("Installation échouée.")
            sys.exit(1)

    except ImportError as e:
        logger.error(f"Module d'installation introuvable: {e}")
        import traceback
        traceback.print_exc()
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Erreur durant l'installation: {e}")
        import traceback
        traceback.print_exc()
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)

def is_admin() -> bool:
    """Vérifie si le programme tourne avec droits admin."""
    try:
        import ctypes
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False

def relaunch_as_admin():
    """Relance le programme avec élévation de privilèges."""
    import ctypes

    try:
        # Si c'est un exécutable frozen (PyInstaller)
        if getattr(sys, 'frozen', False):
            executable = sys.executable
        else:
            executable = sys.executable
            params = ' '.join([sys.executable] + sys.argv)

        ctypes.windll.shell32.ShellExecuteW(
            None,
            "runas",  # Élévation de privilèges
            executable,
            ' '.join(sys.argv),
            None,
            1  # SW_SHOWNORMAL
        )
    except Exception as e:
        logger.error(f"Impossible d'élever les privilèges: {e}")
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)

def main():
    """Point d'entrée principal du launcher."""
    logger.info(f"Hibiki Launcher v{APP_VERSION}")
    logger.info(f"Vérification de l'installation...")

    if is_installed():
        logger.info("✓ Hibiki est installé")
        launch_application()
    else:
        logger.info("✗ Hibiki n'est pas installé")
        logger.info("Lancement de l'installation...")
        logger.info("")
        run_installer()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\nInterruption utilisateur.")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
        input("Appuyez sur Entrée pour quitter...")
        sys.exit(1)
