"""
Hibiki Installer GUI - Interface Graphique d'Installation
Remplace l'interface console par une fenêtre moderne et rassurante

Copyright © 2025 La Voie Shinkofa
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import sys
from pathlib import Path

class InstallerGUI:
    """Interface graphique pour l'installation de Hibiki."""

    def __init__(self, installer_instance):
        self.installer = installer_instance
        self.root = tk.Tk()
        self.root.title("Installation Hibiki")
        self.root.geometry("600x500")
        self.root.resizable(False, False)

        # Centrer la fenêtre
        self.center_window()

        # Configuration du style
        self.setup_styles()

        # Créer l'interface
        self.create_widgets()

        # Variables
        self.installation_thread = None
        self.is_installing = False

    def center_window(self):
        """Centre la fenêtre sur l'écran."""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')

    def setup_styles(self):
        """Configure les styles de l'interface."""
        style = ttk.Style()
        style.theme_use('clam')

        # Couleurs Shinkofa
        shinkofa_purple = '#8A2BE2'  # BlueViolet
        shinkofa_light = '#D8BFD8'   # Thistle
        shinkofa_dark = '#4B0082'    # Indigo

        # Style pour les boutons
        style.configure(
            'Hibiki.TButton',
            background=shinkofa_purple,
            foreground='white',
            borderwidth=0,
            font=('Segoe UI', 10, 'bold'),
            padding=10
        )

        # Style pour la progressbar
        style.configure(
            'Hibiki.Horizontal.TProgressbar',
            background=shinkofa_purple,
            troughcolor='#E0E0E0',
            borderwidth=0,
            thickness=20
        )

    def create_widgets(self):
        """Crée tous les widgets de l'interface."""

        # Frame principale
        main_frame = tk.Frame(self.root, bg='white')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        # Header avec icône et titre
        header_frame = tk.Frame(main_frame, bg='white')
        header_frame.pack(fill=tk.X, pady=(0, 20))

        # Emoji microphone (grand)
        emoji_label = tk.Label(
            header_frame,
            text="🎙️",
            font=('Segoe UI Emoji', 48),
            bg='white'
        )
        emoji_label.pack()

        # Titre
        title_label = tk.Label(
            header_frame,
            text="Hibiki - Dictée Vocale",
            font=('Segoe UI', 20, 'bold'),
            bg='white',
            fg='#333333'
        )
        title_label.pack()

        # Sous-titre
        subtitle_label = tk.Label(
            header_frame,
            text="Installation Automatique",
            font=('Segoe UI', 12),
            bg='white',
            fg='#666666'
        )
        subtitle_label.pack()

        # Ligne de séparation
        separator = ttk.Separator(main_frame, orient='horizontal')
        separator.pack(fill=tk.X, pady=10)

        # Message de bienvenue
        self.welcome_label = tk.Label(
            main_frame,
            text="Bienvenue dans l'installateur Hibiki !\n\n"
                 "Cette application de dictée vocale 100% locale va s'installer\n"
                 "automatiquement sur votre ordinateur.\n\n"
                 "L'installation prend environ 5-10 minutes.",
            font=('Segoe UI', 10),
            bg='white',
            fg='#333333',
            justify=tk.CENTER
        )
        self.welcome_label.pack(pady=20)

        # Frame pour les étapes
        self.steps_frame = tk.Frame(main_frame, bg='white')
        self.steps_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        # Label d'étape actuelle
        self.current_step_label = tk.Label(
            self.steps_frame,
            text="Prêt à installer",
            font=('Segoe UI', 11, 'bold'),
            bg='white',
            fg='#8A2BE2',
            anchor='w'
        )
        self.current_step_label.pack(fill=tk.X, pady=(0, 10))

        # Zone de texte pour les logs
        log_frame = tk.Frame(self.steps_frame, bg='white')
        log_frame.pack(fill=tk.BOTH, expand=True)

        # Scrollbar
        scrollbar = tk.Scrollbar(log_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Text widget pour logs
        self.log_text = tk.Text(
            log_frame,
            height=10,
            font=('Consolas', 9),
            bg='#F5F5F5',
            fg='#333333',
            wrap=tk.WORD,
            yscrollcommand=scrollbar.set,
            state=tk.DISABLED,
            relief=tk.FLAT,
            padx=10,
            pady=10
        )
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.log_text.yview)

        # Barre de progression
        self.progress = ttk.Progressbar(
            main_frame,
            style='Hibiki.Horizontal.TProgressbar',
            mode='determinate',
            maximum=100
        )
        self.progress.pack(fill=tk.X, pady=(10, 5))

        # Label de progression
        self.progress_label = tk.Label(
            main_frame,
            text="0%",
            font=('Segoe UI', 9),
            bg='white',
            fg='#666666'
        )
        self.progress_label.pack()

        # Boutons
        button_frame = tk.Frame(main_frame, bg='white')
        button_frame.pack(fill=tk.X, pady=(20, 0))

        self.install_button = ttk.Button(
            button_frame,
            text="Installer",
            style='Hibiki.TButton',
            command=self.start_installation
        )
        self.install_button.pack(side=tk.RIGHT, padx=(10, 0))

        self.cancel_button = ttk.Button(
            button_frame,
            text="Annuler",
            command=self.cancel_installation
        )
        self.cancel_button.pack(side=tk.RIGHT)

    def log(self, message: str, level: str = "INFO"):
        """Affiche un message dans la zone de logs."""
        self.log_text.config(state=tk.NORMAL)

        # Couleur selon niveau
        if level == "ERROR":
            tag = "error"
            self.log_text.tag_config(tag, foreground='red')
        elif level == "SUCCESS":
            tag = "success"
            self.log_text.tag_config(tag, foreground='green')
        elif level == "WARNING":
            tag = "warning"
            self.log_text.tag_config(tag, foreground='orange')
        else:
            tag = "info"
            self.log_text.tag_config(tag, foreground='#333333')

        self.log_text.insert(tk.END, f"{message}\n", tag)
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

        # Force update
        self.root.update_idletasks()

    def update_step(self, step_name: str, progress: int):
        """Met à jour l'étape actuelle et la progression."""
        self.current_step_label.config(text=step_name)
        self.progress['value'] = progress
        self.progress_label.config(text=f"{progress}%")
        self.root.update_idletasks()

    def start_installation(self):
        """Démarre l'installation dans un thread séparé."""
        if self.is_installing:
            return

        self.is_installing = True
        self.install_button.config(state=tk.DISABLED)
        self.welcome_label.pack_forget()

        # Lancer dans un thread
        self.installation_thread = threading.Thread(target=self.run_installation)
        self.installation_thread.daemon = True
        self.installation_thread.start()

    def run_installation(self):
        """Exécute l'installation avec mise à jour de la GUI."""
        steps = [
            ("Création des dossiers", self.installer.create_directories, 10),
            ("Téléchargement Python embarqué", self.installer.download_python_embedded, 20),
            ("Installation de pip", self.installer.install_pip, 30),
            ("Copie des fichiers", self.installer.copy_application_files, 40),
            ("Installation des dépendances", self.installer.install_dependencies, 60),
            ("Configuration", self.installer.create_initial_config, 70),
            ("Préparation des modèles", self.installer.download_whisperx_models, 80),
            ("Création des raccourcis", self.installer.create_shortcuts, 90),
            ("Finalisation", self.installer.finalize_installation, 100),
        ]

        try:
            for step_name, step_func, progress in steps:
                self.update_step(step_name, progress - 5)
                self.log(f"[{progress}%] {step_name}...")

                try:
                    step_func()
                    self.log(f"✓ {step_name} terminé", "SUCCESS")
                except Exception as e:
                    self.log(f"✗ Erreur: {e}", "ERROR")
                    raise

                self.update_step(step_name, progress)

            # Installation terminée
            self.update_step("Installation terminée !", 100)
            self.log("\n" + "="*50, "SUCCESS")
            self.log("HIBIKI INSTALLÉ AVEC SUCCÈS !", "SUCCESS")
            self.log("="*50 + "\n", "SUCCESS")

            self.installation_complete()

        except Exception as e:
            self.log(f"\n✗ L'installation a échoué: {e}", "ERROR")
            self.installation_failed()

    def installation_complete(self):
        """Appelé quand l'installation est terminée avec succès."""
        self.install_button.config(state=tk.DISABLED)
        self.cancel_button.config(text="Fermer", command=self.close_and_launch)

        # Afficher message de succès
        messagebox.showinfo(
            "Installation Terminée",
            "Hibiki a été installé avec succès !\n\n"
            "L'application va maintenant se lancer.\n\n"
            "Vous pouvez aussi la lancer depuis :\n"
            "- Menu Démarrer > Hibiki\n"
            "- Raccourci Bureau (si créé)"
        )

        self.close_and_launch()

    def installation_failed(self):
        """Appelé quand l'installation a échoué."""
        self.install_button.config(state=tk.NORMAL, text="Réessayer")
        self.cancel_button.config(text="Quitter")

        messagebox.showerror(
            "Erreur d'Installation",
            "L'installation a échoué.\n\n"
            "Consultez les logs ci-dessus pour plus de détails.\n\n"
            "Vous pouvez réessayer ou contacter le support."
        )

    def cancel_installation(self):
        """Annule l'installation."""
        if self.is_installing:
            response = messagebox.askyesno(
                "Annuler l'installation",
                "Êtes-vous sûr de vouloir annuler l'installation ?\n\n"
                "L'installation sera interrompue."
            )
            if not response:
                return

        self.root.quit()
        sys.exit(0)

    def close_and_launch(self):
        """Ferme l'installateur et lance l'application."""
        self.root.quit()
        # La suite est gérée par hibiki_launcher.py

    def run(self):
        """Lance la boucle principale de l'interface."""
        self.root.mainloop()
