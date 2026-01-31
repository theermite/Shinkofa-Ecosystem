"""
Hibiki Installer - Installation Automatique
Télécharge et installe toutes les dépendances nécessaires
Gère la configuration, les modèles, et l'enregistrement Windows

Copyright © 2025 La Voie Shinkofa
"""

import os
import sys
import subprocess
import urllib.request
import zipfile
import shutil
import json
import winreg
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

APP_NAME = "Hibiki"
APP_VERSION = "1.0.0"
PUBLISHER = "La Voie Shinkofa"

# URLs de téléchargement
PYTHON_EMBEDDED_URL = "https://www.python.org/ftp/python/3.11.8/python-3.11.8-embed-amd64.zip"
PIP_GET_URL = "https://bootstrap.pypa.io/get-pip.py"

class HibikiInstaller:
    """Gestionnaire d'installation de Hibiki."""

    def __init__(self, install_dir: Path, user_data_dir: Path):
        self.install_dir = install_dir
        self.user_data_dir = user_data_dir
        self.python_dir = install_dir / "python"
        self.app_dir = install_dir / "app"
        self.temp_dir = install_dir / "temp"

    def run(self) -> bool:
        """
        Exécute l'installation complète.
        Retourne True si succès, False sinon.
        """
        steps = [
            ("Création des dossiers", self.create_directories),
            ("Téléchargement Python embarqué", self.download_python_embedded),
            ("Installation de pip", self.install_pip),
            ("Copie des fichiers application", self.copy_application_files),
            ("Installation des dépendances Python", self.install_dependencies),
            ("Configuration initiale", self.create_initial_config),
            ("Téléchargement des modèles WhisperX", self.download_whisperx_models),
            ("Création des raccourcis", self.create_shortcuts),
            ("Enregistrement dans Windows", self.register_in_windows),
            ("Finalisation", self.finalize_installation),
        ]

        total_steps = len(steps)

        for i, (step_name, step_func) in enumerate(steps, 1):
            logger.info(f"[{i}/{total_steps}] {step_name}...")
            try:
                step_func()
                logger.info(f"  ✓ {step_name} terminé")
            except Exception as e:
                logger.error(f"  ✗ Erreur: {e}")
                import traceback
                traceback.print_exc()
                return False

        return True

    def create_directories(self):
        """Crée la structure de dossiers."""
        self.install_dir.mkdir(parents=True, exist_ok=True)
        self.user_data_dir.mkdir(parents=True, exist_ok=True)
        self.python_dir.mkdir(parents=True, exist_ok=True)
        self.app_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

        # Créer sous-dossiers utilisateur
        (self.user_data_dir / "config").mkdir(exist_ok=True)
        (self.user_data_dir / "logs").mkdir(exist_ok=True)
        (self.user_data_dir / "models").mkdir(exist_ok=True)

    def download_python_embedded(self):
        """Télécharge et extrait Python embarqué."""
        logger.info(f"  Téléchargement de Python 3.11 embarqué...")

        zip_path = self.temp_dir / "python_embedded.zip"

        # Télécharger avec barre de progression
        def progress_hook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(100, (downloaded / total_size) * 100)
            sys.stdout.write(f"\r  Téléchargement: {percent:.1f}%")
            sys.stdout.flush()

        urllib.request.urlretrieve(
            PYTHON_EMBEDDED_URL,
            zip_path,
            reporthook=progress_hook
        )
        print()  # Nouvelle ligne après téléchargement

        logger.info(f"  Extraction de Python...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(self.python_dir)

        # Modifier python311._pth pour autoriser pip
        pth_file = self.python_dir / "python311._pth"
        if pth_file.exists():
            content = pth_file.read_text()
            content = content.replace("#import site", "import site")
            pth_file.write_text(content)

    def install_pip(self):
        """Installe pip dans Python embarqué."""
        logger.info(f"  Téléchargement de get-pip.py...")

        get_pip_path = self.temp_dir / "get-pip.py"
        urllib.request.urlretrieve(PIP_GET_URL, get_pip_path)

        logger.info(f"  Installation de pip...")
        python_exe = self.python_dir / "python.exe"

        result = subprocess.run(
            [str(python_exe), str(get_pip_path)],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise Exception(f"Installation pip échouée: {result.stderr}")

    def copy_application_files(self):
        """Copie les fichiers de l'application."""
        logger.info(f"  Copie des fichiers de l'application...")

        # Déterminer source (dossier actuel du launcher)
        if getattr(sys, 'frozen', False):
            # Si frozen (PyInstaller), les fichiers sont dans _MEIPASS
            source_dir = Path(sys._MEIPASS) / "app"
        else:
            # Sinon, dossier courant
            source_dir = Path(__file__).parent

        # Copier src/
        src_source = source_dir / "src"
        src_dest = self.app_dir / "src"

        if src_source.exists():
            shutil.copytree(src_source, src_dest, dirs_exist_ok=True)

        # Copier requirements.txt
        requirements_source = source_dir / "requirements.txt"
        requirements_dest = self.app_dir / "requirements.txt"

        if requirements_source.exists():
            shutil.copy2(requirements_source, requirements_dest)

        # Copier docs
        docs_dest = self.install_dir / "docs"
        docs_dest.mkdir(exist_ok=True)

        for doc_file in ["README.md", "USER-GUIDE.md", "COPYRIGHT.md", "CHANGELOG.md"]:
            doc_source = source_dir / doc_file
            if doc_source.exists():
                shutil.copy2(doc_source, docs_dest / doc_file)

    def install_dependencies(self):
        """Installe les dépendances Python."""
        logger.info(f"  Installation des dépendances Python...")
        logger.info(f"  Cela peut prendre 5-10 minutes...")

        python_exe = self.python_dir / "python.exe"
        pip_exe = self.python_dir / "Scripts" / "pip.exe"

        requirements_file = self.app_dir / "requirements.txt"

        if not requirements_file.exists():
            raise Exception("requirements.txt introuvable")

        # Installer requirements
        result = subprocess.run(
            [str(pip_exe), "install", "-r", str(requirements_file), "--quiet"],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise Exception(f"Installation dépendances échouée: {result.stderr}")

    def create_initial_config(self):
        """Crée la configuration initiale."""
        logger.info(f"  Création de la configuration par défaut...")

        config_file = self.user_data_dir / "config" / "hibiki_preferences.json"

        default_config = {
            "version": APP_VERSION,
            "whisperx": {
                "model": "base",
                "language": "fr",
                "device": "auto",
                "compute_type": "float16"
            },
            "hotkey": {
                "toggle_key": "ctrl+shift+space"
            },
            "theme_mode": "light",
            "auto_update": True,
            "check_update_on_start": True
        }

        config_file.write_text(json.dumps(default_config, indent=2, ensure_ascii=False))

    def download_whisperx_models(self):
        """Télécharge les modèles WhisperX (au premier lancement)."""
        logger.info(f"  Configuration du téléchargement des modèles...")
        logger.info(f"  Note: Les modèles WhisperX seront téléchargés au premier lancement")
        logger.info(f"  (1-4 GB selon le modèle - base par défaut)")

        # Créer dossier modèles
        models_dir = self.user_data_dir / "models"
        models_dir.mkdir(exist_ok=True)

        # Note: Le téléchargement réel se fait au premier lancement de l'app
        # car WhisperX gère ça automatiquement

    def create_shortcuts(self):
        """Crée les raccourcis Menu Démarrer et Bureau."""
        logger.info(f"  Création des raccourcis...")

        # Créer un launcher Python plus fiable qu'un batch
        launcher_file = self.install_dir / "launch_hibiki.pyw"
        python_exe = self.python_dir / "python.exe"
        pythonw_exe = self.python_dir / "pythonw.exe"  # Sans console
        main_script = self.app_dir / "src" / "main.py"

        # Launcher Python (utilise pythonw pour pas de console)
        # Lance directement l'application sans subprocess
        launcher_content = f"""#!/usr/bin/env python
# -*- coding: utf-8 -*-
\"\"\"
Hibiki Launcher - Lance l'application principale
\"\"\"
import sys
import os
from pathlib import Path

# Configurer chemins
app_dir = Path(r"{self.app_dir}")
src_dir = app_dir / "src"

# Changer vers dossier app
os.chdir(str(app_dir))

# Ajouter src au path Python
sys.path.insert(0, str(src_dir))

# Lancer l'application directement (pas de subprocess)
if __name__ == "__main__":
    # Importer et lancer le main
    try:
        import main
        main.main() if hasattr(main, 'main') else None
    except Exception as e:
        # Si erreur, afficher dans une MessageBox
        import ctypes
        ctypes.windll.user32.MessageBoxW(
            0,
            f"Erreur au lancement de Hibiki:\\n\\n{{str(e)}}\\n\\nConsultez les logs pour plus de détails.",
            "Erreur Hibiki",
            0x10  # MB_ICONERROR
        )
        raise
"""
        launcher_file.write_text(launcher_content, encoding='utf-8')

        # Batch file simplifié
        batch_file = self.install_dir / "Hibiki.bat"
        batch_content = f"""@echo off
REM Hibiki Launcher - Dictée Vocale
start "" "{pythonw_exe}" "{launcher_file}"
"""
        batch_file.write_text(batch_content)

        # Créer raccourci Menu Démarrer avec powershell
        start_menu = Path(os.environ.get('APPDATA')) / "Microsoft" / "Windows" / "Start Menu" / "Programs" / APP_NAME
        start_menu.mkdir(parents=True, exist_ok=True)

        shortcut_path = start_menu / f"{APP_NAME}.lnk"

        # Script PowerShell pour créer raccourci
        ps_script = f"""
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{batch_file}"
$Shortcut.WorkingDirectory = "{self.app_dir}"
$Shortcut.Description = "Hibiki - Dictée Vocale"
$Shortcut.Save()
"""

        ps_file = self.temp_dir / "create_shortcut.ps1"
        ps_file.write_text(ps_script)

        subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_file)],
            capture_output=True
        )

        # Raccourci Bureau (optionnel)
        desktop = Path(os.environ.get('USERPROFILE')) / "Desktop"
        desktop_shortcut = desktop / f"{APP_NAME}.lnk"

        ps_script_desktop = f"""
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{desktop_shortcut}")
$Shortcut.TargetPath = "{batch_file}"
$Shortcut.WorkingDirectory = "{self.app_dir}"
$Shortcut.Description = "Hibiki - Dictée Vocale"
$Shortcut.Save()
"""

        ps_file_desktop = self.temp_dir / "create_shortcut_desktop.ps1"
        ps_file_desktop.write_text(ps_script_desktop)

        subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_file_desktop)],
            capture_output=True
        )

    def register_in_windows(self):
        """Enregistre l'application dans le registre Windows."""
        logger.info(f"  Enregistrement dans Windows...")

        # Créer clé registre application
        try:
            reg_key = winreg.CreateKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\La Voie Shinkofa\Hibiki"
            )

            winreg.SetValueEx(reg_key, "Version", 0, winreg.REG_SZ, APP_VERSION)
            winreg.SetValueEx(reg_key, "InstallDir", 0, winreg.REG_SZ, str(self.install_dir))
            winreg.SetValueEx(reg_key, "UserDataDir", 0, winreg.REG_SZ, str(self.user_data_dir))

            winreg.CloseKey(reg_key)
        except Exception as e:
            logger.warning(f"  Impossible d'écrire dans le registre: {e}")

        # Ajouter à la liste des programmes installés (Uninstall)
        try:
            uninstall_key = winreg.CreateKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Uninstall\Hibiki"
            )

            winreg.SetValueEx(uninstall_key, "DisplayName", 0, winreg.REG_SZ, APP_NAME)
            winreg.SetValueEx(uninstall_key, "DisplayVersion", 0, winreg.REG_SZ, APP_VERSION)
            winreg.SetValueEx(uninstall_key, "Publisher", 0, winreg.REG_SZ, PUBLISHER)
            winreg.SetValueEx(uninstall_key, "InstallLocation", 0, winreg.REG_SZ, str(self.install_dir))
            winreg.SetValueEx(uninstall_key, "DisplayIcon", 0, winreg.REG_SZ, str(self.install_dir / "Hibiki.bat"))

            # Uninstaller (créer script de désinstallation)
            uninstall_script = self.install_dir / "uninstall.bat"
            uninstall_content = f"""@echo off
echo Désinstallation de Hibiki...
echo.
pause
rmdir /s /q "{self.install_dir}"
rmdir /s /q "{self.user_data_dir}"
reg delete "HKCU\\Software\\La Voie Shinkofa\\Hibiki" /f
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Hibiki" /f
echo Désinstallation terminée.
pause
"""
            uninstall_script.write_text(uninstall_content)

            winreg.SetValueEx(uninstall_key, "UninstallString", 0, winreg.REG_SZ, str(uninstall_script))

            winreg.CloseKey(uninstall_key)
        except Exception as e:
            logger.warning(f"  Impossible de créer la clé uninstall: {e}")

    def finalize_installation(self):
        """Finalise l'installation en créant les fichiers markers."""
        logger.info(f"  Finalisation de l'installation...")

        # Créer fichier marker d'installation
        marker_file = self.user_data_dir / '.installed'
        import datetime
        marker_file.write_text(json.dumps({
            "version": APP_VERSION,
            "install_date": datetime.datetime.now().isoformat(),
            "install_dir": str(self.install_dir),
            "user_data_dir": str(self.user_data_dir)
        }, indent=2))

        # Nettoyer fichiers temporaires
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir, ignore_errors=True)

    def check_for_updates(self) -> Optional[str]:
        """
        Vérifie si une mise à jour est disponible.
        Retourne la nouvelle version si disponible, None sinon.
        """
        try:
            # URL de l'API GitHub releases (exemple)
            api_url = "https://api.github.com/repos/theermite/hibiki/releases/latest"

            with urllib.request.urlopen(api_url, timeout=5) as response:
                data = json.loads(response.read().decode())
                latest_version = data.get("tag_name", "").lstrip("v")

                if latest_version and latest_version != APP_VERSION:
                    return latest_version

        except Exception as e:
            logger.debug(f"Vérification mise à jour échouée: {e}")

        return None
