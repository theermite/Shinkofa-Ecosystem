# 🚀 Installation Hibiki - Guide Rapide

## Prérequis

- **Windows 10/11** 64-bit (ou Linux)
- **Python 3.11+** installé
- **GPU NVIDIA** (recommandé) avec CUDA, ou CPU puissant
- **8GB RAM minimum** (16GB recommandé)
- **5GB espace disque** libre

---

## Installation Étape par Étape

### 1. Créer l'environnement virtuel

```bash
cd hibiki
python -m venv venv
```

### 2. Activer l'environnement virtuel

**Windows** :
```cmd
venv\Scripts\activate
```

**Linux** :
```bash
source venv/bin/activate
```

Vous devriez voir `(venv)` au début de votre ligne de commande.

### 3. Installer PyTorch

**Avec GPU NVIDIA (CUDA)** :
```bash
# Pour CUDA 11.8 (vérifiez votre version CUDA)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Pour CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**Sans GPU (CPU seulement)** :
```bash
pip install torch torchvision torchaudio
```

Voir [PyTorch Get Started](https://pytorch.org/get-started/locally/) pour choisir la bonne version.

### 4. Installer les dépendances

```bash
pip install -r requirements.txt
```

Cette étape peut prendre 5-10 minutes (téléchargement de toutes les bibliothèques).

### 5. Tester l'installation

```bash
python src/main.py
```

**Premier lancement** :
- Le modèle WhisperX sera téléchargé (1-4 GB selon le modèle)
- Cela peut prendre 5-10 minutes selon votre connexion
- Les modèles sont stockés dans `models/` et ne seront plus re-téléchargés

---

## ✅ Vérification Installation

Si tout fonctionne, vous devriez voir :

```
============================================================
  🎙️ HIBIKI - Dictée Vocale
  La Voie Shinkofa
============================================================

[LOGS initialisation...]
```

Et l'interface graphique Hibiki s'ouvre avec :
- 🎙️ Titre "Hibiki" en haut
- Statut "Prêt" ou "Chargement du modèle..."
- Bouton orange "🔴 Enregistrer"

---

## 🐛 Résolution de Problèmes

### Erreur "No module named 'pydantic_settings'"

```bash
pip install pydantic-settings
```

### Erreur "CUDA not available"

Vous n'avez pas de GPU NVIDIA ou CUDA n'est pas installé.
- **Option 1** : Installer CUDA Toolkit depuis [NVIDIA](https://developer.nvidia.com/cuda-downloads)
- **Option 2** : Utiliser en mode CPU (plus lent mais fonctionnel)

### Erreur "Microsoft Visual C++ 14.0 is required" (Windows)

Installez [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

### Erreur au lancement

Consultez les logs :
```bash
cat logs/hibiki_*.log        # Linux
type logs\hibiki_*.log        # Windows
```

---

## 🎯 Prochaines Étapes

Une fois installé :
1. **Lisez le [USER-GUIDE.md](USER-GUIDE.md)** pour apprendre à utiliser Hibiki
2. **Configurez** votre langue dans `config/hibiki_preferences.json`
3. **Testez** votre première dictée !

---

**Besoin d'aide ?**
- [USER-GUIDE.md](USER-GUIDE.md) - Guide utilisateur complet
- [README.md](README.md) - Documentation technique
- [GitHub Issues](https://github.com/theermite/hibiki/issues)

**Bon usage ! 🎙️**
