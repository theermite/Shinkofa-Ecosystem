# Changelog Hibiki

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - 2025-01-01

### 🎉 Première Release - Hibiki

Application de dictée vocale standalone développée par La Voie Shinkofa.

### ✨ Ajouté

**Core Features** :
- 🎙️ Transcription vocale temps réel avec WhisperX
- 🧠 Détection automatique GPU/CPU avec optimisation
- 🌐 Support multilingue (français, anglais, espagnol, etc.)
- ⚡ Voice Activity Detection (VAD) avec Silero
- ⌨️ Raccourcis clavier configurables (défaut : Ctrl+Shift+Space)
- 📋 Injection automatique du texte (clipboard + keyboard)

**Interface Utilisateur** :
- 🎨 Design Shinkofa (charte graphique WCAG 2.1 AAA)
- 🌓 Mode clair/sombre/auto
- ♿ Accessibilité optimale (dyslexie, TDAH, daltonisme)
- 🎯 Interface minimaliste et intuitive
- 🔴 Icône emoji 🎙️ intégrée

**Configuration** :
- ⚙️ Configuration JSON (`config/hibiki_preferences.json`)
- 🔧 Paramètres personnalisables (langue, modèle, raccourcis)
- 📝 Logging détaillé avec Loguru

**Documentation** :
- 📖 USER-GUIDE.md (guide utilisateur non-technique)
- 📘 README.md (documentation développeur)
- 📜 COPYRIGHT.md (licence CC BY-NC-SA 4.0)
- 🚀 INSTALLATION.md (guide installation)

**Sécurité & Confidentialité** :
- 🔒 Données 100% locales (aucun cloud)
- 🛡️ Pas de tracking, télémétrie ou analytics
- 🔐 Aucun compte requis
- 🏠 Modèles IA stockés localement

### 🎯 Spécifications Techniques

**Moteur de Transcription** :
- WhisperX avec forced alignment
- Modèles : base, small, medium, large-v3
- Support GPU (CUDA) et CPU
- Compute types : float16 (GPU), int8 (CPU)

**Architecture** :
- Python 3.11+
- CustomTkinter pour l'UI
- PyTorch 2.0+
- Pydantic pour la configuration
- Silero VAD pour détection vocale

**Plateformes Supportées** :
- Windows 10/11 64-bit
- Linux (Ubuntu, Debian, etc.)

### 🏷️ Copyright

© 2025 La Voie Shinkofa
Développé par Jay "The Ermite" Goncalves

---

## [Unreleased] - Fonctionnalités Futures

### 🔮 Planifié

- [ ] Transcription de fichiers audio (pas seulement temps réel)
- [ ] Export transcriptions en fichiers texte
- [ ] Dictionnaire personnalisé (mots techniques)
- [ ] Correction orthographique post-transcription
- [ ] Commandes vocales (ponctuation, formatage)
- [ ] Support macOS
- [ ] Interface paramètres graphique (actuellement JSON manuel)
- [ ] Support langues supplémentaires (arabe, chinois, japonais)
- [ ] Plugin dictée pour Obsidian
- [ ] Mode push-to-talk amélioré

### 💡 Idées Communauté

*(Proposez vos idées sur GitHub Issues !)*

---

**Format** : [version] - YYYY-MM-DD
**Types** : Ajouté, Modifié, Déprécié, Supprimé, Corrigé, Sécurité
