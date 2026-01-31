# Best Practices - Desktop Apps (Python CustomTkinter + Electron)

<metadata>
Type: Best Practices Desktop Applications
Owner: Jay The Ermite (TAKUMI Agent)
Version: 1.0
Updated: 2025-12-11
Projects: WinAdminTE (Python CustomTkinter), Future Electron apps
Platforms: Windows 11, Linux (Kubuntu)
</metadata>

## 🎯 Stack Desktop Cross-Platform

<stack_desktop>
### Python (CustomTkinter) - Priorité 1

**Avantages** :
- ✅ Natif Python (pas de Node.js requis)
- ✅ Léger (~50MB exe avec PyInstaller)
- ✅ Moderne (dark mode natif, animations)
- ✅ Cross-platform (Windows, Linux, macOS)
- ✅ Facile à maintenir (Python pur)

**Inconvénients** :
- ❌ UI moins riche que Electron/React
- ❌ Pas de hot-reload (rebuild à chaque modif)

**Use Cases** :
- Outils système (WinAdminTE)
- Apps utilitaires
- Dashboards simples
- Scripts avec GUI

---

### Electron (React + TypeScript) - Priorité 2

**Avantages** :
- ✅ UI riche (React ecosystem)
- ✅ Hot-reload dev rapide
- ✅ Web tech familières (HTML/CSS/JS)
- ✅ Écosystème mature (plugins, libs)

**Inconvénients** :
- ❌ Lourd (~150-200MB exe)
- ❌ Consommation mémoire élevée
- ❌ Complexité setup (Webpack, Electron Forge)

**Use Cases** :
- Apps complexes (Personal Dashboard)
- IDEs, éditeurs
- Apps riches en médias
- Ports d'apps web existantes
</stack_desktop>

## 🐍 CustomTkinter Best Practices (WinAdminTE Lessons)

<customtkinter_patterns>
### Architecture MVC Standard

```
desktop-app/
├── main.py                 # Entry point
├── app.py                  # Application class principale
├── core/                   # Business logic (Models)
│   ├── system_ops.py       # Opérations système
│   ├── tweaks.py           # Registry, configuration
│   └── package_mgr.py      # Package management
├── gui/                    # Views & Controllers
│   ├── frames/             # Frames (écrans)
│   │   ├── home.py
│   │   ├── apps.py
│   │   ├── configuration.py
│   │   └── system.py
│   └── widgets/            # Composants réutilisables
│       ├── card.py
│       ├── button.py
│       └── modal.py
├── resources/              # Assets
│   ├── icons/
│   └── images/
├── tests/                  # Tests unitaires
├── build_exe.bat           # Script build Windows
├── app.spec                # PyInstaller spec
├── requirements.txt
└── README.md
```

### Application Principale (app.py)

```python
import customtkinter as ctk
from gui.frames.home import HomeFrame
from gui.frames.apps import AppsFrame
from gui.frames.configuration import ConfigurationFrame
from gui.frames.system import SystemFrame
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class App(ctk.CTk):
    """Application principale CustomTkinter."""

    def __init__(self):
        super().__init__()

        # Window config
        self.title("Mon App Desktop")
        self.geometry("1200x800")

        # Theme
        ctk.set_appearance_mode("dark")  # "dark", "light", "system"
        ctk.set_default_color_theme("blue")  # "blue", "green", "dark-blue"

        # Grid layout
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        # Sidebar navigation
        self.create_sidebar()

        # Main frame container
        self.main_frame = None
        self.current_frame_name = None

        # Load home frame by default
        self.show_frame("home")

    def create_sidebar(self):
        """Crée sidebar navigation."""
        self.sidebar = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(10, weight=1)  # Push buttons to top

        # Logo
        self.logo_label = ctk.CTkLabel(
            self.sidebar,
            text="Mon App",
            font=ctk.CTkFont(size=24, weight="bold")
        )
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 30))

        # Navigation buttons
        self.nav_buttons = {}

        buttons = [
            ("home", "Accueil", "🏠"),
            ("apps", "Applications", "📦"),
            ("config", "Configuration", "⚙️"),
            ("system", "Système", "💻"),
        ]

        for i, (key, label, icon) in enumerate(buttons):
            btn = ctk.CTkButton(
                self.sidebar,
                text=f"{icon} {label}",
                command=lambda k=key: self.show_frame(k),
                anchor="w",
                height=40
            )
            btn.grid(row=i+1, column=0, padx=20, pady=10, sticky="ew")
            self.nav_buttons[key] = btn

    def show_frame(self, frame_name: str):
        """
        Affiche frame demandé, détruit frame actuel.

        Args:
            frame_name: Nom du frame ("home", "apps", "config", "system")
        """
        # Destroy current frame
        if self.main_frame:
            self.main_frame.destroy()

        # Highlight active button
        for key, btn in self.nav_buttons.items():
            if key == frame_name:
                btn.configure(fg_color=("gray70", "gray30"))  # Active color
            else:
                btn.configure(fg_color=("gray85", "gray25"))  # Default color

        # Create new frame
        self.current_frame_name = frame_name

        if frame_name == "home":
            self.main_frame = HomeFrame(self)
        elif frame_name == "apps":
            self.main_frame = AppsFrame(self)
        elif frame_name == "config":
            self.main_frame = ConfigurationFrame(self)
        elif frame_name == "system":
            self.main_frame = SystemFrame(self)

        if self.main_frame:
            self.main_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)

    def show_error(self, title: str, message: str):
        """Affiche modal erreur (thread-safe)."""
        dialog = ctk.CTkInputDialog(
            text=message,
            title=title
        )

    def show_success(self, title: str, message: str):
        """Affiche modal succès (thread-safe)."""
        dialog = ctk.CTkInputDialog(
            text=message,
            title=title
        )

if __name__ == "__main__":
    app = App()
    app.mainloop()
```

### Frame Pattern (gui/frames/configuration.py)

```python
import customtkinter as ctk
from core.tweaks import SystemTweaks, TaskbarAlignment
import threading
import logging

logger = logging.getLogger(__name__)

class ConfigurationFrame(ctk.CTkFrame):
    """Frame configuration système (exemple WinAdminTE)."""

    def __init__(self, parent):
        super().__init__(parent)

        self.app_ref = parent  # Référence à App principale
        self.tweaks = SystemTweaks()

        # Grid layout
        self.grid_columnconfigure(0, weight=1)

        # Title
        self.title = ctk.CTkLabel(
            self,
            text="⚙️ Configuration Système",
            font=ctk.CTkFont(size=28, weight="bold")
        )
        self.title.grid(row=0, column=0, pady=(0, 20), sticky="w")

        # Taskbar section
        self.create_taskbar_section()

        # User section
        self.create_user_section()

    def create_taskbar_section(self):
        """Section configuration taskbar."""
        section = ctk.CTkFrame(self)
        section.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        section.grid_columnconfigure(1, weight=1)

        # Section title
        title = ctk.CTkLabel(
            section,
            text="Barre des tâches Windows 11",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        title.grid(row=0, column=0, columnspan=2, pady=(10, 15), sticky="w", padx=15)

        # Taskbar alignment
        align_label = ctk.CTkLabel(section, text="Alignement :")
        align_label.grid(row=1, column=0, padx=15, pady=5, sticky="w")

        self.align_var = ctk.StringVar(value="left")
        self.align_dropdown = ctk.CTkOptionMenu(
            section,
            variable=self.align_var,
            values=["left", "center"]
        )
        self.align_dropdown.grid(row=1, column=1, padx=15, pady=5, sticky="ew")

        # Widgets toggle
        widgets_label = ctk.CTkLabel(section, text="Widgets :")
        widgets_label.grid(row=2, column=0, padx=15, pady=5, sticky="w")

        self.widgets_var = ctk.StringVar(value="disabled")
        self.widgets_switch = ctk.CTkSwitch(
            section,
            text="Activé",
            variable=self.widgets_var,
            onvalue="enabled",
            offvalue="disabled"
        )
        self.widgets_switch.grid(row=2, column=1, padx=15, pady=5, sticky="w")

        # Apply button
        self.apply_btn = ctk.CTkButton(
            section,
            text="Appliquer les modifications",
            command=self.apply_taskbar_tweaks,
            height=40
        )
        self.apply_btn.grid(row=3, column=0, columnspan=2, padx=15, pady=15, sticky="ew")

    def create_user_section(self):
        """Section gestion utilisateurs."""
        section = ctk.CTkFrame(self)
        section.grid(row=2, column=0, sticky="ew", pady=(0, 20))
        section.grid_columnconfigure(1, weight=1)

        # Section title
        title = ctk.CTkLabel(
            section,
            text="Gestion Utilisateurs",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        title.grid(row=0, column=0, columnspan=2, pady=(10, 15), sticky="w", padx=15)

        # Current user
        current_user = self.tweaks.get_current_username()
        user_label = ctk.CTkLabel(section, text=f"Utilisateur actuel : {current_user}")
        user_label.grid(row=1, column=0, columnspan=2, padx=15, pady=5, sticky="w")

        # Rename user section
        rename_label = ctk.CTkLabel(section, text="Renommer utilisateur :")
        rename_label.grid(row=2, column=0, padx=15, pady=(15, 5), sticky="w")

        # Old name dropdown
        self.users_var = ctk.StringVar()
        self.users_dropdown = ctk.CTkOptionMenu(
            section,
            variable=self.users_var,
            values=["Chargement..."]
        )
        self.users_dropdown.grid(row=3, column=0, padx=15, pady=5, sticky="ew")

        # Load users in thread (avoid blocking UI)
        threading.Thread(target=self.load_users, daemon=True).start()

        # New name entry
        self.new_name_entry = ctk.CTkEntry(section, placeholder_text="Nouveau nom")
        self.new_name_entry.grid(row=3, column=1, padx=15, pady=5, sticky="ew")

        # Rename button
        self.rename_btn = ctk.CTkButton(
            section,
            text="Renommer",
            command=self.rename_user,
            height=40
        )
        self.rename_btn.grid(row=4, column=0, columnspan=2, padx=15, pady=15, sticky="ew")

    def load_users(self):
        """⚠️ THREAD-SAFE : Charge liste utilisateurs."""
        try:
            users = self.tweaks.get_local_users()
            if users:
                # Update GUI from thread (use after())
                self.after(0, lambda: self.users_dropdown.configure(values=users))
                self.after(0, lambda: self.users_var.set(users[0]))
            else:
                self.after(0, lambda: self.users_dropdown.configure(values=["Aucun utilisateur"]))
        except Exception as e:
            logger.error(f"Error loading users: {e}")
            # ⚠️ CRITICAL FIX : Capture error_msg BEFORE lambda!
            error_msg = str(e)
            self.after(0, lambda: self.app_ref.show_error("Erreur", error_msg))

    def apply_taskbar_tweaks(self):
        """⚠️ THREAD-SAFE : Applique tweaks taskbar."""
        # Disable button pendant traitement
        self.apply_btn.configure(state="disabled", text="Application...")

        def task():
            try:
                # Get values
                alignment = TaskbarAlignment.LEFT if self.align_var.get() == "left" else TaskbarAlignment.CENTER
                widgets_enabled = self.widgets_var.get() == "enabled"

                # Apply tweaks
                success, messages = self.tweaks.apply_taskbar_tweaks(
                    alignment=alignment,
                    widgets_enabled=widgets_enabled
                )

                # Update GUI from thread
                if success:
                    msg = "\n".join(messages)
                    self.after(0, lambda: self.app_ref.show_success("Succès", msg))
                else:
                    msg = "\n".join(messages)
                    self.after(0, lambda: self.app_ref.show_error("Erreur", msg))

            except Exception as e:
                logger.error(f"Error applying tweaks: {e}")
                error_msg = str(e)  # Capture BEFORE lambda!
                self.after(0, lambda: self.app_ref.show_error("Erreur", error_msg))

            finally:
                # Re-enable button
                self.after(0, lambda: self.apply_btn.configure(state="normal", text="Appliquer les modifications"))

        # Run in thread
        threading.Thread(target=task, daemon=True).start()

    def rename_user(self):
        """⚠️ THREAD-SAFE : Renomme utilisateur."""
        old_name = self.users_var.get()
        new_name = self.new_name_entry.get()

        if not new_name:
            self.app_ref.show_error("Erreur", "Le nouveau nom ne peut pas être vide")
            return

        # Disable button
        self.rename_btn.configure(state="disabled", text="Renommage...")

        def task():
            try:
                success, message = self.tweaks.rename_user(old_name, new_name)

                if success:
                    self.after(0, lambda: self.app_ref.show_success("Succès", message))
                    # Reload users
                    self.load_users()
                else:
                    # Capture message BEFORE lambda!
                    msg = message
                    self.after(0, lambda: self.app_ref.show_error("Erreur", msg))

            except Exception as e:
                logger.error(f"Error renaming user: {e}")
                error_msg = str(e)
                self.after(0, lambda: self.app_ref.show_error("Erreur", error_msg))

            finally:
                self.after(0, lambda: self.rename_btn.configure(state="normal", text="Renommer"))

        threading.Thread(target=task, daemon=True).start()
```

### ⚠️ PATTERN CRITIQUE : Lambda Scope Fix

**Problème** :
```python
# ❌ MAUVAIS : Variable "e" perd scope dans lambda
except Exception as e:
    self.after(0, lambda: self.app_ref.show_error("Erreur", str(e)))
    # → Erreur : "e" n'existe plus quand lambda s'exécute!
```

**Solution** :
```python
# ✅ BON : Capture valeur AVANT lambda
except Exception as e:
    error_msg = str(e)  # Capture d'abord!
    self.after(0, lambda: self.app_ref.show_error("Erreur", error_msg))
    # → "error_msg" est capturé avec sa valeur
```

**Explication** :
- Lambda crée closure qui capture **références** variables, pas valeurs
- Variable `e` existe seulement dans scope `except`
- Quand lambda s'exécute (dans thread principal), `e` n'existe plus
- Solution : Capturer valeur dans variable intermédiaire **avant** lambda

**Généralisation** :
```python
# ✅ Pattern à suivre SYSTÉMATIQUEMENT
def some_thread_task():
    try:
        result = some_long_operation()
        # Capture result value
        result_value = result
        self.after(0, lambda: self.update_ui(result_value))
    except Exception as e:
        # Capture error message
        error_msg = str(e)
        self.after(0, lambda: self.show_error(error_msg))
```
</customtkinter_patterns>

## 🪟 Windows-Specific Patterns

<windows_patterns>
### PowerShell Commands (Remplace WMIC Déprécié)

**⚠️ WMIC est DÉPRÉCIÉ dans Windows 11** → Utiliser PowerShell

```python
import subprocess

class WindowsOps:
    """Opérations Windows via PowerShell."""

    @staticmethod
    def run_powershell(command: str) -> tuple[bool, str]:
        """
        Exécute commande PowerShell.

        Args:
            command: Commande PowerShell

        Returns:
            (success, output)
        """
        try:
            result = subprocess.run(
                ["powershell", "-Command", command],
                capture_output=True,
                text=True,
                timeout=10,
                creationflags=subprocess.CREATE_NO_WINDOW  # Pas de fenêtre CMD
            )

            if result.returncode == 0:
                return True, result.stdout.strip()
            else:
                return False, result.stderr.strip()

        except subprocess.TimeoutExpired:
            return False, "Timeout : commande trop longue"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_local_users() -> list[str]:
        """Récupère liste utilisateurs locaux (PowerShell)."""
        cmd = 'Get-LocalUser | Select-Object -ExpandProperty Name'
        success, output = WindowsOps.run_powershell(cmd)

        if success:
            users = [line.strip() for line in output.split("\n") if line.strip()]
            return users
        return []

    @staticmethod
    def rename_computer(new_name: str) -> tuple[bool, str]:
        """Renomme ordinateur (PowerShell)."""
        cmd = f'Rename-Computer -NewName "{new_name}" -Force'
        return WindowsOps.run_powershell(cmd)

    @staticmethod
    def check_admin_rights() -> bool:
        """Vérifie si app lancée en Admin."""
        try:
            import ctypes
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except:
            return False
```

### Registry Operations (winreg)

```python
import winreg

class RegistryManager:
    """Gestion registry Windows."""

    @staticmethod
    def set_value(key_path: str, value_name: str, value: int) -> tuple[bool, str]:
        """
        Set registry value (HKEY_CURRENT_USER).

        Args:
            key_path: Chemin clé (ex: r"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced")
            value_name: Nom valeur (ex: "TaskbarAl")
            value: Valeur DWORD (int)

        Returns:
            (success, message)
        """
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                key_path,
                0,
                winreg.KEY_SET_VALUE
            )
            winreg.SetValueEx(key, value_name, 0, winreg.REG_DWORD, value)
            winreg.CloseKey(key)
            return True, f"Valeur {value_name} définie à {value}"

        except FileNotFoundError:
            # Clé n'existe pas → créer
            try:
                key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
                winreg.SetValueEx(key, value_name, 0, winreg.REG_DWORD, value)
                winreg.CloseKey(key)
                return True, f"Clé créée et valeur définie"
            except PermissionError:
                return False, "Accès refusé. Relancez en Administrateur."
            except Exception as e:
                return False, f"Erreur création clé : {e}"

        except PermissionError:
            return False, "Accès refusé. Relancez en Administrateur."
        except Exception as e:
            return False, f"Erreur : {e}"

    @staticmethod
    def get_value(key_path: str, value_name: str) -> int | None:
        """Get registry value."""
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                key_path,
                0,
                winreg.KEY_READ
            )
            value, _ = winreg.QueryValueEx(key, value_name)
            winreg.CloseKey(key)
            return value
        except:
            return None
```
</windows_patterns>

## 📦 PyInstaller Build Process

<pyinstaller_build>
### Spec File (app.spec)

```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main.py'],  # Entry point
    pathex=[],
    binaries=[],
    datas=[
        ('resources', 'resources'),  # Include resources folder
    ],
    hiddenimports=[
        'customtkinter',
        'PIL',
        'PIL._tkinter_finder',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='MonApp',  # Nom exe
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Pas de console (GUI app)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='resources/icon.ico'  # Icon Windows
)
```

### Build Script (build_exe.bat)

```batch
@echo off
echo ========================================
echo  Build EXE - Mon App
echo ========================================
echo.

echo [1/4] Removing obsolete packages...
python -m pip uninstall pathlib -y

echo.
echo [2/4] Installing/Updating dependencies...
python -m pip install --upgrade pyinstaller customtkinter pillow==11.3.0

echo.
echo [3/4] Cleaning previous builds...
if exist "build" rd /s /q build
if exist "dist" rd /s /q dist

echo.
echo [4/4] Building executable...
python -m PyInstaller app.spec --clean --noconfirm

echo.
if exist "dist\MonApp.exe" (
    echo ========================================
    echo  BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Executable: dist\MonApp.exe
    echo.
) else (
    echo ========================================
    echo  BUILD FAILED
    echo ========================================
    echo Check errors above.
    echo.
)

pause
```

### Common PyInstaller Issues

**1. Module Not Found (hiddenimports)** :
```python
# Dans spec file, ajouter à hiddenimports :
hiddenimports=[
    'customtkinter',
    'PIL',
    'PIL._tkinter_finder',
    'pkg_resources.py2_warn',  # Si warning pkg_resources
]
```

**2. Resources Not Found** :
```python
# Dans spec file, inclure dossier resources :
datas=[
    ('resources', 'resources'),
    ('config.json', '.'),  # Fichier individuel
]
```

**3. Exe trop lourd (UPX)** :
```bash
# Installer UPX (compresse exe ~40%)
# Download : https://upx.github.io/
# Placer upx.exe dans PATH ou dossier projet

# Dans spec file :
upx=True,
upx_exclude=[],
```

**4. Antivirus faux-positif** :
- Signer exe avec certificat code signing (payant)
- OU ajouter exception dans antivirus
- OU uploader sur VirusTotal pour whitelist
</pyinstaller_build>

## ⚡ Electron Best Practices (Future)

<electron_patterns>
### Structure Recommandée

```
electron-app/
├── src/
│   ├── main/               # Electron main process
│   │   └── main.ts
│   ├── preload/            # Preload scripts
│   │   └── preload.ts
│   └── renderer/           # React app
│       ├── components/
│       ├── pages/
│       └── App.tsx
├── resources/              # Icons, assets
├── build/                  # Build output
├── package.json
├── electron.vite.config.ts
└── tsconfig.json
```

### Main Process (src/main/main.ts)

```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,  // Security
      nodeIntegration: false,   // Security
    },
  });

  // Load React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');  // Vite dev server
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### IPC Communication (Secure)

```typescript
// src/preload/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose seulement fonctions sécurisées
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  saveFile: (data: string) => ipcRenderer.invoke('save-file', data),
});

// src/main/main.ts
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    version: process.version,
  };
});

// src/renderer/App.tsx (React)
declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      saveFile: (data: string) => Promise<void>;
    };
  }
}

function App() {
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    window.electronAPI.getSystemInfo().then(setSystemInfo);
  }, []);

  return <div>{JSON.stringify(systemInfo)}</div>;
}
```
</electron_patterns>

## ✅ Checklist Pré-Build Desktop

<checklist_build>
### Python CustomTkinter

- [ ] **Imports vérifiés** : Tous modules utilisés dans requirements.txt
- [ ] **Paths absolus** : Resources chargés via `os.path.join(os.path.dirname(__file__), 'resources', ...)`
- [ ] **Threading correct** : Opérations longues dans threads, GUI updates via `self.after()`
- [ ] **Lambda scope fix** : Variables capturées AVANT lambda dans threads
- [ ] **Error handling** : Try/except sur toutes opérations I/O, subprocess
- [ ] **Logging** : Logger configuré (INFO level minimum)
- [ ] **Admin rights** : Check si requis (registry, system ops)
- [ ] **PowerShell > WMIC** : Commandes Windows 11 compatible
- [ ] **Spec file complet** : hiddenimports, datas, icon définis
- [ ] **Build script testé** : build_exe.bat exécute sans erreur
- [ ] **Exe testé** : Lance sans Python installé, toutes features fonctionnelles

### Electron

- [ ] **Security** : contextIsolation=true, nodeIntegration=false
- [ ] **IPC sécurisé** : contextBridge expose seulement fonctions nécessaires
- [ ] **Build config** : electron-builder ou electron-forge configuré
- [ ] **Auto-update** : electron-updater intégré si applicable
- [ ] **Code signing** : Certificat configuré (évite warnings macOS/Windows)
- [ ] **Tests E2E** : Spectron ou Playwright tests passent
</checklist_build>

---

**Version 1.0 | 2025-12-11 | TAKUMI Best Practices Desktop Apps**
**Projet référence** : WinAdminTE (CustomTkinter, Windows 11)
