# 🚀 Hibiki Launcher - Guide Complet

## 📋 Vue d'Ensemble

Le **Hibiki Launcher** est un système d'installation et de lancement intelligent qui simplifie la distribution de Hibiki.

### Concept

**Un seul fichier `Hibiki.exe`** qui :

**Au premier lancement** :
1. ✅ Détecte qu'il n'est pas installé
2. ✅ Demande les droits administrateur
3. ✅ Télécharge et installe Python 3.11 embarqué
4. ✅ Installe toutes les dépendances Python (WhisperX, PyTorch, etc.)
5. ✅ Configure l'application (fichiers config par défaut)
6. ✅ Télécharge les modèles WhisperX au premier lancement de l'app
7. ✅ Crée les raccourcis (Menu Démarrer + Bureau)
8. ✅ Enregistre l'application dans Windows (Panneau de configuration)
9. ✅ Lance automatiquement l'application

**Aux lancements suivants** :
- ✅ Lance directement l'application Hibiki
- ✅ Vérifie les mises à jour (optionnel)
- ✅ Pas de réinstallation

---

## 🏗️ Architecture

```
Hibiki.exe (50-100 MB)
├── hibiki_launcher.py      # Point d'entrée principal
├── installer.py             # Module d'installation automatique
├── app/                     # Fichiers application embarqués
│   ├── src/                 # Code source Hibiki
│   ├── requirements.txt     # Dépendances Python
│   ├── README.md
│   ├── USER-GUIDE.md
│   └── COPYRIGHT.md
└── assets/                  # Icônes, ressources
```

### Fichiers Créés après Installation

**Program Files** (`C:\Program Files\Hibiki\`) :
```
Hibiki/
├── python/                  # Python 3.11 embarqué
│   ├── python.exe
│   ├── Scripts/
│   │   └── pip.exe
│   └── Lib/
├── app/                     # Application Hibiki
│   ├── src/
│   └── requirements.txt
├── docs/                    # Documentation
│   ├── README.md
│   ├── USER-GUIDE.md
│   └── COPYRIGHT.md
├── Hibiki.bat               # Script de lancement
└── uninstall.bat            # Script de désinstallation
```

**AppData** (`%APPDATA%\Hibiki\`) :
```
Hibiki/
├── config/
│   └── hibiki_preferences.json  # Configuration utilisateur
├── logs/
│   └── hibiki_*.log             # Logs application
├── models/
│   └── whisperx/                # Modèles WhisperX téléchargés
└── .installed                   # Marker d'installation
```

**Registre Windows** :
```
HKEY_CURRENT_USER\Software\La Voie Shinkofa\Hibiki
├── Version = "1.0.0"
├── InstallDir = "C:\Program Files\Hibiki"
└── UserDataDir = "%APPDATA%\Hibiki"

HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\Hibiki
├── DisplayName = "Hibiki"
├── DisplayVersion = "1.0.0"
├── Publisher = "La Voie Shinkofa"
└── UninstallString = "C:\Program Files\Hibiki\uninstall.bat"
```

---

## 🔧 Build du Launcher

### Prérequis

- Python 3.11+ avec environnement virtuel configuré
- PyInstaller installé
- Tous les fichiers Hibiki a la racine du projet

### Commandes de Build

**Option 1 - Script automatique (Recommande)** :
```cmd
cd D:\30-Dev-Projects\Hibiki-Dictate
scripts\build_launcher.bat
```

**Option 2 - Manuel** :
```cmd
cd D:\30-Dev-Projects\Hibiki-Dictate
venv\Scripts\activate
pip install pyinstaller
pyinstaller scripts\hibiki_launcher.spec --clean
```

### Résultat

```
dist\
└── Hibiki.exe    # Fichier unique (50-100 MB)
```

**Ce fichier contient** :
- Le launcher intelligent
- L'installateur automatique
- Tous les fichiers de l'application
- La documentation

---

## 📦 Distribution

### Méthode Recommandée : GitHub Releases

1. **Tag une release** :
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Créer release sur GitHub** :
   - Aller sur le repo Hibiki
   - Releases → Draft a new release
   - Choisir le tag `v1.0.0`
   - Titre : `Hibiki v1.0.0 - Dictée Vocale`
   - Description : Voir template ci-dessous
   - Uploader `dist\Hibiki.exe`

3. **Template description release** :
   ````markdown
   # 🎙️ Hibiki v1.0.0 - Dictée Vocale Locale

   Application de dictée vocale 100% locale et confidentielle.

   ## 📥 Téléchargement

   **Télécharger Hibiki.exe** (50 MB) ci-dessous

   ## ⚙️ Configuration Système

   **Recommandée (GPU)** :
   - GPU NVIDIA RTX 2060+ (6GB VRAM)
   - 8GB RAM (16GB recommandé)
   - Windows 10/11 64-bit
   - 5GB espace disque

   **Minimale (CPU)** :
   - CPU 6-8 cores (i7/Ryzen 7)
   - 16GB RAM
   - Windows 10/11 64-bit
   - 5GB espace disque
   - ⚠️ Performance réduite

   ## 🚀 Installation

   1. **Télécharger** `Hibiki.exe` ci-dessous
   2. **Double-cliquer** sur `Hibiki.exe`
   3. **Accepter** les droits administrateur
   4. **Attendre** l'installation automatique (5-10 minutes)
   5. **Utiliser** Hibiki !

   L'application s'installe automatiquement :
   - ✅ Python embarqué
   - ✅ Dépendances (WhisperX, PyTorch, etc.)
   - ✅ Configuration par défaut
   - ✅ Raccourcis Menu Démarrer + Bureau
   - ✅ Modèles WhisperX (au premier lancement de l'app)

   ## 📖 Documentation

   - [Guide Utilisateur](docs/USER-GUIDE.md)
   - [README](docs/README.md)
   - [Licence](docs/COPYRIGHT.md)

   ## 🆕 Nouveautés v1.0.0

   - 🎙️ Transcription temps réel avec WhisperX
   - 🧠 IA locale (aucune donnée en ligne)
   - 🎨 Interface accessible WCAG 2.1 AAA
   - 🌐 Multilingue (français, anglais, espagnol, etc.)
   - ⚡ Détection auto GPU/CPU
   - 🔒 Confidentialité totale

   ## 🐛 Support

   - [Issues GitHub](https://github.com/theermite/hibiki/issues)
   - Email: contact@shinkofa.com
   ````

4. **Publier** la release

### Autres Options de Distribution

**Google Drive / Dropbox** :
- Uploader `Hibiki.exe`
- Partager lien public
- Mettre lien sur site web Shinkofa

**Site Web Shinkofa** :
- Héberger sur VPS OVH
- Page download dédiée
- Lien direct download

---

## 🔄 Système de Vérification de Version

### Configuration Auto-Update

Le launcher vérifie automatiquement les mises à jour au lancement.

**Configuration** (`%APPDATA%\Hibiki\config\hibiki_preferences.json`) :
```json
{
  "auto_update": true,
  "check_update_on_start": true
}
```

### Fonctionnement

1. **Au lancement** :
   - Le launcher vérifie `https://api.github.com/repos/theermite/hibiki/releases/latest`
   - Compare version locale vs version GitHub
   - Si nouvelle version disponible :
     - Affiche notification
     - Propose téléchargement automatique (optionnel)

2. **Notification utilisateur** :
   ```
   ============================================
   MISE À JOUR DISPONIBLE
   ============================================

   Version actuelle : 1.0.0
   Nouvelle version : 1.1.0

   Télécharger : https://github.com/theermite/hibiki/releases/latest

   Lancer quand même ? (o/n)
   ============================================
   ```

### Désactiver Auto-Update

Éditez `hibiki_preferences.json` :
```json
{
  "check_update_on_start": false
}
```

---

## 🛠️ Workflow Développeur

### 1. Developpement Local

```bash
cd D:\30-Dev-Projects\Hibiki-Dictate
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

### 2. Build Launcher

```cmd
scripts\build_launcher.bat
```

### 3. Tester Installation

```cmd
cd dist
Hibiki.exe
```

**Vérifier** :
- ✅ Droits admin demandés
- ✅ Python téléchargé et extrait
- ✅ Dépendances installées
- ✅ Config créée
- ✅ Raccourcis créés
- ✅ Application lancée

### 4. Tester Lancement (déjà installé)

Relancer `Hibiki.exe` :
- ✅ Détecte installation existante
- ✅ Lance directement l'application
- ✅ Pas de réinstallation

### 5. Tester Désinstallation

```cmd
cd "C:\Program Files\Hibiki"
uninstall.bat
```

**Vérifier** :
- ✅ Dossier `Program Files\Hibiki` supprimé
- ✅ Dossier `%APPDATA%\Hibiki` supprimé (optionnel)
- ✅ Clés registre supprimées
- ✅ Raccourcis supprimés

### 6. Release

```bash
git tag v1.0.0
git push origin v1.0.0
# Créer GitHub Release
# Uploader dist\Hibiki.exe
```

---

## 🧪 Tests Recommandés

### Test 1 : Installation Fraîche

**Environnement** : Machine propre (ou VM Windows 10)

1. Télécharger `Hibiki.exe`
2. Lancer (double-clic)
3. Accepter droits admin
4. Attendre installation complète
5. Vérifier raccourcis créés
6. Vérifier application fonctionne

**Résultat attendu** :
- ✅ Installation sans erreur
- ✅ Application se lance
- ✅ Transcription fonctionne

### Test 2 : Lancement Existant

**Environnement** : Après Test 1

1. Fermer Hibiki
2. Lancer depuis Menu Démarrer
3. Vérifier lancement rapide (pas de réinstallation)

**Résultat attendu** :
- ✅ Lancement direct (<5 secondes)
- ✅ Pas de réinstallation

### Test 3 : Vérification Version

**Environnement** : Après installation

1. Lancer Hibiki
2. Vérifier message "Vérification mises à jour..."
3. Si update dispo, vérifier notification

**Résultat attendu** :
- ✅ Vérification automatique
- ✅ Notification claire si update

### Test 4 : Désinstallation

**Environnement** : Après installation

1. Panneau de configuration → Programmes
2. Désinstaller Hibiki
3. Vérifier suppression complète

**Résultat attendu** :
- ✅ Application retirée de la liste
- ✅ Dossiers supprimés
- ✅ Raccourcis supprimés

---

## 🐛 Dépannage

### Erreur "Droits administrateur requis"

**Cause** : Windows bloque l'élévation de privilèges

**Solution** :
1. Clic-droit sur `Hibiki.exe`
2. "Exécuter en tant qu'administrateur"

### Erreur "Installation Python échouée"

**Cause** : Connexion internet instable ou firewall

**Solution** :
1. Vérifier connexion internet
2. Désactiver temporairement antivirus/firewall
3. Relancer `Hibiki.exe`

### Erreur "Module installer introuvable"

**Cause** : Build incomplet

**Solution** :
1. Rebuild launcher : `build_launcher.bat`
2. Vérifier que `installer.py` est dans le repo
3. Vérifier spec PyInstaller inclut `installer`

### Application ne se lance pas après installation

**Cause** : Dépendances manquantes ou erreur Python

**Solution** :
1. Ouvrir `%APPDATA%\Hibiki\logs\hibiki_*.log`
2. Chercher erreur
3. Si dépendance manquante :
   ```cmd
   cd "C:\Program Files\Hibiki"
   python\Scripts\pip.exe install <package-manquant>
   ```

### "Windows a protégé votre PC"

**Cause** : Exécutable non signé (normal)

**Solution** :
1. Cliquer "Informations complémentaires"
2. Cliquer "Exécuter quand même"

**Pour éviter (production)** :
- Signer l'exe avec certificat numérique (~300€/an)

---

## 📊 Comparaison Ancien vs Nouveau Système

| Critère | Ancien (Inno Setup) | Nouveau (Launcher) |
|---------|---------------------|---------------------|
| **Fichiers distribués** | 1 installateur .exe | 1 Hibiki.exe unique |
| **Installation** | Assistant graphique | Automatique au premier lancement |
| **Taille** | 500 MB - 1.5 GB | 50-100 MB (+ deps auto) |
| **Python** | Pré-installé dans installer | Téléchargé à l'installation |
| **Updates** | Manuel (nouvel installer) | Vérification auto + notification |
| **User Experience** | 2 étapes (install → launch) | 1 étape (double-clic) |
| **Complexité** | Moyenne (Inno Setup) | Faible (un seul exe) |

### Avantages Nouveau Système

✅ **Simplicité** : Un seul fichier à distribuer
✅ **Taille réduite** : 50-100 MB vs 500 MB - 1.5 GB
✅ **UX améliorée** : Double-clic → tout s'installe automatiquement
✅ **Updates automatiques** : Vérification intégrée
✅ **Flexibilité** : Plus facile à modifier et maintenir

### Inconvénients

❌ **Premier lancement plus long** : Téléchargement Python + deps (5-10 min)
❌ **Nécessite connexion internet** : Pour télécharger Python et dépendances
❌ **Moins "pro"** : Pas d'assistant graphique type installateur Windows

---

## 🎯 Recommandation

**Utiliser le nouveau système Launcher** pour :
- ✅ Distribution web (GitHub, site Shinkofa)
- ✅ Updates fréquentes
- ✅ Maximum simplicité utilisateur

**Conserver Inno Setup** pour :
- ✅ Distribution entreprise
- ✅ Environnements sans internet
- ✅ Déploiement sur parc machines (IT admins)

**Idéal** : Proposer les deux options sur la page download :
- **Hibiki.exe** (Recommandé) - 50 MB - Installation automatique
- **Hibiki-Setup.exe** (Installateur classique) - 500 MB - Hors-ligne

---

## 📞 Support

**Questions launcher ?**
- Consulte logs : `%APPDATA%\Hibiki\logs\hibiki_*.log`
- GitHub Issues : [github.com/theermite/hibiki/issues](https://github.com/theermite/hibiki/issues)
- Email : contact@shinkofa.com

---

**🚀 Launcher créé avec 💙 par TAKUMI**
**La Voie Shinkofa - 2025**
