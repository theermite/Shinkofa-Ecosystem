# Plan d'Implémentation — Hikari Stream v1.0

> Découpage technique détaillé basé sur le CDC validé.

**Date** : 2026-01-31
**Statut** : Prêt pour implémentation

---

## Vue d'Ensemble des Phases

| Phase | Objectif | Complexité | Prérequis |
|-------|----------|------------|-----------|
| **Phase 1** | Core MVP — Streamer HoK sur Twitch | **Complexe** | Aucun |
| **Phase 2** | Multi-stream + Presets + Stream Deck | **Modéré** | Phase 1 |
| **Phase 3** | Éditeur visuel + Export Obsidian | **Modéré** | Phase 2 |
| **Phase 4** | Améliorations (IA Shizen, effets audio) | **Simple-Modéré** | Phase 3 |
| **Phase 5** | Polish (neurodiversité, marketplace) | **Simple-Modéré** | Phase 4 |

---

## Phase 1 — Core MVP (Complexité : COMPLEXE)

**Objectif** : Streamer Honor of Kings (mobile) sur Twitch en moins de 1 minute.

### Bloc 1.1 — Fondations Electron (Quick Win)

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.1.1 | Initialiser projet Electron + React 18 + TypeScript | Simple | - |
| 1.1.2 | Configurer Tailwind CSS + Design System de base | Simple | 1.1.1 |
| 1.1.3 | Structure dossiers (main, renderer, preload, shared) | Simple | 1.1.1 |
| 1.1.4 | Setup Zustand store global | Simple | 1.1.3 |
| 1.1.5 | Setup WebSocket server interne (port configurable) | Modéré | 1.1.3 |
| 1.1.6 | IPC handlers de base (app state, settings) | Simple | 1.1.3 |

**Checkpoint CP1** : Application Electron démarre avec une fenêtre React vide.

### Bloc 1.2 — Gestion Dépendances Externes

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.2.1 | Service de téléchargement FFmpeg (auto-détection plateforme) | Modéré | 1.1.3 |
| 1.2.2 | Service de téléchargement scrcpy | Modéré | 1.1.3 |
| 1.2.3 | Vérification/installation VB-Cable (optionnel, Windows) | Modéré | 1.1.3 |
| 1.2.4 | UI "First Launch" wizard pour dépendances | Simple | 1.2.1, 1.2.2 |
| 1.2.5 | Stockage sécurisé des paths (electron safeStorage) | Simple | 1.2.4 |

**Checkpoint CP2** : FFmpeg et scrcpy téléchargés et fonctionnels au premier lancement.

### Bloc 1.3 — Capture Vidéo

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.3.1 | Service FFmpeg wrapper (spawn, lifecycle, stdout parsing) | Complexe | 1.2.1 |
| 1.3.2 | Détection écrans disponibles (desktopCapturer Electron) | Simple | 1.1.3 |
| 1.3.3 | Capture écran PC (fullscreen + fenêtre spécifique) | Modéré | 1.3.1, 1.3.2 |
| 1.3.4 | Détection webcams disponibles (navigator.mediaDevices) | Simple | 1.1.1 |
| 1.3.5 | Capture webcam UVC | Modéré | 1.3.4 |
| 1.3.6 | Preview vidéo composite (canvas ou BrowserWindow offscreen) | Complexe | 1.3.3, 1.3.5 |

**Checkpoint CP3** : Aperçu écran + webcam dans l'UI.

### Bloc 1.4 — Cast Mobile (scrcpy)

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.4.1 | Service scrcpy wrapper (spawn, lifecycle) | Modéré | 1.2.2 |
| 1.4.2 | Détection appareils Android connectés (ADB) | Modéré | 1.4.1 |
| 1.4.3 | Assistant configuration initiale (mode dev, USB debug) | Simple | 1.4.2 |
| 1.4.4 | Connexion USB (première connexion obligatoire) | Modéré | 1.4.3 |
| 1.4.5 | Activation mode Wi-Fi (ADB tcpip) | Complexe | 1.4.4 |
| 1.4.6 | Connexion Wi-Fi automatique (découverte réseau) | Complexe | 1.4.5 |
| 1.4.7 | Capture audio Android (scrcpy audio forwarding) | Modéré | 1.4.6 |
| 1.4.8 | Intégration source "Phone" dans preview | Modéré | 1.4.6, 1.3.6 |

**Checkpoint CP4** : Cast mobile Wi-Fi fonctionnel avec audio.

### Bloc 1.5 — Encodage & Streaming RTMP

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.5.1 | Détection GPU (NVIDIA, AMD, Intel) | Modéré | 1.3.1 |
| 1.5.2 | Configuration encodeur (NVENC, AMF, QuickSync, x264 fallback) | Complexe | 1.5.1 |
| 1.5.3 | Encodage vidéo 1080p60 | Complexe | 1.5.2, 1.3.6 |
| 1.5.4 | Output RTMP vers Twitch | Modéré | 1.5.3 |
| 1.5.5 | Stockage sécurisé clé RTMP (encryption locale) | Simple | 1.5.4 |
| 1.5.6 | Indicateurs temps réel (bitrate, latence, état connexion) | Modéré | 1.5.4 |
| 1.5.7 | Reconnexion automatique RTMP | Modéré | 1.5.4 |

**Checkpoint CP5** : Stream 1080p60 vers Twitch fonctionnel.

### Bloc 1.6 — Audio

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.6.1 | Détection sources audio (micro, sorties système) | Modéré | 1.1.3 |
| 1.6.2 | Mixer audio basique (3 pistes : micro, PC, phone) | Complexe | 1.6.1, 1.4.7 |
| 1.6.3 | Contrôle volume par piste | Simple | 1.6.2 |
| 1.6.4 | Mute/Solo par piste | Simple | 1.6.2 |
| 1.6.5 | VU-mètres visuels | Modéré | 1.6.2 |
| 1.6.6 | Alertes visuelles (micro mute + live, clipping) | Simple | 1.6.5 |

**Checkpoint CP6** : Mixer audio fonctionnel avec 3 pistes.

### Bloc 1.7 — UI Principale MVP

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 1.7.1 | Layout principal (sidebar + preview + contrôles) | Simple | 1.1.2 |
| 1.7.2 | Panneau sources (écran, webcam, phone) | Simple | 1.3.6, 1.4.8 |
| 1.7.3 | Panneau mixer audio | Simple | 1.6.2 |
| 1.7.4 | Panneau indicateurs stream (bitrate, viewers, durée) | Simple | 1.5.6 |
| 1.7.5 | Boutons contrôle (Start/Stop stream, Preview) | Simple | 1.5.4 |
| 1.7.6 | Page settings (sources, encodage, RTMP) | Modéré | 1.5.5 |
| 1.7.7 | 1 scène fonctionnelle (layout simple Gaming) | Modéré | 1.7.1 |

**Checkpoint CP7 (Fin Phase 1)** : Stream mobile HoK sur Twitch fonctionnel.

---

## Phase 2 — Multi-stream + Presets + Stream Deck (Complexité : MODÉRÉ)

**Prérequis** : Phase 1 complète

### Bloc 2.1 — Multi-plateforme

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 2.1.1 | Output RTMP additionnel (YouTube) | Simple | Phase 1 |
| 2.1.2 | Multi-output simultané (Twitch + YouTube) | Modéré | 2.1.1 |
| 2.1.3 | OAuth Twitch (auth persistante) | Modéré | Phase 1 |
| 2.1.4 | OAuth YouTube | Modéré | 2.1.3 |
| 2.1.5 | Configuration par plateforme (titre, description, catégorie) | Simple | 2.1.3, 2.1.4 |
| 2.1.6 | UI sélection plateformes | Simple | 2.1.5 |

**Checkpoint CP8** : Stream simultané Twitch + YouTube avec OAuth.

### Bloc 2.2 — Presets de Session

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 2.2.1 | Schéma preset (JSON) | Simple | Phase 1 |
| 2.2.2 | CRUD presets (create, read, update, delete) | Simple | 2.2.1 |
| 2.2.3 | Application preset (1 clic = tout configuré) | Modéré | 2.2.2 |
| 2.2.4 | UI sélecteur presets (page accueil) | Simple | 2.2.3 |
| 2.2.5 | Duplication preset | Simple | 2.2.2 |

**Checkpoint CP9** : Preset "Office HoK" appliqué en 1 clic.

### Bloc 2.3 — Stream Deck PWA

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 2.3.1 | PWA boilerplate (React + manifest + service worker) | Modéré | Phase 1 |
| 2.3.2 | Découverte mDNS/Bonjour (réseau local) | Complexe | 2.3.1 |
| 2.3.3 | QR Code pour connexion rapide | Simple | 2.3.2 |
| 2.3.4 | WebSocket client (connexion au Core Engine) | Modéré | 2.3.1 |
| 2.3.5 | UI grille boutons personnalisable | Modéré | 2.3.4 |
| 2.3.6 | Action : changer scène | Simple | 2.3.5 |
| 2.3.7 | Action : start/stop stream | Simple | 2.3.5 |
| 2.3.8 | Action : mute/unmute | Simple | 2.3.5 |
| 2.3.9 | Indicateurs état (scène active, micro mute) | Simple | 2.3.5 |
| 2.3.10 | Persistance connexion (reconnexion auto) | Modéré | 2.3.4 |

**Checkpoint CP10** : Stream Deck PWA contrôle scènes et audio.

### Bloc 2.4 — Templates de Base

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 2.4.1 | Système de scènes (collection de layouts) | Modéré | Phase 1 |
| 2.4.2 | Transitions entre scènes (cut, fade) | Modéré | 2.4.1 |
| 2.4.3 | Template Gaming | Simple | 2.4.1 |
| 2.4.4 | Template Minimal | Simple | 2.4.1 |
| 2.4.5 | Template IRL/Talk | Simple | 2.4.1 |
| 2.4.6 | Template Starting Soon | Simple | 2.4.1 |
| 2.4.7 | Template Pause (BRB) | Simple | 2.4.1 |
| 2.4.8 | Template Ending | Simple | 2.4.1 |
| 2.4.9 | Personnalisation basique (couleurs, logo, textes) | Modéré | 2.4.3-2.4.8 |

**Checkpoint CP11 (Fin Phase 2)** : Multi-stream + presets + Stream Deck + 6 templates.

---

## Phase 3 — Éditeur Visuel + Export (Complexité : MODÉRÉ)

**Prérequis** : Phase 2 complète

### Bloc 3.1 — Éditeur Visuel

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 3.1.1 | Canvas éditeur avec aperçu temps réel | Complexe | Phase 2 |
| 3.1.2 | Drag & drop éléments | Modéré | 3.1.1 |
| 3.1.3 | Resize avec poignées | Modéré | 3.1.2 |
| 3.1.4 | Alignement/snap automatique | Modéré | 3.1.2 |
| 3.1.5 | Éléments : sources vidéo (capture, webcam, phone) | Modéré | 3.1.2 |
| 3.1.6 | Éléments : textes | Simple | 3.1.2 |
| 3.1.7 | Éléments : images/logos | Simple | 3.1.2 |
| 3.1.8 | Éléments : formes (rectangles, cercles) | Simple | 3.1.2 |
| 3.1.9 | Handles nommés (ex: webcam, phone, banner) | Simple | 3.1.5-3.1.8 |

**Checkpoint CP12** : Éditeur visuel drag & drop fonctionnel.

### Bloc 3.2 — Placeholders Dynamiques

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 3.2.1 | Upload images (emojis, badges, icônes) | Simple | 3.1.2 |
| 3.2.2 | Bibliothèque assets réutilisables | Modéré | 3.2.1 |
| 3.2.3 | Placeholders activables via Stream Deck | Modéré | 3.2.2, 2.3.5 |
| 3.2.4 | Action Stream Deck : toggle élément | Simple | 3.2.3 |
| 3.2.5 | Action Stream Deck : move élément (position preset) | Modéré | 3.2.3 |

**Checkpoint** : Affichage emoji/badge en live via Stream Deck.

### Bloc 3.3 — Marqueurs & Export

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 3.3.1 | Système de marqueurs (timestamp, type, description) | Simple | Phase 2 |
| 3.3.2 | UI grille types marqueurs (Epic, Fail, Clip, etc.) | Simple | 3.3.1 |
| 3.3.3 | Raccourci clavier marqueur | Simple | 3.3.1 |
| 3.3.4 | Action Stream Deck : placer marqueur | Simple | 3.3.2, 2.3.5 |
| 3.3.5 | Génération fichier Markdown Obsidian | Modéré | 3.3.1 |
| 3.3.6 | Export automatique fin de stream | Simple | 3.3.5 |
| 3.3.7 | Configuration chemin vault Obsidian | Simple | 3.3.6 |

**Checkpoint CP13** : Marqueurs en live + export Obsidian automatique.

### Bloc 3.4 — Intégration VB-Cable

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 3.4.1 | Détection VB-Cable installé | Simple | Phase 1 |
| 3.4.2 | Installation automatique si absent | Modéré | 3.4.1 |
| 3.4.3 | Configuration routing audio auto | Complexe | 3.4.2 |
| 3.4.4 | Option "utiliser mon setup existant" | Simple | 3.4.3 |

**Checkpoint (Fin Phase 3)** : Éditeur visuel + placeholders + marqueurs + export Obsidian.

---

## Phase 4 — Améliorations (Complexité : SIMPLE-MODÉRÉ)

**Prérequis** : Phase 3 complète

### Bloc 4.1 — Intégration IA Shizen

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 4.1.1 | API Shizen/DeepSeek pour génération layouts | Complexe | Phase 3 |
| 4.1.2 | Prompt engineering pour descriptions layouts | Modéré | 4.1.1 |
| 4.1.3 | UI assistant IA (chat) | Modéré | 4.1.2 |

### Bloc 4.2 — Effets Audio

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 4.2.1 | Noise gate | Modéré | Phase 3 |
| 4.2.2 | Compresseur | Modéré | 4.2.1 |
| 4.2.3 | Ducking (auto-lower music when speaking) | Modéré | 4.2.2 |

### Bloc 4.3 — TikTok Live

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 4.3.1 | Output RTMP TikTok | Simple | Phase 3 |
| 4.3.2 | UI configuration TikTok (RTMP aveugle) | Simple | 4.3.1 |

### Bloc 4.4 — Chat Unifié

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 4.4.1 | Connexion chat Twitch (IRC/WebSocket) | Modéré | Phase 3 |
| 4.4.2 | Connexion chat YouTube | Modéré | 4.4.1 |
| 4.4.3 | UI chat unifié | Modéré | 4.4.2 |

**Checkpoint (Fin Phase 4)** : IA Shizen + effets audio + TikTok + chat unifié.

---

## Phase 5 — Polish (Complexité : SIMPLE-MODÉRÉ)

**Prérequis** : Phase 4 complète

### Bloc 5.1 — Interface Morphique

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 5.1.1 | Profils neurodiversité (HPI, hypersensible, etc.) | Modéré | Phase 4 |
| 5.1.2 | Thèmes accessibilité (contraste élevé, taille texte) | Simple | 5.1.1 |
| 5.1.3 | Navigation clavier complète | Modéré | 5.1.2 |

### Bloc 5.2 — App Stream Deck Native

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 5.2.1 | App Android native (React Native) | Complexe | Phase 4 |
| 5.2.2 | Parité fonctionnelle avec PWA | Modéré | 5.2.1 |

### Bloc 5.3 — Marketplace

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 5.3.1 | Backend marketplace (API templates) | Complexe | Phase 4 |
| 5.3.2 | UI browse/install templates | Modéré | 5.3.1 |
| 5.3.3 | Système rating/reviews | Simple | 5.3.2 |

### Bloc 5.4 — Enregistrement Local

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 5.4.1 | Enregistrement local simultané au stream | Modéré | Phase 4 |
| 5.4.2 | Multi-piste (audio séparé) | Complexe | 5.4.1 |

### Bloc 5.5 — API Publique

| ID | Tâche | Complexité | Bloqué par |
|----|-------|------------|------------|
| 5.5.1 | Documentation API REST/WebSocket | Modéré | Phase 4 |
| 5.5.2 | Exemples intégrations custom | Simple | 5.5.1 |

**Checkpoint (Fin Phase 5)** : Version complète avec toutes les fonctionnalités.

---

## Risques Techniques & Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Performance FFmpeg sur CPU** | Stream saccadé | Moyenne | Prioriser encodage GPU, tester sur machines variées |
| **Latence scrcpy Wi-Fi > 100ms** | Expérience dégradée | Moyenne | Fallback USB, optimisation paramètres scrcpy |
| **Conflits audio Windows** | Pas de son stream | Haute | Option "use existing setup", détection VB-Cable |
| **WebSocket instable** | Stream Deck déconnecté | Faible | Heartbeat, reconnexion auto, timeout configurable |
| **OAuth tokens expirés** | Déconnexion plateformes | Faible | Refresh token, notifications utilisateur |
| **GPU non détecté** | Encodage CPU uniquement | Faible | Fallback x264, messages clairs à l'utilisateur |

---

## Ordre d'Implémentation Recommandé

### Itération 1 — Quick Wins (Fondations)
1. **1.1.1-1.1.6** : Setup projet Electron + WebSocket
2. **1.2.1-1.2.5** : Téléchargement FFmpeg/scrcpy

### Itération 2 — Capture Vidéo
3. **1.3.1-1.3.6** : Capture écran + webcam + preview
4. **1.4.1-1.4.8** : Cast mobile scrcpy

### Itération 3 — Streaming Core
5. **1.5.1-1.5.7** : Encodage + RTMP Twitch
6. **1.6.1-1.6.6** : Mixer audio

### Itération 4 — UI MVP
7. **1.7.1-1.7.7** : Interface principale + 1 scène

### Validation Phase 1
**Test** : Stream HoK sur Twitch pendant 2h sans coupure.

### Itération 5 — Multi-plateforme
8. **2.1.1-2.1.6** : YouTube + OAuth

### Itération 6 — Presets + Stream Deck
9. **2.2.1-2.2.5** : Presets
10. **2.3.1-2.3.10** : Stream Deck PWA

### Itération 7 — Templates
11. **2.4.1-2.4.9** : 6 templates + transitions

### Validation Phase 2
**Test** : Stream preset "Office HoK" avec Stream Deck contrôle.

---

## Dépendances Visualisées

```
Phase 1 (Core MVP)
==================

[1.1 Fondations] ──┬──> [1.2 Dépendances]
                   │
                   ├──> [1.3 Capture Vidéo] ──┐
                   │                          │
                   ├──> [1.4 Cast Mobile] ────┼──> [1.5 Encodage] ──> [1.7 UI]
                   │                          │
                   └──> [1.6 Audio] ──────────┘


Phase 2 (Multi-stream)
======================

[Phase 1] ──┬──> [2.1 Multi-plateforme]
            │
            ├──> [2.2 Presets]
            │
            ├──> [2.3 Stream Deck PWA]
            │
            └──> [2.4 Templates]


Phase 3 (Éditeur + Export)
==========================

[Phase 2] ──┬──> [3.1 Éditeur Visuel] ──> [3.2 Placeholders]
            │
            ├──> [3.3 Marqueurs + Export]
            │
            └──> [3.4 VB-Cable]
```

---

## Quick Wins vs Tâches Complexes

### Quick Wins (Démarrage rapide, valeur immédiate)
- 1.1.1-1.1.6 : Setup projet (templates existants)
- 1.2.1-1.2.2 : Download FFmpeg/scrcpy (scripts simples)
- 1.7.1 : Layout UI (Tailwind)
- 2.2.1-2.2.2 : Schéma + CRUD presets (JSON)
- 2.4.3-2.4.8 : Templates HTML5 (copier/adapter)

### Tâches Complexes (Nécessite expertise technique)
- 1.3.1 : FFmpeg wrapper (gestion processus, parsing)
- 1.4.5-1.4.6 : scrcpy Wi-Fi (ADB tcpip, découverte réseau)
- 1.5.2-1.5.3 : Encodage GPU (détection, configuration)
- 1.6.2 : Mixer audio (routing multi-source)
- 2.3.2 : Découverte mDNS (réseau local)
- 3.1.1 : Canvas éditeur temps réel

---

## Checkpoints de Validation

| Checkpoint | Phase | Critère de Succès |
|------------|-------|-------------------|
| **CP1** | 1.1 | App Electron démarre avec UI React |
| **CP2** | 1.2 | FFmpeg/scrcpy installés automatiquement |
| **CP3** | 1.3 | Preview écran + webcam visible |
| **CP4** | 1.4 | Cast mobile Wi-Fi fonctionnel |
| **CP5** | 1.5 | Stream Twitch 1080p60 stable |
| **CP6** | 1.6 | Mixer 3 pistes audio |
| **CP7** | 1.7 | UI complète Phase 1 |
| **CP8** | 2.1 | Multi-stream Twitch + YouTube |
| **CP9** | 2.2 | Preset appliqué en 1 clic |
| **CP10** | 2.3 | Stream Deck contrôle scènes |
| **CP11** | 2.4 | 6 templates disponibles |
| **CP12** | 3.1 | Éditeur visuel drag & drop |
| **CP13** | 3.3 | Export Obsidian automatique |

---

## Fichiers Critiques pour Implémentation

| Fichier | Rôle |
|---------|------|
| `src/main/index.ts` | Point d'entrée main process Electron |
| `src/preload/index.ts` | Context bridge pour IPC sécurisé |
| `src/renderer/App.tsx` | Composant React racine |
| `src/shared/types.ts` | Types TypeScript partagés |
| `src/services/ffmpeg.ts` | Wrapper FFmpeg |
| `src/services/scrcpy.ts` | Wrapper scrcpy |
| `src/services/websocket.ts` | Serveur WebSocket |
| `src/stores/streamStore.ts` | État global Zustand |

---

**Prêt pour implémentation. Première tâche : 1.1.1 — Initialiser projet Electron.**
