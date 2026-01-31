# Hibiki - Dictee Vocale

**Hibiki - Resonance**

Application de dictee vocale locale et confidentielle, developpee par [La Voie Shinkofa](https://shinkofa.com).

![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)

---

## Vision

Hibiki facilite l'expression ecrite pour les personnes neurodivergentes (TDAH, dyslexie, dysgraphie) et ameliore la productivite de tous grace a une transcription vocale rapide, precise et 100% locale.

### Caracteristiques Cles

- **Transcription temps reel** : Dictee fluide avec latence minimale
- **IA locale (WhisperX)** : Aucune donnee envoyee sur internet
- **Interface Shinkofa** : Design accessible WCAG 2.1 AAA, minimaliste
- **Confidentialite totale** : Toutes donnees restent sur votre machine
- **Performance optimale** : Detection auto GPU/CPU
- **Multilingue** : Francais, anglais, espagnol, allemand, italien, portugais, etc.
- **Accessibilite** : Optimise dyslexie, TDAH, daltonisme

---

## Installation

### Installation Automatique (Recommande)

**Telecharger et lancer `Hibiki.exe`** - C'est tout !

1. **Telecharger** [Hibiki.exe](https://github.com/theermite/hibiki/releases/latest) (50 MB)
2. **Double-cliquer** sur `Hibiki.exe`
3. **Accepter** les droits administrateur
4. **Attendre** l'installation automatique (5-10 minutes)
5. **Utiliser** Hibiki !

**Ce qui s'installe automatiquement** :
- Python 3.11 embarque
- Toutes les dependances (WhisperX, PyTorch, etc.)
- Configuration par defaut
- Raccourcis Menu Demarrer + Bureau
- Modeles WhisperX (au premier lancement de l'app)

Voir [docs/launcher-guide.md](docs/launcher-guide.md) pour plus de details.

---

### Installation Manuelle (Developpeurs)

#### Prerequis

**Configuration recommandee (GPU)** :
- Windows 10/11 64-bit ou Linux
- GPU NVIDIA avec 6GB+ VRAM (RTX 2060 ou superieur)
- 8GB RAM minimum (16GB recommande)
- Python 3.11+
- 5GB espace disque

**Configuration minimale (CPU)** :
- Windows 10/11 64-bit ou Linux
- CPU 6-8 cores (i7/Ryzen 7)
- 16GB RAM minimum (32GB recommande)
- Python 3.11+
- 5GB espace disque
- Performance reduite (5-15s latence vs <1s avec GPU)

#### Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/theermite/hibiki.git
cd hibiki

# 2. Creer environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate

# Linux
source venv/bin/activate

# 3. Installer dependances
pip install -r requirements.txt

# 4. Lancer Hibiki
python src/main.py
```

#### Installation avec GPU (CUDA)

```bash
# Installer PyTorch avec CUDA (exemple CUDA 11.8)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Puis installer le reste des dependances
pip install -r requirements.txt
```

Voir [guide PyTorch](https://pytorch.org/get-started/locally/) pour choisir la bonne version CUDA.

---

## Utilisation Rapide

1. **Lancer Hibiki** : `python src/main.py`
2. **Attendre initialisation** : Le modele WhisperX se charge (30-60s la premiere fois)
3. **Cliquer "Enregistrer"** ou utiliser le raccourci `Ctrl+Shift+Space`
4. **Parler** : Votre voix est transcrite en temps reel
5. **Le texte est injecte** automatiquement dans l'application active

**Raccourci clavier** : `Ctrl+Shift+Space` (personnalisable dans les parametres)

---

## Documentation

- **[docs/user-guide.md](docs/user-guide.md)** : Guide utilisateur complet
- **[docs/installation.md](docs/installation.md)** : Guide d'installation detaille
- **[docs/shortcuts-guide.md](docs/shortcuts-guide.md)** : Personnalisation des raccourcis clavier
- **[docs/groq-setup.md](docs/groq-setup.md)** : Configuration Groq API (optionnel)
- **[docs/dev-guide.md](docs/dev-guide.md)** : Guide developpeur
- **[docs/copyright.md](docs/copyright.md)** : Licence et mentions legales

---

## Configuration

### Fichier de Configuration

Hibiki cree automatiquement un fichier `config/hibiki_preferences.json` au premier lancement.

**Parametres principaux** :

```json
{
  "whisperx": {
    "model": "base",
    "language": "fr",
    "device": "auto",
    "compute_type": "float16"
  },
  "hotkey": {
    "toggle_key": "ctrl+shift+space"
  },
  "theme_mode": "light"
}
```

### Changer la Langue

Editez `config/hibiki_preferences.json` :

```json
"whisperx": {
  "language": "en"
}
```

Langues supportees : `fr`, `en`, `es`, `de`, `it`, `pt`, `nl`, `pl`, `ru`, `zh`, `ja`, `ko`, etc.

### Changer le Modele WhisperX

**Modeles disponibles** :
- `base` : Leger, rapide (74M parametres) - **Recommande par defaut**
- `small` : Equilibre (244M parametres)
- `medium` : Precis (769M parametres)
- `large-v3` : Maximum precision (1550M parametres) - Necessite GPU puissant

---

## Architecture

```
Hibiki-Dictate/
├── src/
│   ├── main.py              # Point d'entree
│   ├── models/
│   │   └── config.py        # Configuration Pydantic
│   ├── core/
│   │   ├── whisperx_engine.py    # Moteur WhisperX
│   │   ├── audio_capture.py      # Capture microphone
│   │   ├── vad_processor.py      # Voice Activity Detection
│   │   ├── text_injector.py      # Injection texte
│   │   └── hotkey_manager.py     # Raccourcis clavier
│   ├── ui/
│   │   └── hibiki_app.py    # Interface CustomTkinter
│   └── utils/
│       ├── logger.py        # Logging Loguru
│       └── threading_utils.py
├── config/
│   └── hibiki_preferences.json  # Configuration utilisateur
├── docs/                    # Documentation
├── scripts/                 # Scripts build/install
├── assets/                  # Icons et ressources
├── models/                  # Modeles WhisperX telecharges
├── logs/                    # Logs application
└── requirements.txt
```

---

## Technologies

- **[WhisperX](https://github.com/m-bain/whisperX)** : Transcription vocale avec alignement force
- **[PyTorch](https://pytorch.org/)** : Machine learning
- **[CustomTkinter](https://github.com/TomSchimansky/CustomTkinter)** : Interface graphique moderne
- **[Loguru](https://github.com/Delgan/loguru)** : Logging elegant
- **[Pydantic](https://pydantic.dev/)** : Validation de donnees
- **[Sounddevice](https://python-sounddevice.readthedocs.io/)** : Capture audio
- **[Silero VAD](https://github.com/snakers4/silero-vad)** : Voice Activity Detection

---

## Tests

```bash
# Lancer tests unitaires
pytest tests/ -v

# Tests avec coverage
pytest tests/ --cov=src --cov-report=html

# Voir rapport coverage
start htmlcov\index.html  # Windows
```

---

## Contribution

Les contributions sont les bienvenues !

**Comment contribuer** :
1. Fork le projet
2. Creer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'feat: Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

## Support & Issues

- **Issues GitHub** : [github.com/theermite/hibiki/issues](https://github.com/theermite/hibiki/issues)
- **Documentation** : [docs/user-guide.md](docs/user-guide.md)

---

## Licence

**Copyright 2025 La Voie Shinkofa**

Ce projet est sous licence **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

- Usage personnel gratuit
- Modifications autorisees
- Partage sous meme licence
- Usage commercial interdit sans licence

Voir [docs/copyright.md](docs/copyright.md) pour les details complets.

---

## Contact

**La Voie Shinkofa**
- Site web : [shinkofa.com](https://shinkofa.com)
- Email : contact@shinkofa.com
- GitHub : [@theermite](https://github.com/theermite)

---

**Hibiki - Resonance**
**Shinkofa - Le Veritable Pas**

*Developpe par Jay "The Ermite" Goncalves*
