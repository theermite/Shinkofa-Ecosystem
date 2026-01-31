# Cahier des Charges — Hikari Stream v1.0

> Application de streaming standalone qui remplace OBS + plugins + services externes par un outil unique, simple et puissant.

**Version** : 1.0
**Date** : 2026-01-30
**Statut** : Validé

---

## 1. Vision & Objectifs

### 1.1 Problème à résoudre

Le workflow streaming actuel est fragmenté et chronophage :
- OBS pour la capture/encodage
- Streamer.bot pour les automatisations
- Deck web externe pour le contrôle
- Vysor/scrcpy pour le cast mobile (configuration manuelle)
- Sonar pour l'audio (bugs fréquents)
- Configuration manuelle des infos stream à chaque session

**Résultat** : 10-15 minutes de setup avant chaque stream, stress constant ("est-ce que ça va marcher ?").

### 1.2 Solution Hikari Stream

Un outil unique qui :
- Capture, encode et streame vers Twitch + YouTube
- Intègre le cast mobile (scrcpy) avec connexion Wi-Fi automatique
- Fournit un Stream Deck PWA intégré
- Gère le routing audio intelligemment
- Applique des presets de session en 1 clic

### 1.3 Objectif mesurable

**Temps de mise en place d'un stream : < 1 minute** (vs 10-15 min actuellement)

Workflow cible :
```
1. Ouvrir Hikari
2. Sélectionner preset "Office HoK"
3. Cliquer "Go Live"
→ Live en moins de 60 secondes
```

---

## 2. Personas & Cas d'usage

### 2.1 Persona principal : Jay

**Profil** : HPI, TDAH, hypersensible, multipotentiel
**Streams** : Honor of Kings (mobile), Dofus (PC), IRL/Talk
**Besoins** :
- Lancer un stream mobile (HoK) en < 1 minute
- Contrôler les scènes/audio depuis tablette (Stream Deck)
- Marquer les moments forts pour montage ultérieur
- Export automatique vers Obsidian après stream

**Frustrations actuelles** :
- Trop d'apps à ouvrir/synchroniser
- Config scrcpy manuelle à chaque fois
- Bugs audio fréquents (Sonar)
- Incertitude sur l'état des connexions

### 2.2 Persona secondaire : Streamer standard

**Profil** : Streamer occasionnel, peu technique
**Besoins** :
- Templates d'overlay prêts à l'emploi
- Personnalisation simple (couleurs, logo)
- Pas de configuration complexe

### 2.3 Persona tertiaire : Power user

**Profil** : Streamer avancé voulant customiser
**Besoins** :
- Personnalisation poussée via éditeur visuel + Shizen IA
- API pour intégrations custom (Phase 5)
- Utilisation de son propre setup audio (VoiceMeeter, GoXLR)

---

## 3. Fonctionnalités MVP

### 3.1 Streaming multi-plateforme

**Plateformes supportées (MVP)** :
- Twitch (RTMP + API complète)
- YouTube Live (RTMP + API)

**Fonctionnalités** :
- Authentification OAuth persistante (pas de reconnexion à chaque session)
- Configuration par plateforme : titre, description, catégorie/jeu, tags
- Stockage sécurisé des clés RTMP (chiffrement local)
- Indicateurs temps réel : état connexion, bitrate, latence
- Reconnexion automatique en cas de coupure réseau

**Reporté** :
- TikTok Live (Phase 2 — pas d'API, RTMP aveugle)
- Facebook Gaming, Kick (Phase 3+)

### 3.2 Capture vidéo

**Sources supportées** :
- Capture écran (fullscreen ou fenêtre spécifique)
- Webcam PC (UVC)
- Cast mobile Android (scrcpy) — écran + audio

**Encodage** :
- Résolution cible : 1080p60
- Encodeurs prioritaires : NVENC (NVIDIA), AMF (AMD), QuickSync (Intel)
- Fallback : x264 logiciel
- Multi-output RTMP (une connexion par plateforme)

### 3.3 Cast mobile (scrcpy intégré)

**Objectif** : Caster l'écran du téléphone Android en 1 clic (après config initiale).

**Configuration initiale (une seule fois)** :
1. Assistant guidé visuel dans Hikari
2. Instructions pas à pas avec screenshots :
   - Activer mode développeur
   - Activer débogage USB
   - Autoriser Hikari
3. Activation automatique du mode Wi-Fi pour les sessions suivantes

**Usage quotidien** :
```
Téléphone sur le même réseau Wi-Fi
→ Hikari détecte automatiquement
→ 1 clic "Connecter"
→ Capture écran + audio active
```

**Spécifications techniques** :
- Latence cible : < 100ms
- Résolution : 1080p (configurable)
- Audio : capture son du téléphone via scrcpy audio forwarding
- Fallback USB si Wi-Fi instable

**Intégration** :
- Source "Phone" positonnable dans les layouts
- Volume contrôlable dans le mixer
- Affichage : PiP, fullscreen, ou position custom

### 3.4 Audio

**Architecture** :
- Intégration VB-Cable automatique (installé par Hikari si absent)
- Option "Utiliser mon setup existant" pour utilisateurs avancés (VoiceMeeter, GoXLR, etc.)

**Pistes audio MVP** :
| Piste | Source | Envoyé au stream |
|-------|--------|------------------|
| Micro | Entrée micro PC | Oui |
| Son PC | Sortie système | Oui |
| Son téléphone | Cast mobile (scrcpy) | Oui |
| Musique stream | Player intégré ou source externe | Oui |
| Musique perso | Source externe | Non (monitor only) |

**Mixer** :
- Contrôle volume individuel par piste
- Mute/Solo par piste
- Indicateurs VU-mètres
- Alertes visuelles :
  - Micro muté alors que stream live
  - Clipping détecté (> 0dB)

**Reporté** :
- Effets (gate, compresseur, ducking) — Phase 3
- Enregistrement multi-piste local — Phase 3

### 3.5 Scènes & Layouts

**Système de scènes** :
- Chaque scène = un layout HTML5/CSS/JS
- Transition entre scènes (cut, fade)
- Scènes par défaut : Starting Soon, Live, Pause, Ending

**Templates inclus (MVP)** :
| Template | Description |
|----------|-------------|
| Gaming | Capture jeu fullscreen + webcam coin + overlay minimal |
| Minimal | Capture uniquement + petit bandeau |
| IRL/Talk | Webcam grande + espace chat + infos |
| Starting Soon | Écran d'attente animé |
| Pause | Écran pause (BRB) |
| Ending | Écran de fin avec remerciements |

**Personnalisation** :
- Couleurs (primaire, secondaire, accent)
- Logo/avatar
- Textes (pseudo, réseaux sociaux)
- Polices (sélection parmi fonts safe)

**Éditeur visuel (MVP)** :
- Canvas avec aperçu en temps réel
- Éléments drag & drop :
  - Sources vidéo (capture, webcam, phone)
  - Textes
  - Images/logos
  - Formes (rectangles, cercles)
  - **Placeholders dynamiques** (voir ci-dessous)
- Resize avec poignées
- Alignement/snap automatique
- Chaque élément = un "handle" nommé (ex: `webcam`, `phone`, `banner`)
- Handles contrôlables via Stream Deck

**Placeholders dynamiques** :
Zones réservées dans le layout pour afficher du contenu activable en live.

- Upload d'images (emojis, icônes, badges, alertes visuelles)
- Bibliothèque d'assets uploadés, réutilisables entre scènes
- Activation/désactivation via Stream Deck
- Cas d'usage :
  - Afficher emoji "GG" après un kill
  - Afficher badge "BRB" pendant une pause
  - Déclencher une alerte visuelle custom (raid, sub, etc.)
- Chaque placeholder = un handle (ex: `emoji-zone-1`, `alert-badge`)

**Reporté** :
- Intégration Shizen/DeepSeek pour génération layouts IA — Phase 4
- Marketplace de templates — Phase 5

### 3.6 Stream Deck PWA

**Technologie** : Progressive Web App (installable sur smartphone/tablette)

**Connexion** :
- Découverte automatique sur réseau local (mDNS/Bonjour)
- QR Code affiché dans Hikari pour connexion rapide
- WebSocket sécurisé (TLS local)
- Connexion persistante (pas de reconnexion à chaque session)

**Interface** :
- Grille de boutons personnalisable (4x4, 5x3, etc.)
- Icônes + texte par bouton
- Indicateurs d'état (scène active, micro muté, etc.)

**Actions disponibles (MVP)** :
| Action | Description |
|--------|-------------|
| Changer scène | Passer à une scène spécifique |
| Start/Stop stream | Démarrer ou arrêter le live |
| Mute/Unmute | Contrôle audio par piste |
| Toggle élément | Afficher/masquer un handle |
| Move élément | Déplacer un handle (position preset) |
| Placer marqueur | Marquer moment fort |

**Éditeur d'actions** :
- UI no-code pour configurer chaque bouton
- Possibilité de chaîner plusieurs actions (macro)
- Ex: "Scène Pause" = changer scène + mute micro + afficher BRB

**Reporté** :
- App Android native — Phase 4
- Animations custom déclenchables — Phase 3

### 3.7 Presets de sessions

**Concept** : Un preset = configuration complète pour un type de stream.

**Contenu d'un preset** :
- Nom (ex: "Office HoK", "Dofus Ranked", "IRL Talk")
- Plateformes activées (Twitch, YouTube, ou les deux)
- Titre/description/catégorie par plateforme
- Scène de démarrage
- Configuration audio par défaut
- Layout/template sélectionné

**Fonctionnalités** :
- Sélecteur rapide au lancement
- Bouton "Éditer" et "Dupliquer"
- Application en 1 clic → tous les champs pré-remplis

### 3.8 Marqueurs & Export Obsidian

**Marqueurs en live** :
- Bouton Stream Deck "Mark" → ouvre une grille de types
- Raccourci clavier configurable

**Système de marquage rapide** :
Quand tu appuies sur "Mark", une grille de boutons s'affiche sur le Stream Deck :

| Bouton | Description prédéfinie |
|--------|------------------------|
| Epic | Moment épique à clipper |
| Fail | Fail mémorable |
| Clip | Passage à extraire |
| Bug | Bug/problème technique |
| Info | Information à noter |
| Custom | (saisie libre optionnelle) |

- 1 tap sur le type → marqueur créé instantanément avec description prédéfinie
- Pas besoin de taper du texte en live
- Types personnalisables dans les paramètres
- Métadonnées enregistrées : timestamp, type, description

**Export Obsidian (automatique à la fin du stream)** :
```markdown
---
date: 2026-01-30
platforms: [twitch, youtube]
duration: 2h35m
peak_viewers: 42
total_messages: 847
new_followers: 12
game: Honor of Kings
preset: Office HoK
---

# Stream - Office HoK - 2026-01-30

## Stats
- Durée : 2h35m
- Pic viewers : 42
- Messages chat : 847
- Nouveaux followers : 12

## Marqueurs
- 00:15:23 - [Epic] First blood
- 00:47:12 - [Epic] Pentakill
- 01:22:45 - [Fail] Throw au baron

## Notes
(espace pour notes manuelles)
```

**Configuration** :
- Chemin vault configurable (ex: `Streams/2026/01-Janvier/`)
- Génération automatique ou manuelle

---

## 4. Architecture technique

### 4.1 Stack

| Composant | Technologie |
|-----------|-------------|
| Desktop App | Electron |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| État | Zustand |
| Layouts HTML5 | Chromium intégré (Electron) |
| Communication | WebSocket (ws) |
| Capture/Encodage | FFmpeg |
| Cast mobile | scrcpy |
| Audio routing | VB-Cable (optionnel) |

### 4.2 Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                      Hikari Stream                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   UI React  │  │  Layouts    │  │  Stream Deck PWA    │  │
│  │  (Electron) │  │  (HTML5)    │  │  (externe)          │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                   ┌──────▼──────┐                            │
│                   │  WebSocket  │                            │
│                   │   Server    │                            │
│                   └──────┬──────┘                            │
│                          │                                   │
│  ┌───────────────────────┼───────────────────────────────┐  │
│  │                  Core Engine                           │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │ Capture │  │  Audio  │  │ Encoder │  │  RTMP   │   │  │
│  │  │ Manager │  │  Mixer  │  │ FFmpeg  │  │ Output  │   │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │  │
│  │       │            │            │            │         │  │
│  │  ┌────▼────┐  ┌────▼────┐       │       ┌────▼────┐   │  │
│  │  │ scrcpy  │  │VB-Cable │       │       │ Twitch  │   │  │
│  │  │ (phone) │  │ (audio) │       │       │ YouTube │   │  │
│  │  └─────────┘  └─────────┘       │       └─────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Dépendances externes

| Dépendance | Gestion |
|------------|---------|
| FFmpeg | Téléchargement auto au premier lancement |
| scrcpy | Téléchargement auto au premier lancement |
| VB-Cable | Téléchargement auto si utilisateur choisit l'option |

### 4.4 Communication

**WebSocket** (canal principal) :
- UI ↔ Core : commandes, état
- Core ↔ Layouts : événements, données dynamiques
- Core ↔ Stream Deck : actions, état

**IPC Electron** :
- Renderer ↔ Main process

**APIs externes** :
- Twitch API (OAuth, infos stream, stats)
- YouTube Data API (OAuth, infos stream)

---

## 5. Exigences non-fonctionnelles

### 5.1 Performance

- Streaming 1080p60 stable sur config avec GPU dédié (GTX 1060+)
- Utilisation GPU prioritaire pour encodage (< 20% CPU en encode GPU)
- Latence cast mobile < 100ms

### 5.2 Stabilité

- Pas de crash silencieux : logs détaillés
- Messages d'erreur compréhensibles (pas de stacktrace brut)
- Reconnexion automatique (réseau, cast mobile)

### 5.3 Sécurité

- Clés RTMP chiffrées localement
- Tokens OAuth stockés de manière sécurisée (Electron safeStorage)
- Aucune donnée envoyée vers serveur externe sans consentement

### 5.4 Accessibilité

- Navigation clavier sur l'UI principale
- Contrastes WCAG AA minimum
- Pas d'animations clignotantes

---

## 6. Roadmap

### Phase 1 — Core MVP (Priorité absolue)

**Objectif** : Streamer un jeu mobile (HoK) sur Twitch en < 1 minute.

- [ ] Structure projet Electron + React
- [ ] Capture écran PC (FFmpeg)
- [ ] Capture webcam
- [ ] Cast mobile scrcpy (USB + Wi-Fi)
- [ ] Encodage NVENC/x264
- [ ] Streaming RTMP vers Twitch
- [ ] Mixer audio basique (micro + PC + phone)
- [ ] UI principale (aperçu, contrôles, indicateurs)
- [ ] 1 scène fonctionnelle

### Phase 2 — Multi-stream + Presets + Stream Deck

- [ ] Streaming YouTube (multi-RTMP)
- [ ] Auth OAuth Twitch + YouTube
- [ ] Configuration titre/catégorie par plateforme
- [ ] Presets de sessions
- [ ] Stream Deck PWA (scènes, mute, start/stop)
- [ ] Templates de base (Gaming, Minimal, IRL, Starting/Pause/Ending)

### Phase 3 — Éditeur visuel + Export

- [ ] Éditeur visuel drag & drop
- [ ] Handles contrôlables via Stream Deck
- [ ] Marqueurs en live
- [ ] Export Obsidian automatique
- [ ] Intégration VB-Cable automatique

### Phase 4 — Améliorations

- [ ] Intégration Shizen/DeepSeek (génération/édition layouts via IA)
- [ ] Effets audio (gate, compresseur, ducking)
- [ ] TikTok Live (RTMP)
- [ ] Chat unifié

### Phase 5 — Polish

- [ ] Interface morphique (profils neurodiversité)
- [ ] App Android Stream Deck
- [ ] Marketplace templates
- [ ] Enregistrement local multi-piste
- [ ] API publique pour power users (intégrations custom)

---

## 7. Critères d'acceptation MVP

| Critère | Mesure |
|---------|--------|
| Temps setup stream | < 1 minute (preset → live) |
| Cast mobile Wi-Fi | 1 clic après config initiale |
| Stabilité stream | 2h sans coupure sur connexion stable |
| Stream Deck | Changement scène + mute en < 1s |
| Export Obsidian | Fichier généré automatiquement à la fin |

---

## 8. Hors scope MVP

- Support macOS/Linux (Windows uniquement pour MVP)
- Streaming TikTok/Facebook/Kick
- Alerts (follows, subs, donations) — intégration future
- Chat overlay intégré
- Enregistrement local
- Profils neurodiversité avancés

---

## Annexe A — Glossaire

| Terme | Définition |
|-------|------------|
| Handle | Élément nommé dans un layout, contrôlable via API/Stream Deck |
| Preset | Configuration complète d'une session de stream |
| Layout | Template HTML5/CSS/JS définissant l'apparence d'une scène |
| scrcpy | Outil open-source pour afficher/contrôler un appareil Android |
| VB-Cable | Driver audio virtuel pour router le son entre applications |

---

## Annexe B — Références

- [scrcpy](https://github.com/Genymobile/scrcpy) — Cast Android
- [FFmpeg](https://ffmpeg.org/) — Capture/Encodage
- [Electron](https://www.electronjs.org/) — Framework desktop
- [VB-Cable](https://vb-audio.com/Cable/) — Audio virtuel
