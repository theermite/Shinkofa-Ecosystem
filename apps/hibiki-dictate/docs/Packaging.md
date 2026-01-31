# 📦 Hibiki - Guide Packaging & Distribution

Ce guide explique comment créer un **installateur Windows professionnel** pour Hibiki.

---

## 🎯 Résultat Final

**Un seul fichier `.exe` d'installation** que n'importe qui peut utiliser :
1. Double-clic sur `Hibiki-Setup-1.0.0.exe`
2. Assistant d'installation graphique
3. Hibiki installé et prêt à l'emploi
4. Aucune connaissance technique requise

---

## 📋 Prérequis Développeur

### Outils Nécessaires

1. **Python 3.11+** avec environnement virtuel Hibiki configuré
2. **PyInstaller** (pour créer l'exécutable)
3. **Inno Setup 6+** (pour créer l'installateur)
   - Télécharger : https://jrsoftware.org/isdl.php
   - Gratuit et open-source
   - Installation standard (Next → Next → Install)

### Temps Requis

- **Première fois** : 15-20 minutes
- **Builds suivants** : 5-10 minutes

---

## 🚀 Procédure Complète

### Étape 1 : Préparer l'Icône (Optionnel mais Recommandé)

**Si tu as créé une icône Shinkofa** :

1. Convertir en `.ico` (256x256, 128x128, 64x64, 32x32, 16x16)
   - Utilise un outil comme : https://convertio.co/png-ico/
   - Ou : https://www.icoconverter.com/

2. Place l'icone ici :
   ```
   assets/hibiki_icon.ico
   ```

**Si pas d'icône** :
- L'installateur utilisera l'icône par défaut Windows
- Tu pourras l'ajouter plus tard et rebuild

### Étape 2 : Créer le Fichier de Version (Optionnel)

Cree `version_info.txt` pour les metadonnees Windows :

```python
# Script Python pour générer version_info.txt
import PyInstaller.utils.win32.versioninfo as vi

version_info = vi.VSVersionInfo(
    ffi=vi.FixedFileInfo(
        filevers=(1, 0, 0, 0),
        prodvers=(1, 0, 0, 0),
        mask=0x3f,
        flags=0x0,
        OS=0x40004,
        fileType=0x1,
        subtype=0x0,
        date=(0, 0)
    ),
    kids=[
        vi.StringFileInfo([
            vi.StringTable(
                '040904B0',
                [
                    vi.StringStruct('CompanyName', 'La Voie Shinkofa'),
                    vi.StringStruct('FileDescription', 'Hibiki - Dictée Vocale'),
                    vi.StringStruct('FileVersion', '1.0.0.0'),
                    vi.StringStruct('InternalName', 'Hibiki'),
                    vi.StringStruct('LegalCopyright', '© 2025 La Voie Shinkofa'),
                    vi.StringStruct('OriginalFilename', 'Hibiki.exe'),
                    vi.StringStruct('ProductName', 'Hibiki'),
                    vi.StringStruct('ProductVersion', '1.0.0.0'),
                ]
            )
        ]),
        vi.VarFileInfo([vi.VarStruct('Translation', [1033, 1200])])
    ]
)

# Sauvegarder
with open('version_info.txt', 'w') as f:
    f.write(str(version_info))
```

### Étape 3 : Builder l'Exécutable

**Option A - Script Automatique (Recommandé)** :

```cmd
cd D:\30-Dev-Projects\stt-ermite\hibiki
build_installer.bat
```

Le script va :
1. Activer l'environnement virtuel
2. Installer PyInstaller
3. Nettoyer les builds précédents
4. Demander GPU ou CPU
5. Créer l'exécutable dans `dist\Hibiki\`

**Option B - Manuel** :

```cmd
cd D:\30-Dev-Projects\stt-ermite\hibiki
venv\Scripts\activate
pip install pyinstaller
pyinstaller hibiki.spec
```

### Étape 4 : Tester l'Exécutable

```cmd
cd dist\Hibiki
Hibiki.exe
```

**Vérifie que** :
- ✅ L'application se lance
- ✅ L'interface s'affiche correctement
- ✅ Le modèle WhisperX se télécharge au premier lancement
- ✅ La transcription fonctionne

**Si erreur** : Consulte `logs/hibiki_*.log` dans le dossier de l'exe.

### Étape 5 : Créer l'Installateur avec Inno Setup

1. **Ouvre Inno Setup Compiler**
   - Démarrer → Inno Setup Compiler

2. **Ouvre le script** :
   - File → Open → `hibiki_installer.iss`

3. **Compile** :
   - Build → Compile
   - Ou : Appuie sur `Ctrl+F9`

4. **Attendre** :
   - La compilation prend 30-60 secondes
   - Une fenêtre de progression s'affiche

5. **Résultat** :
   - L'installateur est créé dans : `Output\Hibiki-Setup-1.0.0.exe`
   - Taille attendue : ~500 MB - 1.5 GB (selon GPU/CPU)

### Étape 6 : Tester l'Installateur

1. **Teste sur ta machine** :
   ```cmd
   cd Output
   Hibiki-Setup-1.0.0.exe
   ```

2. **Teste l'installation complète** :
   - Choisis un dossier d'installation
   - Accepte la licence
   - Vérifie la détection GPU
   - Lance Hibiki après installation

3. **Teste la désinstallation** :
   - Panneau de configuration → Programmes
   - Désinstaller Hibiki
   - Vérifie que tout est bien supprimé

---

## 📊 Versions GPU vs CPU

### Version GPU (Recommandée pour toi)

**Avantages** :
- ✅ Performance excellente (<1s latence)
- ✅ Modèles large-v3 supportés
- ✅ Meilleure expérience utilisateur

**Inconvénients** :
- ❌ Taille installateur : ~1.5 GB (CUDA inclus)
- ❌ Ne fonctionne QUE sur machines avec GPU NVIDIA
- ❌ Distribution plus lourde

**Pour qui** :
- Utilisateurs avec GPU NVIDIA RTX 2060+
- Performance critique (streamers, écrivains pro)

### Version CPU (Compatibilité Maximum)

**Avantages** :
- ✅ Fonctionne sur TOUTES machines Windows 10+
- ✅ Taille installateur : ~500 MB
- ✅ Distribution légère

**Inconvénients** :
- ❌ Performance réduite (5-15s latence)
- ❌ Modèle base seulement (moins précis)
- ❌ Expérience utilisateur dégradée

**Pour qui** :
- Grand public sans GPU
- Machines anciennes ou laptops basiques

### Recommandation Distribution

**Option 1 - Deux Versions** (Recommandé) :
- `Hibiki-Setup-1.0.0-GPU.exe` (1.5 GB)
- `Hibiki-Setup-1.0.0-CPU.exe` (500 MB)
- Sur ton site : "Télécharger GPU si vous avez NVIDIA, sinon CPU"

**Option 2 - Version Unique CPU** :
- Compatibilité maximum
- Plus simple à maintenir
- Utilisateurs GPU peuvent installer CUDA manuellement après

**Option 3 - Version Unique GPU** :
- Performance optimale
- Mais exclut utilisateurs sans GPU

---

## 🛠️ Personnalisation Installateur

### Modifier les Messages

Édite `hibiki_installer.iss` section `[Messages]` :

```iss
french.WelcomeLabel2=Ton message personnalisé ici...
```

### Ajouter des Fichiers

Édite `hibiki_installer.iss` section `[Files]` :

```iss
Source: "ton_fichier.pdf"; DestDir: "{app}\docs"; Flags: ignoreversion
```

### Changer l'Icône

```iss
SetupIconFile=assets\ton_icone.ico
```

### Ajouter Raccourcis

Édite section `[Icons]` :

```iss
Name: "{group}\Mon Raccourci"; Filename: "{app}\mon_fichier.exe"
```

---

## 📤 Distribution

### Hébergement Recommandé

**Option 1 - GitHub Releases** (Gratuit) :
```bash
# Créer release sur GitHub
git tag v1.0.0
git push origin v1.0.0

# Upload Hibiki-Setup-1.0.0.exe dans Releases
```

**Option 2 - Google Drive / Dropbox** :
- Partage lien public
- Simple mais moins professionnel

**Option 3 - Site Web Shinkofa** :
- Héberge sur VPS OVH
- Lien direct download

### Page Download Recommandée

```markdown
# Télécharger Hibiki

## Configuration Système

**Recommandée (GPU)** :
- GPU NVIDIA RTX 2060+ (6GB VRAM)
- 8GB RAM (16GB recommandé)
- Windows 10/11 64-bit
- 5GB espace disque

**Minimale (CPU)** :
- CPU 6-8 cores
- 16GB RAM
- Windows 10/11 64-bit
- 5GB espace disque

## Downloads

[⬇️ Hibiki v1.0.0 GPU (1.5 GB)](lien-gpu)
Performance optimale avec GPU NVIDIA

[⬇️ Hibiki v1.0.0 CPU (500 MB)](lien-cpu)
Compatible toutes machines Windows 10+

## Installation

1. Télécharger la version adaptée
2. Double-cliquer sur le fichier .exe
3. Suivre l'assistant d'installation
4. Lancer Hibiki depuis le Bureau ou Menu Démarrer
```

---

## 🔧 Dépannage Build

### Erreur "Module not found"

```cmd
# Réinstaller toutes dépendances
pip install -r requirements.txt --force-reinstall
```

### Erreur PyInstaller

```cmd
# Nettoyer cache
pyinstaller --clean hibiki.spec
```

### Exe trop volumineux (> 2 GB)

- Utilise version CPU (plus légère)
- Active compression UPX dans `hibiki.spec`
- Exclut packages inutiles

### Exe ne se lance pas

1. Teste en mode console :
   - Édite `hibiki.spec` : `console=True`
   - Rebuild
   - Lance et lis erreur console

2. Vérifie logs :
   - `dist\Hibiki\logs\errors_*.log`

3. Vérifie dépendances manquantes :
   - Ajoute dans `hiddenimports` de `hibiki.spec`

---

## 📋 Checklist Pre-Release

Avant de distribuer l'installateur :

- [ ] Icône Shinkofa intégrée (`.ico`)
- [ ] Version testée sur machine propre (pas de Python installé)
- [ ] Détection GPU fonctionne
- [ ] Transcription fonctionne (français + anglais)
- [ ] Hotkey fonctionne
- [ ] Injection texte fonctionne
- [ ] Installateur testé (install + désinstall)
- [ ] USER-GUIDE.md à jour
- [ ] CHANGELOG.md à jour avec v1.0.0
- [ ] COPYRIGHT.md vérifié
- [ ] LICENSE file inclus

---

## 🎯 Prochaines Étapes Post-Release

### Auto-Update (Futur)

Ajouter système de mise à jour automatique :
- PyUpdater
- Ou checks GitHub Releases API
- Notifie utilisateur si nouvelle version

### Code Signing (Professionnel)

Signer l'exe avec certificat numérique :
- Évite "Windows protected your PC" warning
- Coût : ~300€/an (certificat EV)
- Recommandé si distribution large

### Statistiques Téléchargements

Tracker downloads avec :
- Google Analytics sur page download
- GitHub Releases insights
- Serveur web logs

---

## 💡 Astuces Pro

### Build Automatique CI/CD

Utilise GitHub Actions pour build automatique :
```yaml
# .github/workflows/build.yml
name: Build Hibiki
on: [push, release]
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build executable
        run: build_installer.bat
```

### Multi-Langue Installateur

Inno Setup supporte 40+ langues :
```iss
[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
```

### Portable Version

Créer version portable (pas d'installation) :
1. Copie `dist\Hibiki\` → `Hibiki-Portable-1.0.0\`
2. Compresse en .zip
3. Utilisateur décompresse et lance `Hibiki.exe`

---

## 📞 Support

**Questions packaging ?**
- Consulte logs PyInstaller : `build\Hibiki\warn-Hibiki.txt`
- Consulte logs Inno Setup dans Compiler Output
- Demande à TAKUMI en nouvelle session

---

**📦 Packaging créé avec 💙 par TAKUMI**
**La Voie Shinkofa - 2025**
