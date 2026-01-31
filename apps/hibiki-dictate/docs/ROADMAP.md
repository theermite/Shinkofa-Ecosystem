# Hibiki-Dictate - Roadmap des Fonctionnalites

> Document de suivi des fonctionnalites - Mise a jour: 2026-01-21

---

## Legende

| Symbole | Signification |
|---------|---------------|
| ✅ | Implemente et fonctionnel |
| ⚠️ | Partiellement implemente |
| 🔄 | En cours de developpement |
| ❌ | A faire |
| 💡 | Idee future |

---

## 1. Fonctionnalites MVP (Minimum Viable Product)

### 1.1 Transcription & Reconnaissance Vocale

| Fonctionnalite | Statut | Description | Fichiers |
|----------------|--------|-------------|----------|
| GPU local (CUDA) | ✅ | Utilisation du GPU pour WhisperX | `whisperx_engine.py` |
| Haute precision STT | ✅ | WhisperX local + Groq cloud avec fallback | `whisperx_engine.py`, `groq_whisper_provider.py` |
| Multi-langue | ✅ | 90+ langues supportees | `config.py` |
| VAD (Voice Activity Detection) | ✅ | Silero VAD avec seuils configurables | `vad_processor.py` |
| Ponctuation automatique | ⚠️ → 🔄 | Basique fait, contextuelle en cours | `text_formatter.py` |
| Sauts de ligne intelligents | ⚠️ → 🔄 | Basique fait, semantique en cours | `text_formatter.py` |

### 1.2 Interface Utilisateur

| Fonctionnalite | Statut | Description | Fichiers |
|----------------|--------|-------------|----------|
| Theme sombre/clair | ✅ | Toggle live, WCAG AAA compliant | `hibiki_app.py` |
| System Tray | ✅ | Minimisation, restore, quit | `system_tray.py` |
| Overlay minimaliste | ✅ | 9 positions, opacite, VU-metre | `overlay_window.py` |
| Feedback audio | ✅ | Sons start/stop/success configurables | `audio_feedback.py` |
| Logs temps reel | ✅ | Viewer avec tail en direct | `logs_window.py` |

### 1.3 Modes de Dictee

| Fonctionnalite | Statut | Description | Fichiers |
|----------------|--------|-------------|----------|
| Mode Toggle | ✅ | Appui = on/off | `hotkey_manager.py` |
| Mode Push-to-Talk | ✅ | Maintenir pour enregistrer | `hotkey_manager.py` |
| Configuration Hotkeys | ✅ | Enregistrement touches personnalisees | `hotkey_settings_window.py` |

### 1.4 Gestion du Texte

| Fonctionnalite | Statut | Description | Fichiers |
|----------------|--------|-------------|----------|
| Injection directe | ✅ | Clipboard, clavier, mode AUTO | `text_injector.py` |
| Historique transcriptions | ✅ | SQLite avec retention configurable | `transcription_history.py` |
| Dictionnaire personnalise | ✅ | Corrections automatiques | `custom_dictionary.py` |
| Conservation clipboard | ✅ | Option preserve_clipboard | `text_injector.py` |

### 1.5 Systeme

| Fonctionnalite | Statut | Description | Fichiers |
|----------------|--------|-------------|----------|
| Auto-Updates | ✅ | Checker + notification | `auto_updater.py` |
| Auto-reconnect si crash | ❌ | Watchdog pour restart model | A creer |
| Lancement au demarrage | 🔄 | Option Windows Startup | `config.py`, `settings_window.py` |

---

## 2. Fonctionnalites Phase 2 - Confort Utilisateur

| Fonctionnalite | Statut | Priorite | Description |
|----------------|--------|----------|-------------|
| Switch multi-langues rapide | 🔄 | Haute | Dropdown overlay ou raccourci |
| Backup transcriptions local | ❌ | Moyenne | Export JSON/CSV periodique |
| Parametres audio/VAD UI | ❌ | Moyenne | Exposer chunk_size, thresholds |
| Profils contextuels | 💡 | Basse | Configs differentes (medical, tech) |

---

## 3. Fonctionnalites Phase 3 - Avancees

| Fonctionnalite | Statut | Priorite | Description |
|----------------|--------|----------|-------------|
| Traduction temps reel | ❌ | Haute | API traduction post-transcription |
| Optimisation memoire GPU | ❌ | Moyenne | Unload model inactif, quantization |
| Modeles alternatifs | ❌ | Moyenne | CanaryQwen, Voxtral (infra prete) |
| Statistiques & analytics | ❌ | Basse | Dashboard usage, mots/min |
| Commandes vocales | 💡 | Haute | "Nouveau paragraphe", "Effacer" |
| Mode correction vocale | 💡 | Moyenne | Relire/corriger par voix |

---

## 4. Fonctionnalites Phase 4 - Distribution & Integrations

| Fonctionnalite | Statut | Priorite | Description |
|----------------|--------|----------|-------------|
| Installateur .exe | ❌ | Haute | Inno Setup/NSIS, wizard complet |
| Integration Obsidian | ❌ | Moyenne | Plugin ou hotkey → markdown |
| Integration Discord | ❌ | Basse | Bot/webhook voice channels |
| API locale REST | 💡 | Moyenne | Pour integrations externes |

---

## 5. Idees Futures

| Fonctionnalite | Interet | Description |
|----------------|---------|-------------|
| Raccourcis texte | ★★☆ | "sig" → signature complete |
| Export audio | ★★☆ | Sauvegarder audio source |
| Transcription fichiers | ★★☆ | Drag & drop audio → texte |
| Mode silencieux | ★☆☆ | Desactiver feedback temp |
| Diarization | ★★☆ | Identification multi-locuteurs |
| Streaming tokens | ★★☆ | Affichage temps reel pendant enregistrement |

---

## 6. Architecture Technique

### 6.1 Structure Actuelle

```
src/
├── main.py                    # Point d'entree
├── core/
│   ├── audio_capture.py       # Capture microphone
│   ├── vad_processor.py       # Silero VAD
│   ├── hotkey_manager.py      # Hotkeys globaux
│   ├── text_injector.py       # Injection texte
│   ├── whisperx_engine.py     # Transcription locale
│   ├── groq_whisper_provider.py # API Groq cloud
│   └── transcription_provider.py # Interface abstraite
├── ui/
│   ├── hibiki_app.py          # Fenetre principale
│   ├── settings_window.py     # Parametres
│   ├── hotkey_settings_window.py # Config hotkeys
│   ├── history_window.py      # Historique
│   ├── dictionary_window.py   # Dictionnaire
│   ├── logs_window.py         # Logs viewer
│   ├── overlay_window.py      # Overlay status
│   └── system_tray.py         # Tray Windows
├── models/
│   └── config.py              # Schemas Pydantic
└── utils/
    ├── logger.py              # Logging setup
    ├── audio_feedback.py      # Sons systeme
    ├── auto_updater.py        # MAJ auto
    ├── custom_dictionary.py   # Remplacements
    ├── transcription_history.py # SQLite
    ├── text_formatter.py      # Formatage texte
    └── threading_utils.py     # Helpers threads
```

### 6.2 Stack Technique

- **GUI**: CustomTkinter 5.2+ (dark theme, accessible)
- **Audio**: sounddevice, Silero VAD
- **STT Local**: WhisperX (faster-whisper based)
- **STT Cloud**: Groq Whisper API
- **Hotkeys**: pynput (global system-wide)
- **Config**: Pydantic Settings + JSON
- **Database**: SQLite (aiosqlite)
- **Build**: PyInstaller

---

## 7. Changelog Implementation

### 2026-01-21
- [ ] Ponctuation automatique contextuelle
- [ ] Sauts de ligne intelligents
- [ ] Option lancement au demarrage Windows
- [ ] Switch multi-langues rapide

---

## 8. Notes de Developpement

### Ponctuation Intelligente
- Utiliser regles linguistiques + heuristiques
- Detecter fin de phrase par intonation (si possible)
- Gerer les cas speciaux (nombres, abreviations)

### Sauts de Ligne
- Analyser la structure semantique
- Detecter changements de sujet
- Respecter les preferences utilisateur (paragraphes courts/longs)

### Multi-Langues
- Precharger modeles frequents
- Cache intelligent pour switch rapide
- Detecter langue automatiquement (optionnel)

---

*Document genere pour le projet Hibiki-Dictate*
*Maintenu par: Jay & Takumi*
