# PROJECT OVERVIEW - Ermite-Podcaster

<metadata>
Type: Progressive Web App (PWA)
Owner: Jay The Ermite (Projet Personnel)
Status: Production-Ready (v1.0.23 - 2024-12-25)
Hébergement Recommandé: o2Switch (static site)
Stack: React 18 + Vite 5 + Tailwind CSS + Web Audio API
</metadata>

---

## 📋 INDEX RAPIDE

| Section | Contenu |
|---------|---------|
| [Vue d'ensemble](#-vue-densemble) | Mission, utilisateurs cibles, proposition de valeur |
| [Fonctionnalités Utilisateur](#-fonctionnalités-utilisateur) | Toutes les features accessibles aux end-users |
| [Architecture Technique](#-architecture-technique) | Stack, structure code, services, data flow |
| [Maintenance & Développement](#-maintenance--développement) | Setup local, build, déploiement, troubleshooting |
| [Roadmap & État Actuel](#-roadmap--état-actuel) | Versions, changelog, améliorations futures |
| [Documentation & Ressources](#-documentation--ressources) | Liens vers docs, fichiers clés, support |

---

## 🎯 VUE D'ENSEMBLE

### Mission
**Podcast The Ermite** est une application web gratuite pour enrichir vos fichiers audio (podcasts, méditations, formations) avec des **fréquences thérapeutiques** et de la **musique d'ambiance méditative**, avec un traitement **100% local** (aucune donnée envoyée à des serveurs).

### Utilisateurs Cibles
- **Podcasteurs** : Enrichir contenus audio avec fréquences sacrées
- **Coachs/Thérapeutes** : Créer méditations guidées avec fréquences binaurales
- **Créateurs de contenu** : Générer vidéos + thumbnails pour YouTube/TikTok/Instagram
- **Utilisateurs soucieux de la vie privée** : Traitement 100% client-side

### Proposition de Valeur Unique
1. **Fréquences Thérapeutiques Intégrées** : 9 fréquences (432 Hz, 528 Hz, binaurales gamma/alpha/theta/delta)
2. **Workflow Complet** : Audio → Transcription → Vidéo → Thumbnail (tout-en-un)
3. **Privacy-First** : Aucun serveur backend, Web Audio API locale
4. **Multi-Format Export** : Générer simultanément 16:9 (YouTube), 9:16 (TikTok), 1:1 (Instagram)
5. **Progressive Web App** : Fonctionne offline, installable comme app native

### État Actuel
- **Version Production** : v1.0.23 (25 décembre 2024)
- **Statut** : Production-ready, activement maintenu
- **Déploiement** : o2Switch (static site hosting)
- **Licence** : Personal Restrictive License (usage personnel autorisé, commercial interdit)

---

## 🚀 FONCTIONNALITÉS UTILISATEUR

### 1️⃣ UPLOAD & ENREGISTREMENT AUDIO

**Upload Fichier**
- Formats supportés : MP3, WAV, M4A, OGG, WEBM
- Glisser-déposer ou sélection fichier

**Enregistrement Micro**
- Enregistrement direct depuis microphone
- Pause/Reprise durant enregistrement
- Mode test micro (prévisualisation volume avant enregistrement)
- Timer temps réel
- Export automatique en WebM

### 2️⃣ ENRICHISSEMENT AUDIO

**Fréquences Thérapeutiques** (9 options)

| Fréquence | Type | Bénéfices |
|-----------|------|-----------|
| **432 Hz** | Pure | Harmonie sacrée, ancrage |
| **528 Hz** | Pure | Réparation ADN, transformation |
| **639 Hz** | Pure | Harmonisation relations |
| **741 Hz** | Pure | Éveil conscience, détoxification |
| **40 Hz** | Binaurale Gamma | Concentration maximale |
| **10 Hz** | Binaurale Alpha | Relaxation éveillée |
| **6 Hz** | Binaurale Theta | Méditation profonde |
| **3 Hz** | Binaurale Delta | Sommeil profond |
| **Aucune** | - | Voix + ambiance uniquement |

- Volume fréquence : 1-20% (recommandé 5-10%)

**Musique d'Ambiance** (3 modes)

| Mode | Description | Contenu |
|------|-------------|---------|
| **Aucune** | Voix + fréquence uniquement | - |
| **Bibliothèque** | 8 morceaux gratuits inclus | Brazilian Streets, Calm Soul Meditation, Chamanic Flute 432 Hz, Eona Emotional Ambient Pop, Healing Sleep Atmosphere, Meditation Background, Pure Theta 4-7Hz (Water Flow), Vlog Beat Background |
| **Upload Perso** | Votre propre musique | MP3/WAV/OGG |

- Volume ambiance : 1-30% (recommandé 10-15%)

**Presets Audio**
- Sauvegarder configuration complète (fréquence + ambiance + volumes)
- Charger preset d'un clic
- Auto-save : Dernière config chargée au démarrage
- Export/Import JSON pour backup/partage

**Templates Complets** (Audio + Vidéo + Thumbnail)
- **3 templates par défaut** : The Ermite Pro, Light, Emerald
- **Chargement 1-clic** : Toute la configuration workflow en une fois
- **Création custom** : Sauvegarder vos propres templates complets

### 3️⃣ EXPORT AUDIO

**Génération Audio Enrichi**
- Mixage automatique : Voix + Fréquence + Ambiance
- Volume master : 10-200% (100% = original)
- Visualisation waveform (style Audacity)
- Prévisualisation avant téléchargement
- Export **WAV haute qualité** (PCM 16-bit non compressé)
- Nom fichier éditable avec date automatique

### 4️⃣ TRANSCRIPTION (Optionnel)

**APIs de Transcription**

| Service | Tarif | Langues | Qualité |
|---------|-------|---------|---------|
| **Whisper OpenAI** | ~$0.006/min | Multilingue (dont français) | Ultra-rapide, excellente |
| **AssemblyAI** | 5h/mois gratuit | Français supporté | Très bonne |
| **Saisie Manuelle** | Gratuit | - | Format timestamps manuels |

**Fonctionnalités**
- Édition inline du transcript
- Export SRT/VTT (sous-titres)
- Horodatage précis (startTime, endTime, text)
- Indispensable pour génération vidéo

### 5️⃣ GÉNÉRATION VIDÉO (Optionnel)

**3 Styles d'Animation**

| Style | Description | Personnalisation |
|-------|-------------|------------------|
| **TypeWriter** | Effet machine à écrire | Vitesse, couleurs, ombre texte |
| **Star Wars** | Scrolling text (défilement) | Vitesse scroll (30-150), direction (haut→bas ou bas→haut), zone fade (0-50%), espacement lignes (0.3-1.2x) |
| **Simple** | Texte centré statique | Couleurs, ombre texte |

**Multi-Format Simultané** (génération parallèle)
- ☑️ **16:9 YouTube** (1920x1080)
- ☑️ **9:16 TikTok/Shorts** (1080x1920)
- ☑️ **1:1 Instagram** (1080x1080)
- Sélection multiple (minimum 1 format requis)
- Bouton "Télécharger tout" pour batch download

**Templates Vidéo** (6 préréglages)
- The Ermite Pro, Light, Emerald, Dark Modern, Light Elegant, Custom
- Couleurs personnalisables : fond, texte, ombre
- Effets ombre avancés : blur (0-30px), offset X/Y (-10 à +10px)
- Image de fond custom supportée
- **Quick Save** : Sauvegarder template custom sans ouvrir Paramètres
- Prévisualisation temps réel sur canvas

**Export Vidéo**
- Format : **WebM** (MediaRecorder API)
- Nom fichier éditable + suffixe format auto (ex: `ma-video_16x9.webm`)
- Durée génération = durée audio (real-time encoding)
- Barre de progression avec bouton annuler

### 6️⃣ GÉNÉRATION THUMBNAIL (Optionnel)

**Templates Thumbnail** (6 préréglages)
- The Ermite Pro, Light, Emerald, Dark Gold, Minimal White, Custom
- 3 styles design : Modern (encadré), Minimal (simple), Gradient (diagonal)

**4 Formats**

| Format | Dimensions | Usage |
|--------|------------|-------|
| **YouTube** | 1280x720 (16:9) | Miniatures vidéos YouTube |
| **TikTok** | 1080x1920 (9:16) | Cover vidéos verticales |
| **Instagram** | 1080x1080 (1:1) | Posts carrés |
| **Spotify** | 3000x3000 (1:1) | Cover podcasts haute résolution |

**Personnalisation**
- Titre + sous-titre (optionnel)
- Positionnement vertical indépendant (10-90%)
- Couleurs custom : fond, titre, sous-titre
- Image de fond avec filtres :
  - Blur : 0-10px
  - Opacité overlay : 0-100%
- Prévisualisation canvas temps réel avec rendu template exact

**Export Thumbnail**
- Format : **PNG** (haute qualité)
- Nom fichier éditable
- Téléchargement instantané (pas de génération longue)

### 7️⃣ FONCTIONNALITÉS TRANSVERSALES

**Interface Utilisateur**
- **Protection accès** : Code 238897 (sécurité personnelle)
- **Dark Mode** : Toggle avec persistance localStorage
- **Responsive Design** : Mobile-first, breakpoints optimisés
- **WCAG AAA** : Contraste couleurs validé accessibilité
- **PWA** : Installable, support offline, icônes optimisées
- **Export All** : Télécharger Audio WAV + Vidéo WebM + Thumbnail PNG en 1 clic
- **Accordéons** : Sections repliables pour UI organisée
- **Back to Top** : Bouton flottant apparaît après 300px scroll
- **Barres de progression** : Toutes opérations longues avec bouton annuler
- **Panel Paramètres** : Side panel avec onglets templates et configuration

**Stockage & Persistance**
- **localStorage** : Presets, templates, dark mode, état auth, clés API
- **Export/Import JSON** : Backup et partage presets audio
- **Auto-save** : Dernier preset utilisé rechargé au démarrage

---

## 💻 ARCHITECTURE TECHNIQUE

### Stack Technologique

#### Frontend Core
```
React 18.2.0       → UI framework (hooks-based)
Vite 5.0.8         → Build tool ultra-rapide + dev server
Tailwind CSS 3.3.6 → Utility-first CSS framework
JavaScript ES6+    → Pas de TypeScript (vanilla React JSX)
```

#### APIs Navigateur (100% Client-Side)
```
Web Audio API       → Traitement audio local (fréquences, mixage, WAV export)
Canvas API          → Rendering vidéo/thumbnails
MediaRecorder API   → Enregistrement micro + capture canvas stream
MediaDevices API    → getUserMedia (accès microphone)
localStorage API    → Persistance données
Fetch API           → Requêtes HTTP (transcription APIs uniquement)
Service Worker API  → PWA offline support
```

#### APIs Externes (Clés Utilisateur Requises)
```
Whisper OpenAI      → https://api.openai.com/v1/audio/transcriptions (payant ~$0.006/min)
AssemblyAI          → https://api.assemblyai.com/v2/ (5h/mois gratuit puis payant)
```

#### Build & DevOps
```
vite-plugin-pwa 0.17.4  → Service Worker + manifest.json generation
PostCSS + Autoprefixer  → CSS processing
Workbox                 → Caching strategies offline
```

### Structure Fichiers

```
D:\30-Dev-Projects\Ermite-Podcaster/
├── public/
│   ├── music/                      # 8 morceaux MP3 (~80 MB total)
│   ├── logo.png                    # Branding The Ermite (137 KB)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── AudioConfig.jsx         # Étape 2: Config audio (fréquences, ambiance, presets, templates complets)
│   │   ├── AudioExport.jsx         # Étape 3: Panel export (preview, download, waveform, accordéons)
│   │   ├── AudioRecorder.jsx       # Enregistrement micro (pause/resume, test mode)
│   │   ├── AudioWaveform.jsx       # Visualisation waveform (style Audacity)
│   │   ├── PresetManager.jsx       # CRUD presets audio (save/load/delete/export/import JSON)
│   │   ├── TranscriptionPanel.jsx  # UI transcription Whisper/AssemblyAI
│   │   ├── VideoGenerator.jsx      # Génération vidéo multi-format avec templates
│   │   ├── ThumbnailGenerator.jsx  # Génération thumbnails multi-format
│   │   ├── SettingsPanel.jsx       # Side panel (gestion templates, config générale)
│   │   ├── LoginPage.jsx           # Protection accès (code 238897)
│   │   └── Accordion.jsx           # Composant UI sections repliables
│   ├── services/
│   │   ├── audioService.js         # Web Audio API (génération fréquences, mixage, WAV export)
│   │   ├── presetService.js        # localStorage CRUD presets audio
│   │   ├── transcriptionService.js # Intégration APIs Whisper + AssemblyAI
│   │   ├── videoService.js         # Génération vidéo Canvas (3 styles animation)
│   │   ├── thumbnailService.js     # Génération thumbnails Canvas (3 templates design)
│   │   ├── templateService.js      # Gestion templates vidéo/thumbnail (localStorage)
│   │   └── completeTemplateService.js # Templates complets (audio+video+thumbnail)
│   ├── utils/
│   │   └── constants.js            # COLORS, COLORS_DARK, FREQUENCY_OPTIONS, MUSIC_LIBRARY, VIDEO_STYLES
│   ├── App.jsx                     # Composant principal (workflow 3 étapes, dark mode, auth)
│   ├── main.jsx                    # Entry point (React root render)
│   └── index.css                   # Imports Tailwind + CSS custom dark mode
├── dist/                           # Production build output (généré par `npm run build`)
│   ├── assets/                     # Bundles JS/CSS (~275 KB JS gzipped, ~75 KB CSS)
│   ├── music/                      # Copié depuis public/
│   ├── index.html
│   ├── sw.js                       # Service Worker (PWA)
│   ├── manifest.webmanifest
│   └── workbox-*.js                # Workbox runtime
├── vite.config.js                  # Config Vite + plugin PWA
├── tailwind.config.js              # Config Tailwind CSS
├── package.json                    # Dépendances + scripts
├── README.md                       # Installation + déploiement (o2Switch)
├── USER-GUIDE.md                   # Guide utilisateur non-technique
├── COPYRIGHT.md                    # Licence restrictive personnelle
├── CHANGELOG.md                    # Historique versions (v1.0.0 → v1.0.23)
├── AMELIORATIONS-FUTURES.md        # Roadmap 300+ lignes (Phases 4A-4M)
└── PROJECT-OVERVIEW.md             # 👈 CE FICHIER (index projet)
```

### Services Clés

#### audioService.js
```javascript
loadAudioFile(file)                          // Décoder fichier audio → AudioBuffer
generateFrequencyBuffer(freq, duration, sr)  // Génération onde sinusoïdale pure
generateBinauralBuffer(base, offset, dur, sr)// Génération battements binauraux (dual-channel)
bufferToWav(buffer)                          // Conversion AudioBuffer → WAV blob (PCM 16-bit)
playAudioBuffer(buffer)                      // Prévisualisation audio playback
```

#### videoService.js
```javascript
generateStarWarsVideo(audioBuffer, transcript, options)  // Animation scrolling text (vitesse, direction, fade, espacement custom)
generateTypeWriterVideo(audioBuffer, transcript, options)// Animation effet machine à écrire
generateSimpleVideo(audioBuffer, transcript, options)    // Texte centré statique
wrapText(ctx, text, maxWidth)                            // Helper wrapping texte
drawMultilineText(ctx, lines, x, y, lineHeight)          // Rendering multi-lignes
// Utilise canvas.captureStream(30) + MediaRecorder → WebM output
```

#### thumbnailService.js
```javascript
generateThumbnail(options)  // Génération thumbnail Canvas-based
// Support 3 templates design: Modern (encadré), Minimal (simple), Gradient (diagonal)
// Font sizing adaptatif avec word-wrapping
// Filtres image: blur + overlay opacity
// Export PNG data URL
```

#### transcriptionService.js
```javascript
transcribeWithWhisper(audioFile, onProgress)     // Appel API Whisper OpenAI
transcribeWithAssemblyAI(audioFile, onProgress)  // Pattern upload + polling AssemblyAI
parseManualTranscript(text, duration)            // Parse timestamps manuels
generateSRT(transcript)                          // Export format sous-titres SRT
generateVTT(transcript)                          // Export format sous-titres VTT
```

#### templateService.js
```javascript
// CRUD localStorage pour templates vidéo/thumbnail
// Templates par défaut: The Ermite Pro, Light, Emerald, Dark Modern, Light Elegant, Custom
// Protection templates par défaut (non supprimables)
```

#### completeTemplateService.js
```javascript
// Gestion templates complets (config audio + template vidéo + template thumbnail)
// 3 templates par défaut: The Ermite Pro, Light, Emerald
// Chargement 1-clic de toute la config workflow
```

### Data Flow (Workflow 3 Étapes)

```
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 - UPLOAD/ENREGISTREMENT                                 │
│                                                                  │
│ [Upload Fichier] ──────────> audioFile (File/Blob)              │
│        OU                                                        │
│ [Micro Recording] ──────────> audioFile (WebM Blob)             │
│                                                                  │
│                        ↓                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 - CONFIGURATION                                         │
│                                                                  │
│ [Sélection Fréquence] ──> FREQUENCY_OPTIONS (9 choix)           │
│ [Sélection Ambiance]  ──> MUSIC_LIBRARY (8 morceaux) ou upload  │
│ [Volumes]             ──> frequencyVolume (1-20%), ambientVolume (1-30%), masterVolume (10-200%)
│ [Presets] (optionnel) ──> Charger config sauvegardée            │
│ [Templates] (opt.)    ──> Charger audio+video+thumbnail         │
│                                                                  │
│                        ↓                                         │
│                 config object                                    │
│                        ↓                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 - EXPORT                                                │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ AUDIO ENRICHI (audioService.js)                          │    │
│ │                                                           │    │
│ │ 1. loadAudioFile(voiceFile) ──────> voiceBuffer          │    │
│ │ 2. generateFrequencyBuffer(...) ──> freqBuffer (si config)    │
│ │ 3. loadAudioFile(ambientFile) ────> ambientBuffer (looped si court)
│ │ 4. Mixage: voiceBuffer + freqBuffer + ambientBuffer       │    │
│ │    avec volumes respectifs ──────> finalBuffer            │    │
│ │ 5. bufferToWav(finalBuffer) ──────> WAV blob              │    │
│ │ 6. Téléchargement WAV haute qualité                       │    │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ TRANSCRIPTION (optionnel - transcriptionService.js)      │    │
│ │                                                           │    │
│ │ Upload audio ──> Whisper/AssemblyAI API ──> transcript[] │    │
│ │                  [{startTime, endTime, text}]             │    │
│ │ [Édition inline possible]                                 │    │
│ │ Export SRT/VTT                                            │    │
│ └──────────────────────────────────────────────────────────┘    │
│                        ↓                                         │
│                transcript[] (requis pour vidéo)                  │
│                        ↓                                         │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ VIDÉO (optionnel - videoService.js)                      │    │
│ │                                                           │    │
│ │ Sélection style: TypeWriter / Star Wars / Simple         │    │
│ │ Sélection formats: ☑ 16:9  ☑ 9:16  ☑ 1:1                │    │
│ │                                                           │    │
│ │ Pour chaque format:                                       │    │
│ │   Canvas animation loop avec transcript                   │    │
│ │   canvas.captureStream(30 fps)                            │    │
│ │   MediaRecorder (real-time encoding)                      │    │
│ │   ──────> WebM blob                                       │    │
│ │                                                           │    │
│ │ Prévisualisation canvas temps réel                        │    │
│ │ Téléchargement multi-format (batch button)                │    │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ THUMBNAIL (optionnel - thumbnailService.js)              │    │
│ │                                                           │    │
│ │ Saisie titre/sous-titre                                   │    │
│ │ Sélection template + format (YouTube/TikTok/Instagram/Spotify)
│ │ Canvas rendering ──────> PNG data URL ──────> Download   │    │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│ [Export All] → Télécharge Audio WAV + Vidéo(s) WebM + Thumbnail PNG
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Gestion État
- **React useState/useEffect** : État local composants (pas de Redux/Context nécessaire)
- **localStorage** : Persistance presets, templates, dark mode, auth, clés API
- **Props drilling** : Parent (`App.jsx`) → Enfants (`AudioConfig`, `AudioExport`)

### Décisions Architecturales Notables

#### 1. 100% Client-Side Processing
- **Rationale** : Privacy (aucune donnée audio envoyée serveurs), offline capability, zéro coûts infrastructure backend
- **Implémentation** : Web Audio API pour tout traitement audio, Canvas API pour vidéo/thumbnails
- **Trade-off** : Calcul client lourd (génération vidéo prend durée audio en real-time)

#### 2. Export WAV Uniquement (Pas MP3)
- **Rationale** : Qualité haute non compressée, pas de problèmes licensing encodeurs MP3
- **Impact Utilisateur** : Fichiers volumineux, recommandation convertir via CloudConvert (service externe)
- **Futur** : AMELIORATIONS-FUTURES.md mentionne ajout export MP3

#### 3. Encodage Vidéo Real-Time
- **Implémentation** : MediaRecorder capture stream canvas en temps réel
- **Limitation** : Génération vidéo = durée audio (audio 30s = génération 30s)
- **Communication User** : Messages progrès clairs ("Enregistrement real-time, page peut freeze - ne pas fermer")

#### 4. localStorage pour Persistance
- **Utilisé Pour** : Presets, templates, dark mode, état auth, clés API
- **Limitation** : Pas de sync cloud, spécifique navigateur, peut être effacé avec cookies
- **Mitigation** : Export/Import JSON pour backup presets

#### 5. Pas de TypeScript
- **Décision** : React JSX pur (JavaScript ES6+)
- **Trade-off** : Moins de type safety, mais build plus simple, itération rapide pour dev solo

---

## 🔧 MAINTENANCE & DÉVELOPPEMENT

### Setup Local

#### Prérequis
```bash
Node.js 18+ (recommandé LTS)
npm 9+
Navigateur moderne (Chrome/Edge/Firefox/Safari récent)
```

#### Installation
```bash
# Cloner repo (si GitHub privé)
git clone https://github.com/theermite/ermite-podcaster.git
cd ermite-podcaster

# Installer dépendances
npm install

# Lancer dev server
npm run dev
# ➜ http://localhost:5173
```

#### Développement Local
```bash
# Dev server avec HMR (Hot Module Replacement)
npm run dev

# Linting (si configuré - actuellement aucun linter setup)
# Recommandation: Installer ESLint + Prettier pour qualité code

# Tests (actuellement aucun test configuré)
# Recommandation: Jest + React Testing Library (voir standards CLAUDE.md)
```

### Build Production

```bash
# Build optimisé pour production
npm run build

# Output: dist/ folder
# - JavaScript bundle: ~275 KB (~75 KB gzipped)
# - CSS bundle: inclus dans assets/
# - Assets: music/ (8 MP3), logo.png, favicon.ico
# - Service Worker + Workbox runtime (PWA)
# - manifest.webmanifest

# Prévisualiser build local
npm run preview
# ➜ Serveur preview production build
```

### Déploiement o2Switch (Recommandé)

**Pourquoi o2Switch ?**
- Hébergement statique performant
- Hébergeur français (proximité utilisateurs FR)
- ~3.50-5€/mois (shared hosting)
- cPanel + FTP/SFTP facile
- Aucun backend requis (app 100% client-side)

**Étapes Déploiement**

1. **Build Production**
   ```bash
   npm run build
   ```

2. **Upload Fichiers**
   - **Via FileZilla** (SFTP port 22 recommandé) :
     - Hôte : `ftp.votredomaine.com`
     - Upload contenu `dist/` (PAS le dossier lui-même) vers `public_html/`

   - **Via cPanel File Manager** :
     - Compresser `dist/` en ZIP
     - Upload ZIP dans `public_html/`
     - Extraire sur le serveur

3. **Créer `.htaccess`** dans `public_html/`
   ```apache
   # SPA Routing (React Router fallback)
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>

   # Gzip Compression
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
   </IfModule>

   # Cache Headers (Performance)
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType application/javascript "access plus 1 month"
     ExpiresByType audio/mpeg "access plus 1 year"
   </IfModule>
   ```

4. **Vérification**
   - Accéder à `https://votredomaine.com`
   - Tester :
     - Upload audio
     - Génération audio enrichi + preview + téléchargement
     - Dark mode toggle
     - Responsive mobile
     - PWA installable (icône "Installer l'app" dans navigateur)

**Alternative VPS (NON Recommandé pour Ce Projet)**
- VPS OVH serait overkill pour site statique
- Recommandé UNIQUEMENT pour : Python/FastAPI backends, Node.js long-running, Docker multi-apps, PostgreSQL/Redis

### Troubleshooting Commun

#### Erreur "Cannot read properties of undefined" durant génération audio
- **Cause** : Fichier audio corrompu ou format non supporté
- **Fix** : Vérifier format fichier (MP3/WAV/M4A/OGG/WEBM), réessayer avec autre fichier

#### Vidéo génération bloque/freeze navigateur
- **Cause** : Encodage real-time intensif CPU
- **Fix** : Normal pour vidéos longues (>5 min), attendre fin génération, ne pas fermer onglet

#### Dark mode ne se sauvegarde pas
- **Cause** : localStorage bloqué ou navigation privée
- **Fix** : Désactiver mode navigation privée, autoriser cookies/localStorage

#### Transcription échoue avec erreur 401/403
- **Cause** : Clé API invalide ou expirée
- **Fix** : Vérifier clé API Whisper/AssemblyAI dans paramètres, régénérer si nécessaire

#### Téléchargement multi-fichiers bloqué par navigateur
- **Cause** : Navigateur bloque téléchargements multiples simultanés
- **Fix** : Autoriser popups/téléchargements pour le site dans paramètres navigateur

#### Build erreur "Cannot find module '@vitejs/plugin-react'"
- **Cause** : Dépendances non installées
- **Fix** : `npm install` puis `npm run build`

---

## 📅 ROADMAP & ÉTAT ACTUEL

### Historique Versions

| Version | Date | Highlights |
|---------|------|------------|
| **v1.0.0** | 2024-12-12 | 🎉 Initial release - Upload audio, enrichissement fréquences, export WAV |
| **v1.0.2** | 2024-12-14 | 📝 Transcription (Whisper, AssemblyAI), génération vidéo (3 styles), thumbnails |
| **v1.0.3** | 2024-12-15 | ✨ Production-ready - 8 morceaux bibliothèque, branding, dark mode, responsive, PWA, docs complètes |
| **v1.0.9** | 2024-12-15 | 🖼️ Templates thumbnails (6 presets), couleurs custom, filtres image UI |
| **v1.0.14** | 2024-12-15 | 🔒 Protection login, corrections bugs fréquences, gestion dossiers download |
| **v1.0.16** | 2024-12-16 | ✏️ Noms fichiers éditables, previews wrapping texte, images fond par défaut |
| **v1.0.19** | 2024-12-25 | ⚡ Phase 1 Quick Wins - Filtres images opérationnels, auto-save preset, Export All |
| **v1.0.20** | 2024-12-25 | 📦 Phase 2 - Multi-export simultané, templates complets, bouton Spotify |
| **v1.0.21** | 2024-12-25 | 🎵 Phase 3 - Mode test audio, visualisation waveform, ajustements volumes fréquences |
| **v1.0.23** | 2024-12-25 | 🌟 Phase 4A - Effets scroll Star Wars custom (vitesse, direction, fade, espacement), quick save templates, AMELIORATIONS-FUTURES.md roadmap |

**Version Actuelle** : **v1.0.23** (25 décembre 2024)

### Améliorations Futures (AMELIORATIONS-FUTURES.md)

**Document complet** : 300+ lignes roadmap organisé par phases 4A-4M

**Highlights Roadmap** :
- **Export MP3 Direct** : Encodeur MP3 client-side (actuellement WAV uniquement)
- **Upload YouTube API** : Intégration API YouTube pour upload automatique vidéos
- **Analytics Tracking** : Suivi usage (respect privacy, opt-in uniquement)
- **Cloud Sync Presets** : Sync presets entre appareils (backend Firebase ou Supabase)
- **Normalisation Audio Avancée** : Loudness normalization (LUFS), compression dynamique
- **Nouvelles Fréquences** : 174 Hz (soulagement douleur), 285 Hz (régénération tissus), 852 Hz (intuition), 963 Hz (éveil spirituel)
- **Templates Vidéo Additionnels** : Animations Fade In/Out, Kenburn (zoom images), Particle effects
- **Intégration DeepSeek AI** : Suggestions descriptions vidéos, génération hashtags auto
- **Multi-Langue UI** : i18n (français, anglais, espagnol, portugais)
- **Éditeur Audio Inline** : Découpe, trim, fondu enchainé directement dans app
- **Batch Processing** : Upload multiple fichiers, génération en lot

**Voir détails complets** : `AMELIORATIONS-FUTURES.md`

---

## 📚 DOCUMENTATION & RESSOURCES

### Fichiers Documentation

| Fichier | Type | Contenu |
|---------|------|---------|
| **README.md** | Technique | Installation, déploiement o2Switch, features overview, troubleshooting (392 lignes) |
| **USER-GUIDE.md** | End-User | Guide utilisateur non-technique français, FAQ, pas-à-pas (296 lignes) |
| **CHANGELOG.md** | Historique | Versions v1.0.0 → v1.0.23, tous changements détaillés (849 lignes) |
| **COPYRIGHT.md** | Légal | Licence restrictive personnelle, copyright Jay The Ermite (112 lignes) |
| **AMELIORATIONS-FUTURES.md** | Roadmap | Phases 4A-4M améliorations futures (300+ lignes) |
| **PROJECT-OVERVIEW.md** | Index | 👈 Ce fichier - Vue d'ensemble projet complet |

### Fichiers Techniques Clés

| Fichier | Rôle |
|---------|------|
| `package.json` | Dépendances, scripts, métadonnées projet |
| `vite.config.js` | Configuration Vite + plugin PWA |
| `tailwind.config.js` | Configuration Tailwind CSS |
| `index.html` | Entry point HTML, Google Fonts, meta SEO |
| `src/App.jsx` | Composant principal, workflow 3 étapes |
| `src/utils/constants.js` | Constantes globales (couleurs, fréquences, bibliothèque musique) |
| `src/services/audioService.js` | Cœur traitement audio Web Audio API |
| `src/services/videoService.js` | Génération vidéo Canvas + MediaRecorder |
| `src/services/transcriptionService.js` | Intégration APIs transcription |

### Ressources Externes

**APIs Utilisées**
- [Whisper OpenAI API](https://platform.openai.com/docs/api-reference/audio/createTranscription) - Transcription audio multilingue
- [AssemblyAI API](https://www.assemblyai.com/docs) - Transcription audio française

**Documentation Référence**
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - API traitement audio
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - API rendering vidéo/images
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) - Enregistrement audio/vidéo
- [React 18 Docs](https://react.dev) - Framework frontend
- [Vite Docs](https://vitejs.dev) - Build tool
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - CSS framework

**Hébergement**
- [o2Switch Documentation](https://faq.o2switch.fr) - Guides hébergement

**Outils Conversion** (Recommandés Utilisateurs)
- [CloudConvert](https://cloudconvert.com) - Conversion WAV → MP3 (gratuit limité)
- [Online Audio Converter](https://online-audio-converter.com) - Alternative conversion audio

### Support & Contact

**Développeur**
- **Jay "The Ermite" Goncalves**
- GitHub : [@theermite](https://github.com/theermite)
- Site Web : [shinkofa.com](https://shinkofa.com) (en construction)

**Licence**
- Personal Restrictive License (voir `COPYRIGHT.md`)
- Usage personnel autorisé
- Commercial interdit sans autorisation

**Rapporter Bug/Demande Feature**
- GitHub Issues (si repo public configuré)
- Email contact via shinkofa.com (quand opérationnel)

---

## 🎯 CHECKLIST MAINTENANCE

### Avant Chaque Release

- [ ] Tests manuels UI (upload, enregistrement, génération audio, vidéo, thumbnail)
- [ ] Tests dark mode + responsive mobile
- [ ] Tests PWA (offline mode, installation)
- [ ] Vérifier aucune console.error en production
- [ ] Build production (`npm run build`) sans erreurs
- [ ] Tester build preview (`npm run preview`)
- [ ] Mettre à jour `CHANGELOG.md` avec nouveautés
- [ ] Bump version dans `package.json`
- [ ] Commit + Push vers GitHub
- [ ] Déployer sur o2Switch (upload `dist/` + vérifier `.htaccess`)
- [ ] Vérifier site production (fonctionnalités critiques)

### Maintenance Régulière

**Mensuel**
- Vérifier sécurité dépendances : `npm audit`
- Mettre à jour dépendances mineures : `npm update`
- Tester compatibilité nouveaux navigateurs (Chrome, Firefox, Safari, Edge)

**Trimestriel**
- Audit performance (Lighthouse Chrome DevTools)
- Mettre à jour dépendances majeures (si breaking changes acceptables)
- Réviser roadmap `AMELIORATIONS-FUTURES.md`
- Backup code GitHub (déjà versionné, vérifier intégrité)

**Annuel**
- Révision complète architecture (refactoring si nécessaire)
- Audit accessibilité WCAG AAA (vérifier nouvelles guidelines)
- Mettre à jour documentation (README, USER-GUIDE si changements majeurs)

### Monitoring Production (Recommandé Futur)

**Actuellement** : Aucun analytics configuré (privacy-first)

**Recommandations Futures** (opt-in utilisateur) :
- Google Analytics 4 ou Plausible (privacy-friendly)
- Sentry (error tracking frontend)
- Uptime monitoring (UptimeRobot, Pingdom)

---

## 📊 MÉTRIQUES PROJET

### Taille Code
```
JavaScript/JSX : ~4000 lignes (src/)
CSS : ~200 lignes (Tailwind utility classes majoritaires)
Config : ~100 lignes (vite.config.js, tailwind.config.js)
Documentation : ~2000 lignes (README, USER-GUIDE, CHANGELOG, COPYRIGHT, PROJECT-OVERVIEW)
```

### Build Size
```
JavaScript Bundle : ~275 KB (~75 KB gzipped)
CSS Bundle : ~75 KB (~15 KB gzipped)
Assets (logo + music) : ~80 MB (non compressé - fichiers MP3)
Total dist/ : ~80.5 MB
```

### Performance (Lighthouse - Desktop)
```
Performance : ~90-95 (bon, limité par taille music/ assets)
Accessibility : 100 (WCAG AAA)
Best Practices : 100
SEO : 95 (PWA optimisé)
```

### Compatibilité Navigateurs
```
✅ Chrome/Edge 90+ (recommandé)
✅ Firefox 88+
✅ Safari 14+
⚠️ Internet Explorer : NON SUPPORTÉ (ES6+ modules)
✅ Mobile : iOS Safari 14+, Chrome Android 90+
```

---

**Document créé** : 2025-01-03
**Auteur** : TAKUMI Agent (Claude Code)
**Version** : 1.0
**Dernière mise à jour** : Basée sur Ermite-Podcaster v1.0.23

---

## 🔄 NOTES POUR FUTURES MISES À JOUR DE CE DOCUMENT

Ce document doit être mis à jour lors de :
- **Nouvelles versions majeures** : Ajouter dans ROADMAP & ÉTAT ACTUEL
- **Changements architecture** : Modifier section ARCHITECTURE TECHNIQUE
- **Nouvelles fonctionnalités** : Ajouter dans FONCTIONNALITÉS UTILISATEUR
- **Changements déploiement** : Mettre à jour MAINTENANCE & DÉVELOPPEMENT
- **Nouvelles docs** : Ajouter dans DOCUMENTATION & RESSOURCES

**Maintenir synchronisé avec** : CHANGELOG.md, README.md, package.json (version)
