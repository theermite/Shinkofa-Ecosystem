# 🎙️ Hibiki - Guide Développement & Test

## 🎯 Objectif

Faire fonctionner **Hibiki directement en mode développement** pour tester toutes les fonctionnalités avant de créer l'installateur.

---

## 📋 Prérequis

- Python 3.11+ installé
- GPU NVIDIA (recommandé) ou CPU puissant
- 8-16 GB RAM libre
- Microphone fonctionnel

---

## 🚀 Installation Dev (Une Seule Fois)

### 1. Créer et activer l'environnement virtuel

```cmd
cd D:\30-Dev-Projects\stt-ermite\hibiki
python -m venv venv
venv\Scripts\activate
```

### 2. Installer les dépendances

```cmd
pip install -r requirements.txt
```

**⏱️ Temps** : 10-15 minutes (télécharge WhisperX, PyTorch, etc.)

### 3. Vérifier l'installation

```cmd
python -c "import customtkinter; import whisperx; print('✓ Dépendances OK')"
```

---

## 🎙️ Lancer Hibiki

### Méthode 1 : Script Python Direct

```cmd
cd D:\30-Dev-Projects\stt-ermite\hibiki
venv\Scripts\python src\main.py
```

### Méthode 2 : Via run.bat (si présent)

```cmd
cd D:\30-Dev-Projects\stt-ermite\hibiki
run.bat
```

---

## ✅ Tests à Faire

### 1. **Lancement de l'Interface**
- [ ] L'application se lance sans erreur
- [ ] Interface CustomTkinter s'affiche
- [ ] Design Shinkofa visible (violet, blanc)

### 2. **Chargement du Modèle WhisperX**
- [ ] Message "Chargement du modèle WhisperX..."
- [ ] Modèle `base` téléchargé (1ère fois seulement)
- [ ] Détection auto GPU/CPU
- [ ] Message "Prêt"

### 3. **Enregistrement Audio**
- [ ] Bouton "🔴 Enregistrer" fonctionne
- [ ] Ou hotkey `Ctrl+Shift+Space` fonctionne
- [ ] Indicateur d'enregistrement visible
- [ ] VAD (Voice Activity Detection) détecte la voix

### 4. **Transcription**
- [ ] Parler français → Transcription affichée
- [ ] Parler anglais → Transcription correcte
- [ ] Latence acceptable (<2s GPU, <10s CPU)

### 5. **Injection Texte**
- [ ] Texte transcrit injecté dans application active
- [ ] Fonctionne dans :
  - [ ] Notepad / Bloc-notes
  - [ ] Word / Google Docs
  - [ ] Obsidian
  - [ ] VS Code
  - [ ] Discord / Messenger

### 6. **Hotkeys (Raccourcis Clavier)**
- [ ] `Ctrl+Shift+Space` démarre/arrête enregistrement
- [ ] Hotkey personnalisable dans settings

### 7. **Paramètres**
- [ ] Ouvrir fenêtre paramètres
- [ ] Changer langue (fr, en, es, etc.)
- [ ] Changer modèle (base, small, medium)
- [ ] Changer theme (light, dark, auto)
- [ ] Sauvegarder paramètres

### 8. **Gestion d'Erreurs**
- [ ] Pas de microphone → Message d'erreur clair
- [ ] Modèle introuvable → Téléchargement auto
- [ ] Connexion internet coupée → Message explicite

---

## 🐛 Problèmes Courants

### Erreur : "No module named 'tkinter'"

**Cause** : Python n'a pas tkinter installé

**Solution Windows** :
1. Réinstaller Python avec option "tcl/tk and IDLE" cochée
2. Ou : Installer Python from Microsoft Store

**Solution Linux** :
```bash
sudo apt-get install python3-tk
```

### Erreur : "No module named 'loguru'"

**Cause** : Dépendances pas installées

**Solution** :
```cmd
cd hibiki
venv\Scripts\activate
pip install -r requirements.txt
```

### Erreur : "CUDA not available" (Warning)

**Cause** : Pas de GPU NVIDIA ou CUDA pas installé

**Impact** : L'app fonctionnera en mode CPU (plus lent)

**Solution pour GPU** :
1. Installer CUDA Toolkit 11.8 ou 12.1
2. Réinstaller PyTorch avec CUDA :
```cmd
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Application se lance mais pas d'audio

**Cause** : Microphone pas détecté

**Solution** :
1. Vérifier microphone dans Paramètres Windows
2. Autoriser accès microphone pour Python
3. Tester avec `python -m sounddevice`

---

## 📊 Logs & Debugging

### Logs Applicatifs

```cmd
cd D:\30-Dev-Projects\stt-ermite\hibiki
type logs\hibiki_*.log
```

### Logs WhisperX

Affichés dans console lors du lancement

### Debug Mode

Éditer `src/main.py` :
```python
# Changer niveau de log
logger.setLevel("DEBUG")
```

---

## 🔧 Configuration

### Fichier de Config

```
config/hibiki_preferences.json
```

### Paramètres Clés

```json
{
  "whisperx": {
    "model": "base",        // ou "small", "medium", "large-v3"
    "language": "fr",       // ou "en", "es", "de", "it", "pt"
    "device": "auto",       // ou "cuda", "cpu"
    "compute_type": "float16"  // ou "int8" (CPU)
  },
  "hotkey": {
    "toggle_key": "ctrl+shift+space"  // Personnalisable
  },
  "theme_mode": "light"      // ou "dark", "auto"
}
```

---

## 🎯 Checklist Avant Packaging

Avant de créer l'installateur, s'assurer que :

- [ ] ✅ Application se lance sans erreur
- [ ] ✅ Toutes fonctionnalités testées et fonctionnelles
- [ ] ✅ Performance acceptable (GPU/CPU)
- [ ] ✅ Pas de crash lors de l'usage normal
- [ ] ✅ Gestion d'erreurs propre (pas de tracebacks)
- [ ] ✅ Interface responsive et claire
- [ ] ✅ Injection texte fonctionne partout
- [ ] ✅ Hotkeys fonctionnent
- [ ] ✅ Logs utiles pour debugging

---

## 📞 Support

**Si problème** :
1. Vérifier logs : `logs\hibiki_*.log`
2. Tester commandes une par une dans ce guide
3. Vérifier requirements.txt installé complet

---

**🎙️ Hibiki - Dictée Vocale**
**La Voie Shinkofa - 2025**
