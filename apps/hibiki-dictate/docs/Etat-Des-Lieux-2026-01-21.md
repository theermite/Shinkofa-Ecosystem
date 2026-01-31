# Etat des Lieux Complet - Hibiki Dictate

**Date** : 21 janvier 2026
**Version** : 1.0.0 (MVP Phase 1)
**Objectif** : Document de reference pour planifier la suite du developpement

---

## Resume Executif

Hibiki est une application de dictee vocale desktop **fonctionnelle** avec les features core implementees. L'application transcrit la voix en temps reel et injecte le texte dans n'importe quelle application.

### Statut Global

| Categorie | Statut | Completion |
|-----------|--------|------------|
| Core transcription | FONCTIONNEL | 100% |
| Interface utilisateur | FONCTIONNEL | 90% |
| Configuration | FONCTIONNEL | 100% |
| Historique/Dictionnaire | FONCTIONNEL | 100% |
| Tests automatises | NON IMPLEMENTE | 0% |
| Providers alternatifs | PARTIEL | 50% |

---

## 1. Architecture Actuelle

### 1.1 Structure du Projet

```
Hibiki-Dictate/
├── src/
│   ├── main.py                    # Point d'entree (charge config, lance UI)
│   │
│   ├── models/
│   │   └── config.py              # ~500 lignes - Configuration Pydantic complete
│   │
│   ├── core/                      # LOGIQUE METIER
│   │   ├── transcription_provider.py  # ABC - Interface abstraite providers
│   │   ├── whisperx_engine.py         # ~300 lignes - Provider local (WhisperX)
│   │   ├── groq_whisper_provider.py   # ~150 lignes - Provider cloud (Groq API)
│   │   ├── audio_capture.py           # ~200 lignes - Capture microphone
│   │   ├── vad_processor.py           # ~400 lignes - Voice Activity Detection
│   │   ├── text_injector.py           # ~320 lignes - Injection texte
│   │   └── hotkey_manager.py          # ~300 lignes - Raccourcis globaux
│   │
│   ├── ui/                        # INTERFACE UTILISATEUR
│   │   ├── hibiki_app.py              # ~1200 lignes - Fenetre principale
│   │   ├── settings_window.py         # ~600 lignes - Parametres generaux
│   │   ├── hotkey_settings_window.py  # ~450 lignes - Config raccourcis
│   │   ├── history_window.py          # ~300 lignes - Historique transcriptions
│   │   ├── dictionary_window.py       # ~350 lignes - Dictionnaire custom
│   │   ├── logs_window.py             # ~200 lignes - Viewer logs temps reel
│   │   ├── overlay_window.py          # ~240 lignes - Overlay always-on-top
│   │   ├── key_recorder_dialog.py     # ~400 lignes - Enregistrement hotkeys
│   │   └── system_tray.py             # ~100 lignes - Integration system tray
│   │
│   └── utils/                     # UTILITAIRES
│       ├── logger.py                  # Configuration Loguru
│       ├── audio_feedback.py          # Sons de confirmation
│       ├── auto_updater.py            # Check updates GitHub
│       ├── custom_dictionary.py       # Gestion dictionnaire JSON
│       ├── text_formatter.py          # Formatage auto texte
│       ├── threading_utils.py         # BoundedQueue thread-safe
│       └── transcription_history.py   # Stockage SQLite
│
├── config/                        # DONNEES UTILISATEUR
│   ├── hibiki_preferences.json        # Configuration principale
│   ├── custom_dictionary.json         # Dictionnaire personnalise
│   └── transcription_history.db       # Base SQLite historique
│
├── docs/                          # DOCUMENTATION
├── assets/                        # Icons et ressources
├── scripts/                       # Scripts build/install
├── models/                        # Modeles WhisperX telecharges
└── logs/                          # Logs application
```

### 1.2 Flux de Donnees

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Microphone    │────>│  AudioCapture   │────>│  VADProcessor   │
│   (sounddevice) │     │  (16kHz mono)   │     │  (Silero VAD)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         │ SpeechSegment
                                                         v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TextInjector   │<────│ TextFormatter   │<────│ TranscriptionEngine│
│ (clipboard/kbd) │     │ (ponctuation)   │     │ (WhisperX/Groq) │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         v                      v
┌─────────────────┐     ┌─────────────────┐
│  Application    │     │ CustomDictionary│
│    Active       │     │ (remplacements) │
└─────────────────┘     └─────────────────┘
                               │
                               v
                        ┌─────────────────┐
                        │TranscriptionHistory│
                        │   (SQLite)      │
                        └─────────────────┘
```

### 1.3 Dependances Principales

| Package | Version | Role |
|---------|---------|------|
| customtkinter | 5.2+ | Interface graphique moderne |
| whisperx | latest | Transcription locale (WhisperX) |
| torch | 2.2+ | Machine learning, CUDA |
| sounddevice | 0.4+ | Capture audio |
| pydantic | 2.0+ | Validation configuration |
| loguru | 0.7+ | Logging elegant |
| pystray | 0.19+ | System tray |
| keyboard | 0.13+ | Hotkeys globaux |
| pyperclip | 1.8+ | Clipboard |
| groq | latest | API Groq (optionnel) |

---

## 2. Fonctionnalites Implementees

### 2.1 Providers de Transcription

| Provider | Fichier | Statut | Performance | Notes |
|----------|---------|--------|-------------|-------|
| **WhisperX** | `whisperx_engine.py` | COMPLET | GPU <1s, CPU 5-15s | Local, forced alignment |
| **Groq Whisper** | `groq_whisper_provider.py` | COMPLET | ~0.5s | Cloud, necessite API key |
| **Canary Qwen** | - | CONFIG ONLY | - | Defini, pas implemente |
| **Voxtral** | - | CONFIG ONLY | - | Defini, pas implemente |

**Modeles WhisperX disponibles** :
- `base` - 74M params, rapide
- `small` - 244M params, equilibre
- `medium` - 769M params, precis
- `large-v3` - 1550M params, maximum precision

**Modeles Groq disponibles** :
- `whisper-large-v3-turbo` - Defaut, rapide
- `whisper-large-v3` - Plus precis
- `distil-whisper-large-v3-en` - English only

### 2.2 Systeme Audio

| Composant | Statut | Details |
|-----------|--------|---------|
| **Capture Audio** | COMPLET | sounddevice, 16kHz mono, chunks configurables |
| **VAD Silero** | COMPLET | Detection voix, accumulation segments, gestion chunks variables |
| **Feedback Audio** | COMPLET | Sons Windows (winsound) / Linux (paplay) |

**Parametres VAD configurables** :
- `threshold` : Seuil detection (defaut 0.4)
- `min_speech_duration_ms` : Duree min parole (defaut 250ms)
- `max_speech_duration_s` : Duree max segment (defaut 60s)
- `min_silence_duration_ms` : Silence pour fin segment (defaut 5000ms)

### 2.3 Injection de Texte

| Methode | Statut | Details |
|---------|--------|---------|
| **Clipboard** | COMPLET | pyperclip + Ctrl+V, preserve clipboard optionnel |
| **Keyboard** | COMPLET | Frappe directe, fallback si clipboard echoue |
| **Auto** | COMPLET | Clipboard d'abord, keyboard en fallback |

**Delais configures** :
- 0.3s apres copie clipboard
- 2.5s avant restauration clipboard (compatibilite apps lentes)

### 2.4 Hotkeys

| Feature | Statut | Details |
|---------|--------|---------|
| **Mode Toggle** | COMPLET | Appuyer pour start/stop |
| **Mode Push-to-Talk** | COMPLET | Maintenir pour enregistrer |
| **Raccourcis custom** | COMPLET | Enregistrement personnalise |
| **Detection conflits** | COMPLET | Avertit si raccourci systeme Windows |
| **Historique recent** | COMPLET | 5 derniers raccourcis utilises |

**Raccourcis par defaut** :
- Toggle : `Ctrl+Shift+Space`
- Push-to-Talk : Configurable

### 2.5 Interface Utilisateur

| Fenetre | Statut | Lignes | Description |
|---------|--------|--------|-------------|
| **Main App** | COMPLET | ~1200 | Fenetre principale, controles, theme toggle |
| **Settings** | COMPLET | ~600 | Device, model, langue, overlay config |
| **Hotkey Settings** | COMPLET | ~450 | Configuration raccourcis, recorder |
| **History** | COMPLET | ~300 | Liste transcriptions, recherche, export |
| **Dictionary** | COMPLET | ~350 | CRUD dictionnaire, preview |
| **Logs** | COMPLET | ~200 | Tail temps reel, filtres |
| **Overlay** | COMPLET | ~240 | Indicateur status always-on-top |
| **System Tray** | COMPLET | ~100 | Minimize to tray, menu contextuel |

**Themes** :
- Light mode (WCAG AAA)
- Dark mode (WCAG AAA)
- Toggle instantane

### 2.6 Historique de Transcription

| Feature | Statut | Details |
|---------|--------|---------|
| **Stockage SQLite** | COMPLET | `transcription_history.db` |
| **Recherche** | COMPLET | Recherche texte libre |
| **Export** | COMPLET | TXT et Markdown |
| **Auto-purge** | COMPLET | Max 100 entrees |
| **Reinjecter** | COMPLET | Copier texte passe dans app active |
| **Metadonnees** | COMPLET | Timestamp, confiance, provider, duree |

### 2.7 Dictionnaire Personnalise

| Feature | Statut | Details |
|---------|--------|---------|
| **Stockage JSON** | COMPLET | `custom_dictionary.json` |
| **CRUD** | COMPLET | Ajouter, modifier, supprimer |
| **Matching** | COMPLET | Whole-word, case-insensitive |
| **Application** | COMPLET | Post-transcription automatique |
| **UI** | COMPLET | Fenetre dediee avec preview |

### 2.8 Auto-Updater

| Feature | Statut | Details |
|---------|--------|---------|
| **Check GitHub** | COMPLET | Verification releases GitHub |
| **Notification** | COMPLET | Dialog si nouvelle version |
| **Download** | PARTIEL | Ouvre URL, pas de one-click install |

### 2.9 Text Formatter

| Feature | Statut | Details |
|---------|--------|---------|
| **Capitalisation** | COMPLET | Debut de phrase |
| **Espacement** | COMPLET | Correction espaces |
| **Mode auto** | COMPLET | Applique regles langue |

---

## 3. Fonctionnalites NON Implementees

### 3.1 Selon le Cahier des Charges (specifications.md)

| Feature | Priorite | Complexite | Notes |
|---------|----------|------------|-------|
| **Auto-reconnect model crash** | HAUTE | Moyenne | Relance moteur si exception |
| **Commandes vocales ponctuation** | MOYENNE | Haute | "point", "virgule", "nouvelle ligne" |
| **One-click update** | BASSE | Moyenne | Download + install auto |
| **Tests unitaires (80%+)** | HAUTE | Haute | Aucun test actuellement |
| **Provider Canary Qwen** | BASSE | Moyenne | Config existe, code manquant |
| **Provider Voxtral** | BASSE | Moyenne | Config existe, code manquant |

### 3.2 Features Phase 2 (Futures)

| Feature | Priorite | Notes |
|---------|----------|-------|
| Installateur .exe NSIS | HAUTE | Pour distribution publique |
| Switch multi-langues sans redemarrer | MOYENNE | Hot-reload model |
| Optimisation memoire GPU | MOYENNE | Liberation VRAM inactif |
| Integration Obsidian | BASSE | Plugin injecte dans notes |
| Integration Discord | BASSE | Raccourci dictee chats |
| Statistiques usage | BASSE | Graphiques temps, precision |
| Interface localisee | BASSE | Traduction UI FR/EN/ES |
| Themes personnalises | BASSE | Creation couleurs custom |

---

## 4. Limitations et Problemes Connus

### 4.1 Limitations Techniques

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **CPU lent** | Latence 5-15s sur CPU | Utiliser GPU ou Groq |
| **VRAM usage** | large-v3 = ~6GB | Utiliser model plus petit |
| **Windows only** | Pas de support macOS | Linux fonctionne partiellement |
| **Un seul mic** | Pas de selection micro | Utiliser device par defaut |

### 4.2 Bugs Resolus Recemment

| Bug | Date | Solution |
|-----|------|----------|
| VAD chunk size mismatch | 2026-01-21 | Decoupe en fenetres 512 samples |
| PyTorch 2.6 stdout/stderr | 2026-01-21 | Backup/restore sys.stdout |

### 4.3 Points d'Attention

1. **Config audio** : `chunk_duration_ms` peut etre n'importe quelle valeur grace au fix VAD
2. **Groq API** : Necessite cle API (GROQ_API_KEY env var ou config)
3. **System tray** : Optionnel, peut echouer silencieusement sur certains systemes
4. **Overlay** : Peut etre masque par certaines apps en fullscreen

---

## 5. Metriques du Code

### 5.1 Taille du Code

| Module | Fichiers | Lignes (approx) |
|--------|----------|-----------------|
| `src/core/` | 7 | ~1700 |
| `src/ui/` | 9 | ~4200 |
| `src/utils/` | 7 | ~800 |
| `src/models/` | 1 | ~500 |
| **Total** | **24** | **~7200** |

### 5.2 Couverture Tests

| Module | Coverage |
|--------|----------|
| Total | **0%** (pas de tests) |

### 5.3 Documentation

| Type | Fichiers |
|------|----------|
| README | 1 |
| Guides utilisateur | 4 |
| Guides developpeur | 3 |
| Specifications | 1 |
| Changelog | 1 |

---

## 6. Configuration Utilisateur Actuelle

```json
{
  "transcription_provider": "groq_whisper",
  "whisperx": {
    "model": "large-v3",
    "device": "auto",
    "language": "fr"
  },
  "groq_whisper": {
    "model": "whisper-large-v3-turbo",
    "language": "fr"
  },
  "audio": {
    "sample_rate": 16000,
    "chunk_duration_ms": 96
  },
  "vad": {
    "threshold": 0.4,
    "min_silence_duration_ms": 5000
  },
  "hotkey": {
    "mode": "push_to_talk",
    "push_to_talk_key": "ctrl+left windows"
  },
  "overlay": {
    "position": "bottom_center",
    "opacity": 0.5
  },
  "theme_mode": "dark"
}
```

---

## 7. Roadmap Suggeree

### Phase 1.1 - Stabilisation (Priorite HAUTE)

1. [ ] **Auto-reconnect model crash** - Resilience en cas d'erreur
2. [ ] **Tests unitaires core** - Au moins VAD, TextInjector, providers
3. [ ] **Logging ameliore** - Meilleurs messages d'erreur pour debug

### Phase 1.2 - Ameliorations UX

1. [ ] **Commandes vocales** - "point", "virgule", "nouvelle ligne"
2. [ ] **Selection microphone** - Dropdown dans settings
3. [ ] **Indicateur confiance** - Afficher score confiance transcription

### Phase 2.0 - Distribution

1. [ ] **Installateur Windows** - PyInstaller + NSIS
2. [ ] **One-click update** - Download + install automatique
3. [ ] **Documentation end-user** - Guide video

### Phase 2.1 - Features Avancees

1. [ ] **Providers alternatifs** - Canary Qwen, Voxtral
2. [ ] **Multi-langue hot-swap** - Changer langue sans redemarrer
3. [ ] **Optimisation VRAM** - Unload model quand inactif

---

## 8. Questions pour Brainstorming

### Fonctionnalites

1. **Transcription fichiers** : Importer audio/video pour transcription batch ?
2. **Mode streaming** : Transcription continue sans press/release ?
3. **Profils** : Plusieurs configs (travail, gaming, streaming) ?
4. **Raccourcis par app** : Config differente selon l'application active ?

### Integrations

1. **API REST** : Exposer Hibiki comme service local ?
2. **Websocket** : Streaming temps reel vers autres apps ?
3. **Obsidian plugin** : Integration native ?
4. **VS Code extension** : Dictee directe dans editeur ?

### Performance

1. **Quantization** : Modeles INT4/INT8 plus rapides ?
2. **Batching** : Traiter plusieurs segments en parallele ?
3. **Caching** : Garder model en memoire entre sessions ?

### UX

1. **Onboarding** : Wizard premiere utilisation ?
2. **Tutoriel interactif** : Guide dans l'app ?
3. **Themes custom** : Editeur de couleurs ?
4. **Raccourcis vocaux** : "Hibiki, commence" / "Hibiki, arrete" ?

---

## Annexe : Fichiers Cles pour Reference

| Fichier | Description |
|---------|-------------|
| `src/models/config.py` | Toutes les options de configuration |
| `src/ui/hibiki_app.py` | Logique principale application |
| `src/core/vad_processor.py` | Detection voix et segmentation |
| `src/core/whisperx_engine.py` | Implementation WhisperX |
| `docs/specifications.md` | Cahier des charges original |
| `docs/LECONS-ERREURS.md` | Bugs resolus et lecons apprises |

---

**Document genere le** : 21 janvier 2026
**Par** : Claude (TAKUMI) pour Jay
