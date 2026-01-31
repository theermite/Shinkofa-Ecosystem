"""
Hibiki Installer GUI - Interface Native Windows
Utilise ctypes et les API Windows pour une interface simple et fiable
Pas de dépendance tkinter = compatible PyInstaller

Copyright © 2025 La Voie Shinkofa
"""

import ctypes
from ctypes import wintypes
import threading
import sys
import time
from pathlib import Path

# Constantes Windows
MB_OK = 0x0
MB_OKCANCEL = 0x1
MB_ICONINFORMATION = 0x40
MB_ICONERROR = 0x10
MB_ICONWARNING = 0x30
IDOK = 1
IDCANCEL = 2

class NativeInstallerGUI:
    """Interface graphique native Windows pour l'installation."""

    def __init__(self, installer_instance):
        self.installer = installer_instance
        self.is_installing = False
        self.current_step = ""
        self.progress = 0

    def show_message(self, title: str, message: str, icon=MB_ICONINFORMATION):
        """Affiche une MessageBox Windows."""
        return ctypes.windll.user32.MessageBoxW(0, message, title, MB_OK | icon)

    def show_question(self, title: str, message: str):
        """Affiche une boîte de dialogue Oui/Non."""
        result = ctypes.windll.user32.MessageBoxW(0, message, title, MB_OKCANCEL | MB_ICONWARNING)
        return result == IDOK

    def update_console(self, message: str):
        """Affiche un message dans la console."""
        print(f"  {message}")

    def run_installation(self):
        """Exécute l'installation avec mise à jour console."""
        steps = [
            ("Création des dossiers", self.installer.create_directories, 10),
            ("Téléchargement Python embarqué", self.installer.download_python_embedded, 30),
            ("Installation de pip", self.installer.install_pip, 40),
            ("Copie des fichiers", self.installer.copy_application_files, 50),
            ("Installation des dépendances", self.installer.install_dependencies, 70),
            ("Configuration", self.installer.create_initial_config, 80),
            ("Préparation des modèles", self.installer.download_whisperx_models, 85),
            ("Création des raccourcis", self.installer.create_shortcuts, 95),
            ("Finalisation", self.installer.finalize_installation, 100),
        ]

        print("")
        print("=" * 60)
        print("  INSTALLATION DE HIBIKI")
        print("  Version 1.0.0")
        print("  La Voie Shinkofa")
        print("=" * 60)
        print("")

        try:
            for step_name, step_func, progress in steps:
                self.current_step = step_name
                self.progress = progress

                print(f"[{progress}%] {step_name}...")

                try:
                    step_func()
                    print(f"  ✓ {step_name} terminé")
                except Exception as e:
                    print(f"  ✗ Erreur: {e}")
                    raise

            # Installation terminée
            print("")
            print("=" * 60)
            print("  HIBIKI INSTALLÉ AVEC SUCCÈS !")
            print("=" * 60)
            print("")

            self.show_message(
                "Installation Terminée",
                "Hibiki a été installé avec succès !\n\n"
                "L'application va maintenant se lancer.\n\n"
                "Vous pouvez aussi la lancer depuis :\n"
                "• Menu Démarrer > Hibiki\n"
                "• Raccourci Bureau (si créé)"
            )

            return True

        except Exception as e:
            print(f"\n✗ L'installation a échoué: {e}")
            import traceback
            traceback.print_exc()

            self.show_message(
                "Erreur d'Installation",
                f"L'installation a échoué.\n\n"
                f"Erreur : {str(e)}\n\n"
                f"Consultez la console pour plus de détails.",
                MB_ICONERROR
            )

            return False

    def run(self):
        """Lance l'installation."""
        # Demander confirmation
        response = self.show_question(
            "Installation Hibiki",
            "Bienvenue dans l'installateur Hibiki !\n\n"
            "🎙️ Hibiki - Dictée Vocale Locale\n\n"
            "Cette application va installer :\n"
            "• Python 3.11 embarqué\n"
            "• Toutes les dépendances (WhisperX, PyTorch, etc.)\n"
            "• Configuration par défaut\n"
            "• Raccourcis Windows\n\n"
            "L'installation prend environ 5-10 minutes.\n\n"
            "Continuer l'installation ?"
        )

        if not response:
            print("Installation annulée par l'utilisateur.")
            sys.exit(0)

        # Lancer l'installation
        success = self.run_installation()

        if not success:
            input("\nAppuyez sur Entrée pour quitter...")
            sys.exit(1)

        return True
