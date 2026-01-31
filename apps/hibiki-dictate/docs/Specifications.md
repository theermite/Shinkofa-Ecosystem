# 📋 Cahier des Charges - STT Ermite (Hibiki)

**Projet** : Alternative à Wispr Flow intégrée écosystème Shinkofa
**Copyright** : La Voie Shinkofa
**Développeur** : Jay "The Ermite" Goncalves
**Date création** : 07 janvier 2026
**Version** : MVP 1.0 → Public 2.0

---

## 🎯 Objectif Projet

Créer une application de dictée vocale **100% locale**, optimisée GPU, alternative gratuite et open-source à Wispr Flow, intégrée dans l'écosystème Shinkofa.

### Phases de Développement

1. **Phase 1 - MVP Personnel** (Priorité actuelle)
   - Usage personnel Jay uniquement
   - Focus : Fonctionnalité complète, stabilité, performance GPU
   - Timeline : Janvier 2026

2. **Phase 2 - Version Publique** (Futur)
   - Installateur .exe Windows facile pour grand public
   - Documentation end-user complète
   - Tests utilisateurs externes
   - Timeline : Février-Mars 2026

---

## ✅ Features MVP (Phase 1) - Priorité Absolue

### 1. **Performance & Moteur IA**
- [x] **GPU Acceleration** : Utilise RTX 3060 12GB pour transcription
- [x] **Meilleur taux de précision** : WhisperX avec forced alignment
- [x] **Multi-langue** : FR, EN, ES, DE, IT, PT, NL, PL, RU, ZH, JA, KO
- [x] **Auto-detection GPU/CPU** : Fallback CPU si GPU indisponible
- [ ] **Auto-reconnect si model crash** : Relance moteur automatiquement

### 2. **Interface & UX**
- [x] **System Tray** : Fonctionne réduite dans barre système Windows
- [x] **Overlay minimaliste** : Interface CustomTkinter moderne
- [x] **Feedback visuel** : Indicateur statut (Prêt/Écoute/Transcription)
- [ ] **Feedback audio** : Sons confirmation démarrage/arrêt/succès
- [x] **Theme sombre/clair** : Toggle avec sauvegarde préférence
- [x] **WCAG AAA** : Contrastes accessibilité (ratio 7:1+)

### 3. **Modes d'Enregistrement**
- [x] **Push-to-Talk** : Maintenir raccourci pour enregistrer
- [x] **Toggle mode** : Appuyer pour démarrer, re-appuyer pour arrêter
- [x] **Configuration Hotkeys** : Raccourcis personnalisables

### 4. **Gestion Transcriptions**
- [ ] **Historique temps réel** : Liste dernières transcriptions avec timestamps
  - Affichage dans interface principale (panneau latéral ou fenêtre séparée)
  - Possibilité de copier/modifier/réinjecter transcriptions passées
  - Stockage SQLite (max 100 entrées avec auto-purge)
- [x] **Injection directe texte** : Colle texte automatiquement dans app active
- [x] **Méthode injection** : Clipboard (Ctrl+V) avec fallback keyboard typing

### 5. **Dictionnaire Personnalisé**
- [ ] **Dictionnaire custom** : JSON éditable avec mots/phrases custom
  - Interface graphique pour ajouter/modifier/supprimer entrées
  - Exemples : "jay" → "Jay", "ermite" → "The Ermite", "whisper" → "WhisperX"
- [ ] **Correction automatique** : Applique remplacements post-transcription
  - Matching whole-word (éviter remplacements partiels)
  - Case-insensitive matching, case-preserving replacement

### 6. **Ponctuation & Mise en Forme**
- [x] **Ponctuation automatique** : WhisperX détecte ponctuation naturelle
- [ ] **Commandes vocales ponctuation** : "point", "virgule", "point d'interrogation"
- [ ] **Saut de ligne intelligent** : "nouvelle ligne", "nouveau paragraphe"

### 7. **Configuration & Paramètres**
- [x] **Fenêtre paramètres complète** : Device, Model, Language, Hotkeys
- [x] **Détection GPU automatique** : Affiche nom GPU (RTX 3060 12GB)
- [x] **Choix model WhisperX** : base, small, medium, large-v3
- [x] **Sauvegarde configuration** : JSON persistant

### 8. **Logs & Debugging**
- [x] **Logs temps réel** : Fenêtre dédiée avec tail automatique
- [x] **Niveaux logging** : DEBUG, INFO, WARNING, ERROR
- [x] **Boutons actions** : Actualiser, Effacer, Fermer

### 9. **Mises à Jour**
- [x] **Auto-update checker** : Vérification démarrage
- [x] **Notification** : Alerte si nouvelle version disponible
- [ ] **One-click update** : Téléchargement et installation automatique

---

## 🚀 Features Phase 2 (Public) - Après MVP

### 1. **Installation Grand Public**
- [ ] **Installateur .exe** : PyInstaller + NSIS, installation guidée
- [ ] **GUI ergonomique setup** : Choix répertoire, raccourcis bureau, auto-démarrage
- [ ] **Détection CUDA** : Téléchargement drivers NVIDIA si nécessaire
- [ ] **Téléchargement models auto** : Télécharge WhisperX au premier lancement

### 2. **Features Avancées**
- [ ] **Switch multi-langues** : Bascule langue sans redémarrer
- [ ] **Backup transcriptions local** : Export historique CSV/JSON
- [ ] **Optimisation mémoire GPU** : Libération VRAM quand inactif
- [ ] **Paramètres audio/VAD ajustables** : Threshold, min_speech_duration, etc.
- [ ] **Intégration Obsidian** : Plugin pour injecter dans notes actives
- [ ] **Intégration Discord** : Raccourci dictée dans chats Discord
- [ ] **Statistiques & analytics** : Graphiques usage, temps transcription, précision
- [ ] **Models alternatifs** : Support Canary, Voxtral pour comparaison

### 3. **Accessibilité & Localisation**
- [ ] **Documentation multilingue** : EN, FR, ES, DE
- [ ] **Interface localisée** : Traduction UI selon langue système
- [ ] **Thèmes personnalisés** : Création thèmes couleur custom

---

## 🛠️ Stack Technique

### Backend
- **Python 3.11+** : Langage principal
- **WhisperX** : Transcription vocale avec forced alignment
- **PyTorch 2.2+** : Machine learning, CUDA 12.x pour GPU
- **Silero VAD** : Voice Activity Detection
- **Sounddevice** : Capture audio microphone
- **Loguru** : Logging élégant
- **Pydantic** : Validation configuration

### Frontend
- **CustomTkinter 5.2+** : Interface graphique moderne
- **Pillow** : Gestion images/icônes
- **pystray** : System tray support

### Database
- **SQLite** : Stockage historique transcriptions

### DevOps
- **PyInstaller** : Création exécutable Windows
- **GitHub Actions** : CI/CD tests automatiques
- **pytest** : Tests unitaires (coverage ≥ 80%)

---

## Architecture Projet

```
Hibiki-Dictate/
├── src/
│   ├── main.py                  # Point d'entree
│   ├── models/
│   │   ├── config.py            # Configuration Pydantic
│   │   └── __init__.py
│   ├── core/
│   │   ├── whisperx_engine.py   # Moteur transcription
│   │   ├── audio_capture.py     # Capture micro
│   │   ├── vad_processor.py     # Voice Activity Detection
│   │   ├── text_injector.py     # Injection texte
│   │   ├── hotkey_manager.py    # Raccourcis clavier
│   │   └── transcription_provider.py
│   ├── ui/
│   │   ├── hibiki_app.py        # Interface principale
│   │   ├── settings_window.py   # Fenetre parametres
│   │   ├── hotkey_settings_window.py
│   │   ├── logs_window.py       # Logs temps reel
│   │   └── system_tray.py       # System tray
│   └── utils/
│       ├── logger.py            # Loguru setup
│       ├── threading_utils.py   # BoundedQueue
│       ├── auto_updater.py      # Verification mises a jour
│       ├── custom_dictionary.py
│       └── transcription_history.py
├── config/
│   ├── hibiki_preferences.json  # Configuration utilisateur
│   └── custom_dictionary.json
├── assets/
│   ├── hibiki_icon.ico          # Icone application
│   ├── hibiki_icon.png
│   ├── icon.ico
│   └── icon.png
├── docs/                        # Documentation
├── scripts/                     # Scripts build/install
├── models/                      # Modeles WhisperX telecharges
├── logs/                        # Logs application
├── .claude/                     # Instructions Claude Code
├── .gitignore
├── README.md
├── requirements.txt
├── start_hibiki.bat             # Lancement rapide Windows
└── start_hibiki_silent.vbs      # Lancement sans console
```

---

## Historique Nettoyage Depot (Effectue)

Le depot a ete reorganise le 2026-01-20 :

- Structure aplatie (suppression du sous-dossier `hibiki/`)
- Fichiers obsoletes supprimes (rapports ponctuels, anciens README)
- Documentation consolidee dans `docs/`
- Nommage snake_case applique

---

## 📊 Critères de Succès MVP

### Performance
- [x] **Latence GPU** : < 1 seconde (transcription 2-3s audio)
- [x] **Latence CPU** : 5-15 secondes (fallback acceptable)
- [x] **Précision** : ≥ 95% avec model `small` ou `medium`
- [x] **Mémoire GPU** : < 6 GB VRAM (compatible RTX 3060)

### Fonctionnalité
- [x] **Injection texte** : 100% fiable (clipboard + keyboard fallback)
- [ ] **Historique** : 100 dernières transcriptions accessibles
- [ ] **Dictionnaire** : 50+ entrées custom supportées
- [x] **Multi-langue** : 9+ langues fonctionnelles
- [x] **System Tray** : Minimize/restore/quit fonctionnel

### Qualité Code
- [ ] **Tests coverage** : ≥ 80% (backend core)
- [x] **Type hints** : 100% fonctions publiques
- [x] **Docstrings** : 100% modules/classes/fonctions
- [x] **Linting** : Zéro warnings (Ruff)
- [x] **Accessibilité** : WCAG AAA (ratio 7:1+)

### Documentation
- [x] **USER-GUIDE.md** : Guide end-user complet
- [x] **COPYRIGHT.md** : Licence CC BY-NC-SA 4.0
- [ ] **CHANGELOG.md** : Historique versions
- [x] **README.md** : Installation, usage, architecture
- [x] **Docstrings** : Google style, complètes

---

## 🔄 Workflow Développement

### Commits Atomiques
- **Format** : `type(scope): description`
- **Types** : `feat`, `fix`, `test`, `docs`, `refactor`, `chore`
- **Fréquence** : Toutes les 15-20 min minimum
- **Push** : Immédiat après chaque commit

### Branches
- **main** : Branche principale (développement direct)
- **feature/*** : Uniquement si feature expérimentale ou demande explicite Jay

### Tests
- **Unitaires** : pytest avec coverage ≥ 80%
- **Manuels** : Tests GUI manuels (pas d'automation complète)
- **CI/CD** : GitHub Actions (tests automatiques sur push)

---

## 🎯 Prochaines Étapes (Ordre Prioritaire)

### 1. Nettoyage Dépôt (Aujourd'hui)
- [ ] Supprimer dossiers/fichiers obsolètes
- [ ] Migrer code utile (`custom_dictionary.py`, `transcription_history.py`)
- [ ] Migrer config/données (`custom_dictionary.json`, `transcription_history.db`)
- [ ] Commit atomiques + push

### 2. Features Manquantes MVP (Cette Semaine)
- [ ] Intégrer `custom_dictionary.py` dans `HibikiApp` (fenêtre UI)
- [ ] Intégrer `transcription_history.py` dans `HibikiApp` (fenêtre UI)
- [ ] Implémenter feedback audio (sons start/stop/success)
- [ ] Implémenter auto-reconnect si model crash

### 3. Tests & Documentation (Cette Semaine)
- [ ] Tests unitaires core modules (≥ 80% coverage)
- [ ] Créer `CHANGELOG.md`
- [ ] Créer `COPYRIGHT.md` (Shinkofa template)
- [ ] Mettre à jour `README.md` final

### 4. Tests Utilisateur Jay (Semaine Prochaine)
- [ ] Tester workflow quotidien (streaming, dev, notes)
- [ ] Identifier bugs/améliorations
- [ ] Ajuster paramètres performance (latence, précision)

---

## 📞 Support & Contact

**Développeur** : Jay "The Ermite" Goncalves
**Organisation** : La Voie Shinkofa
**Email** : jay@shinkofa.com
**GitHub** : [@theermite](https://github.com/theermite)

---

**Version Cahier des Charges** : 1.0
**Dernière mise à jour** : 07 janvier 2026
**Statut** : En développement (MVP Phase 1)
