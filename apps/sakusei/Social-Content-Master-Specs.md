# Social Content Master - Spécifications Techniques

> Hub centralisé de gestion globale pour réseaux sociaux et création de contenu

---

## 🎯 Vision du Produit

**Social Content Master** est LE centre de contrôle unique pour toute la stratégie content de Shinkofa.

**Promesse** : De l'upload du contenu brut (Jay) à la publication multi-plateformes (Ange), tout passe par Social Content Master.

**Utilisateurs** :
- **Jay** : Upload contenu brut (vidéos streams, micro-vidéos, audio)
- **Ange** : Transformation, édition, planification, publication
- **Future équipe** : Scalabilité pour plusieurs créateurs

---

## 📋 Features Core (MVP v1.0)

### Module 1 : Gestion de Fichiers (Media Library)

**Objectif** : Centraliser tout le contenu brut et édité

**Fonctionnalités** :
- ✅ **Upload multi-fichiers** (drag & drop)
  - Vidéos (MP4, MOV, AVI) jusqu'à 10 GB
  - Audio (MP3, WAV, M4A)
  - Images (PNG, JPG, GIF)
  - Batch upload (sélectionner plusieurs fichiers)

- ✅ **Organisation hiérarchique**
  - Dossiers : `Raw-Jay/`, `Edited-Ange/`, `Published/`, `Templates/`
  - Tags personnalisés : #stream, #micro-video, #bts, #linkedin, etc.
  - Filtres : Type, Date, Plateforme cible, Statut (brut/édité/publié)

- ✅ **Métadonnées automatiques**
  - Durée vidéo/audio
  - Résolution (1080p, 720p, etc.)
  - Taille fichier
  - Date d'upload
  - Uploader (Jay/Ange)

- ✅ **Preview intégré**
  - Lecteur vidéo in-app
  - Waveform pour audio
  - Miniature pour images

- ✅ **Recherche & Filtres**
  - Recherche par nom, tag, date
  - Tri : Plus récent, Plus ancien, Taille, Durée

- ✅ **Transfert vers O2Switch CDN**
  - Bouton "Transférer vers O2Switch" par fichier
  - Batch transfer (sélection multiple)
  - Progress bar upload FTP
  - DB update avec cdn_url
  - Nettoyage auto VPS après transfert réussi
  - Statuts : pending, transferring, completed, failed

**UI/UX** :
```
┌─────────────────────────────────────────────┐
│ Media Library                    [+ Upload] │
├─────────────────────────────────────────────┤
│ 📁 Raw-Jay  📁 Edited-Ange  📁 Published    │
├─────────────────────────────────────────────┤
│ 🔍 Search: ___________  [Filters ▼]         │
├─────────────────────────────────────────────┤
│ ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐          │
│ │ 🎥  │  │ 🎥  │  │ 🎥  │  │ 🎥  │          │
│ │ 2:14│  │ 1:03│  │ 0:45│  │ 5:23│          │
│ │Stream│  │Micro│  │Clip │  │Stream│          │
│ └─────┘  └─────┘  └─────┘  └─────┘          │
└─────────────────────────────────────────────┘
```

---

### Module 2 : Éditeur Vidéo Intégré

**Objectif** : Découpe, sous-titrage, édition basique sans quitter l'app

**Fonctionnalités** :

#### A. Timeline de Montage
- ✅ **Découpe précise**
  - Timeline avec curseur (scrub)
  - Markers pour début/fin clip
  - Raccourcis clavier : `I` (in), `O` (out), `Espace` (play/pause)
  - Frame-by-frame (←/→)

- ✅ **Multi-clips**
  - Découper 1 vidéo longue → plusieurs clips courts
  - Sauvegarder chaque clip individuellement
  - Nommer clips : `clip-1-projecteur-hustle.mp4`

#### B. Sous-titres Automatiques
- ✅ **Génération auto** (via API : Whisper, AssemblyAI, ou open-source Vosk)
  - Transcription audio → texte
  - Timing automatique (sync avec audio)
  - Langue : FR, EN (détection auto ou manuelle)

- ✅ **Édition sous-titres**
  - Correction erreurs transcription
  - Ajustement timing (début/fin de chaque ligne)
  - Styles : Taille, police, couleur, position
  - Templates : Style TikTok (gros, jaune), Style YouTube (bas, blanc), etc.

- ✅ **Burn-in ou SRT export**
  - Burn-in : sous-titres dans vidéo (non modifiables après)
  - SRT export : fichier séparé (pour YouTube, LinkedIn)

#### C. Ajouts Basiques
- ✅ **Texte overlay**
  - Titre, CTA, annotations
  - Animations : Fade in/out, slide

- ✅ **Musique de fond** (optionnel)
  - Bibliothèque musiques libres de droits intégrée
  - Ajustement volume (musique vs voix)
  - Fade in/out automatique

- ✅ **Transitions** (optionnel, simple)
  - Cut (défaut), Fade, Slide

#### D. Export Multi-Formats
- ✅ **Presets par plateforme**
  - TikTok : 1080x1920 (9:16), 60 sec max, H.264, bitrate optimal
  - YouTube Shorts : 1080x1920 (9:16), 60 sec max
  - LinkedIn : 1920x1080 (16:9) ou 1080x1080 (1:1), 3 min max
  - Instagram : 1080x1080 (1:1) ou 1080x1920 (9:16), 90 sec max

- ✅ **Export rapide**
  - 1 clic → exporter pour toutes plateformes (génère 4 versions)
  - Queue d'export (traiter plusieurs vidéos en batch)

**UI/UX Éditeur** :
```
┌─────────────────────────────────────────────────────────┐
│ Éditeur Vidéo                          [Save] [Export ▼]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│           ┌─────────────────────────┐                   │
│           │  VIDEO PREVIEW          │                   │
│           │  [ 0:42 / 2:14 ]        │                   │
│           └─────────────────────────┘                   │
│                                                          │
│  Timeline:                                               │
│  ├─────────────────────────────────────────────┤        │
│  │         [IN]        [CURSOR]        [OUT]    │        │
│  0:00                1:24                   2:14│        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  Sous-titres : [✓] Auto-générer  [Edit]                │
│  Musique     : [ ] Ajouter fond sonore                  │
│  Texte       : [ ] Overlay CTA                          │
│                                                          │
│  Export : [TikTok] [YouTube] [LinkedIn] [Instagram]     │
└─────────────────────────────────────────────────────────┘
```

---

### Module 3 : Création de Posts (Composer)

**Objectif** : Rédiger posts avec templates, adapté par plateforme

**Fonctionnalités** :

#### A. Templates de Posts
- ✅ **Bibliothèque templates**
  - Template "Journaliste de Progression"
  - Template "Behind-the-Scenes"
  - Template "Micro-Enseignement"
  - Template "Storytelling Personnel"
  - Custom (créer/sauvegarder ses propres templates)

- ✅ **Variables dynamiques**
  - `{{Jay}}`, `{{Ange}}`, `{{Titre_Vidéo}}`, `{{Date}}`, etc.
  - Remplissage auto ou manuel

#### B. Composer Multi-Plateformes
- ✅ **Écriture unique, adaptation auto**
  - Écrire 1 post "maître"
  - Adapter automatiquement par plateforme :
    - TikTok : 2200 caractères max, hashtags importants
    - LinkedIn : 3000 caractères max, ton professionnel
    - Instagram : 2200 caractères max, emojis OK
    - YouTube : Description courte + tags

- ✅ **Édition par plateforme**
  - Override si besoin d'ajustements spécifiques
  - Prévisualisation side-by-side

- ✅ **Hashtags intelligents**
  - Suggestions basées sur contenu
  - Bibliothèque hashtags sauvegardés
  - Performance tracking (quels hashtags convertissent)

- ✅ **CTA configurables**
  - Lien en bio → app.shinkofa.com/questionnaire
  - Autres CTAs custom

#### C. Médias Attachés
- ✅ **Attacher vidéo/image**
  - Depuis Media Library
  - Preview du rendu final

- ✅ **Miniatures custom**
  - Choisir frame de vidéo
  - Uploader image custom
  - Générer via Canva (intégration future)

**UI/UX Composer** :
```
┌─────────────────────────────────────────────────────────┐
│ Composer Post                   [Template ▼] [Save Draft]│
├─────────────────────────────────────────────────────────┤
│ Plateforme : [TikTok] [LinkedIn] [YouTube] [Instagram]  │
├─────────────────────────────────────────────────────────┤
│ Post Master :                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎥 Jay explique pourquoi les Projecteurs ne...     │ │
│ │                                                     │ │
│ │ Cette vidéo, c'est un extrait de...                │ │
│ │ _______________________________________________     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Hashtags : #LaVoieShinkofa #DesignHumain #Projecteur    │
│ CTA      : Découvre ton type → app.shinkofa.com/...     │
│                                                          │
│ Média : [📹 clip-projecteur-hustle.mp4]                 │
│         [Change Thumbnail]                               │
│                                                          │
│ Adaptations :                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ TikTok   │ │ LinkedIn │ │ YouTube  │ │Instagram │    │
│ │ ✓        │ │ ✓        │ │ ✓        │ │ -        │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

### Module 4 : Calendrier Éditorial & Planification

**Objectif** : Vue d'ensemble, planification, automatisation publications

**Fonctionnalités** :

#### A. Calendrier Visuel
- ✅ **Vue mois/semaine/jour**
  - Vue mois : Overview global
  - Vue semaine : Planning détaillé
  - Vue jour : Timeline heure par heure

- ✅ **Drag & Drop**
  - Déplacer posts entre dates
  - Réorganiser facilement

- ✅ **Color-coding**
  - TikTok : Rose
  - YouTube : Rouge
  - LinkedIn : Bleu
  - Instagram : Violet/Orange dégradé
  - Behind-the-Scenes : Vert

- ✅ **Statuts visuels**
  - 📝 Draft
  - ⏰ Scheduled
  - ✅ Published
  - ❌ Failed (erreur publication)

#### B. Planification Intelligente
- ✅ **Meilleurs horaires**
  - Analyse historique (quand l'audience est active)
  - Suggestions auto : "Publier à 18h30 pour max engagement"
  - Override manuel possible

- ✅ **Récurrence**
  - Ex: "Tous les lundis à 18h, post LinkedIn"
  - Templates récurrents

- ✅ **Queue de publication**
  - File d'attente : X posts prêts
  - Auto-fill slots vides avec contenu evergreen

#### C. Gestion Brouillons
- ✅ **Sauvegarder brouillons**
  - Revenir plus tard
  - Versionning (historique modifications)

- ✅ **Statuts workflow**
  - Brouillon → À valider → Planifié → Publié

**UI/UX Calendrier** :
```
┌─────────────────────────────────────────────────────────┐
│ Calendrier Éditorial        [Mois] [Semaine] [Jour]     │
├─────────────────────────────────────────────────────────┤
│                        Janvier 2026                      │
│  Lun    Mar    Mer    Jeu    Ven    Sam    Dim          │
│   20     21     22     23     24     25     26          │
│                                                          │
│         [🔵]   [🔵]          [🔵]                        │
│         [🟣]   [🎥]          [🟢]                        │
│                [🔵]                                      │
│                                                          │
│   27     28     29     30     31                         │
│  [🔵]   [🔵]   [🎥]   [🔵]   [🎥]                        │
│  [🎥]   [🟢]   [🔵]   [🟢]   [🔵]                        │
│                                                          │
│ 🎥 TikTok  🔵 LinkedIn  🟢 BTS  🟣 Instagram             │
└─────────────────────────────────────────────────────────┘
```

---

### Module 5 : Publication Multi-Plateformes

**Objectif** : Publier simultanément ou individuellement sur toutes plateformes

**Fonctionnalités** :

#### A. Connexions API
- ✅ **Authentification OAuth**
  - TikTok : TikTok for Developers API
  - YouTube : YouTube Data API v3
  - LinkedIn : LinkedIn API
  - Instagram : Instagram Graph API (via Meta)
  - Twitter/X : X API v2 (optionnel)

- ✅ **Multi-comptes**
  - Jay : TikTok, LinkedIn, YouTube
  - Ange : Instagram, LinkedIn
  - Shinkofa : Comptes marque

- ✅ **Sécurité**
  - Tokens chiffrés
  - Refresh automatique
  - Déconnexion facile

#### B. Publication Automatique
- ✅ **Publication immédiate**
  - Clic "Publier maintenant" → live sur toutes plateformes

- ✅ **Publication programmée**
  - Définir date/heure
  - Queue de traitement
  - Retry auto si échec (network issue)

- ✅ **Logs & Statuts**
  - Historique publications
  - Erreurs détaillées si échec
  - Liens directs vers posts publiés

#### C. Cross-Posting Intelligent
- ✅ **Adaptation auto par plateforme**
  - Format vidéo ajusté
  - Texte adapté (longueur, ton)
  - Hashtags optimisés

- ✅ **Preview avant publication**
  - Voir exactement ce qui sera publié
  - Side-by-side multi-plateformes

**UI/UX Publication** :
```
┌─────────────────────────────────────────────────────────┐
│ Publier Post                               [Publish Now]│
├─────────────────────────────────────────────────────────┤
│ Comptes connectés :                                      │
│  ✓ TikTok @jayproject                                   │
│  ✓ LinkedIn Jay Ermite                                  │
│  ✓ YouTube Shinkofa                                     │
│  - Instagram (non connecté) [Connect]                   │
│                                                          │
│ Planification :                                          │
│  ○ Maintenant                                           │
│  ● Programmer : [27/01/2026] à [18:30]                  │
│                                                          │
│ Preview :                                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│ │ TikTok   │ │ LinkedIn │ │ YouTube  │                 │
│ │ [Preview]│ │ [Preview]│ │ [Preview]│                 │
│ └──────────┘ └──────────┘ └──────────┘                 │
│                                                          │
│ [Cancel]                      [Schedule Publication]     │
└─────────────────────────────────────────────────────────┘
```

---

### Module 6 : Analytics & Performance

**Objectif** : Mesurer, analyser, optimiser

**Fonctionnalités** :

#### A. Métriques Par Post
- ✅ **Engagement**
  - Vues, Likes, Commentaires, Partages
  - Taux d'engagement (engagement/vues)
  - Saves (TikTok, Instagram)

- ✅ **Conversion**
  - Clics lien bio
  - Questionnaires démarrés (si tracking UTM)
  - Revenus attribués (si intégration analytics)

- ✅ **Performance relative**
  - Ce post vs moyenne
  - Top 10% / Bottom 10%

#### B. Dashboard Global
- ✅ **Vue d'ensemble**
  - Total vues/semaine, mois
  - Croissance followers
  - Engagement moyen

- ✅ **Comparaison plateformes**
  - Quelle plateforme performe le mieux ?
  - ROI temps investi par plateforme

- ✅ **Tendances**
  - Graphes évolution dans le temps
  - Pics de performance (identifier patterns)

#### C. Insights Actionnables
- ✅ **Recommandations**
  - "Vos posts LinkedIn du mercredi performent 2x mieux"
  - "Les vidéos < 45 sec ont +30% engagement"
  - "Hashtag #DesignHumain génère le plus de conversions"

- ✅ **Rapports hebdomadaires**
  - Email auto avec résumé perf
  - Célébration des wins
  - Identification points d'amélioration

**UI/UX Analytics** :
```
┌─────────────────────────────────────────────────────────┐
│ Analytics                    [Cette semaine ▼]           │
├─────────────────────────────────────────────────────────┤
│ Vue d'ensemble :                                         │
│                                                          │
│  📊 Total Vues        : 12,453  (+23% vs semaine dernière│
│  ❤️  Total Engagement : 1,842   (+15%)                   │
│  👥 Nouveaux Followers: 47      (+8%)                    │
│  🔗 Clics Lien Bio   : 23       (+12%)                   │
│                                                          │
│ Performance par plateforme :                             │
│  🎥 TikTok   : 8,234 vues  | Engagement 18%             │
│  🔵 LinkedIn : 3,102 vues  | Engagement 12%             │
│  🎬 YouTube  : 1,117 vues  | Engagement 9%              │
│                                                          │
│ Top Posts cette semaine :                                │
│  1. "Pourquoi Projecteurs..." - 2,341 vues - TikTok     │
│  2. "3 signes multipotentiel" - 1,892 vues - TikTok     │
│  3. "Behind-the-scenes dev" - 1,204 vues - LinkedIn     │
│                                                          │
│ 💡 Insight : Vos posts TikTok < 45 sec performent       │
│    +35% mieux. Privilégiez format court.                │
└─────────────────────────────────────────────────────────┘
```

---

### Module 7 : Gestion Podcast (Basé sur Ermite Podcaster)

**Objectif** : Créer, éditer, publier podcasts et extraits audio multi-plateformes

**Note** : Ce module s'inspire d'Ermite Podcaster (projet existant Jay) et l'intègre dans Social Content Master pour un hub global.

**Fonctionnalités** :

#### A. Enregistrement & Import Audio

- ✅ **Import fichiers audio**
  - MP3, WAV, M4A, FLAC
  - Depuis Media Library
  - Depuis Hibiki-Dictate (voiceovers Jay)
  - Depuis streams (extraction audio)

- ✅ **Enregistrement direct** (optionnel MVP, v1.5+)
  - Record in-app (microphone)
  - Multi-pistes (intro + contenu + outro)
  - Monitoring audio temps réel

#### B. Édition Audio

- ✅ **Timeline audio** (waveform)
  - Découpe précise (in/out points)
  - Fade in/out automatique
  - Normalisation volume (loudness LUFS)
  - Suppression silences

- ✅ **Multi-segments**
  - Assembler plusieurs fichiers
  - Ajouter intro/outro musicale (jingles)
  - Inserts publicitaires (future)

- ✅ **Effets basiques**
  - Compression (voix plus claire)
  - EQ (égalisation fréquences)
  - Noise reduction (réduction bruit de fond)

#### C. Métadonnées Podcast

- ✅ **Informations épisode**
  - Titre épisode
  - Description (rich text)
  - Numéro épisode / saison
  - Date publication
  - Durée
  - Tags/catégories

- ✅ **Artwork (miniature)**
  - Upload image épisode
  - Générer depuis template (Canva intégration future)
  - Format : 3000x3000px (standard Apple Podcasts)

- ✅ **Show notes**
  - Timestamps chapitres
  - Liens mentionnés dans l'épisode
  - Transcription automatique (via Whisper API)
  - CTA (call-to-action)

#### D. Publication Multi-Plateformes

- ✅ **Plateformes podcast**
  - RSS feed (auto-généré)
  - Apple Podcasts
  - Spotify for Podcasters
  - Google Podcasts
  - YouTube Podcasts (vidéo = waveform + artwork)
  - Deezer, Amazon Music (via RSS)

- ✅ **Hébergement audio**
  - Stockage fichiers MP3 (VPS ou O2Switch)
  - CDN pour diffusion rapide (optionnel)
  - Bandwidth monitoring

- ✅ **Extraits courts (Clips Audio)**
  - Découper épisode → clips 30-60 sec
  - Exporter pour TikTok/Instagram Reels (vidéo waveform animée)
  - Audiogrammes automatiques (waveform + texte)

#### E. Analytics Podcast

- ✅ **Statistiques écoute**
  - Total téléchargements
  - Écoutes par plateforme (Apple, Spotify, etc.)
  - Rétention (% épisode écouté)
  - Localisation auditeurs (pays)

- ✅ **Performance épisodes**
  - Top épisodes
  - Taux de complétion
  - Nouveaux vs anciens auditeurs

- ✅ **Croissance**
  - Évolution abonnés
  - Taux conversion (écoute → abonnement)

#### F. Distribution Cross-Content

- ✅ **Réutilisation contenu podcast**
  - Transcription → articles blog
  - Clips audio → posts LinkedIn (carrousels avec citations)
  - Audiogrammes → TikTok/Instagram
  - Épisode complet → YouTube (format long)

- ✅ **Intégration workflow Jay → Ange**
  - Jay enregistre audio (analyse film, voiceover, réflexion)
  - Ange édite, découpe, publie podcast + clips sociaux
  - Social Content Master = hub unique

**UI/UX Podcast Module** :
```
┌─────────────────────────────────────────────────────────┐
│ Module Podcast                      [+ Nouvel Épisode]  │
├─────────────────────────────────────────────────────────┤
│ Épisodes :                                               │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🎙️ Épisode #12 : "Analyse film Akira"        │       │
│ │ 📊 234 écoutes | 45 min | Publié 22/01/2026  │       │
│ │ [Éditer] [Analytics] [Clips]                  │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🎙️ Épisode #11 : "Gaming & mindset"          │       │
│ │ 📊 187 écoutes | 52 min | Publié 15/01/2026  │       │
│ │ [Éditer] [Analytics] [Clips]                  │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ RSS Feed : https://podcast.shinkofa.com/feed.xml       │
│ [Copier lien] [Soumettre Apple Podcasts] [Soumettre    │
│  Spotify]                                                │
└─────────────────────────────────────────────────────────┘

Éditeur Audio :
┌─────────────────────────────────────────────────────────┐
│ Édition Épisode #12                          [Export]   │
├─────────────────────────────────────────────────────────┤
│ Waveform :                                               │
│ ░░░▓▓▓██████▓▓▓░░░░░░▓▓██▓▓░░░░░░░░▓▓▓▓▓▓░░░          │
│ |───I──────────────────O──────────────────────|          │
│ 0:00              22:34              45:12               │
│                                                          │
│ [▶ Play] [✂ Cut] [🔊 Normalize] [🎚 EQ] [🔇 Noise Reduce]│
│                                                          │
│ Métadonnées :                                            │
│ Titre : Analyse film Akira__________________________    │
│ Description : Dans cet épisode, je partage...           │
│ Artwork : [📷 akira-episode.jpg]                        │
│ Show notes : [Éditer chapitres & liens]                │
│                                                          │
│ Publication :                                            │
│ ☑ Apple Podcasts  ☑ Spotify  ☑ YouTube  ☑ RSS         │
└─────────────────────────────────────────────────────────┘
```

**Exemples Use Cases Podcast** :

1. **Podcast "Réflexions Shinkofa"** :
   - Épisodes hebdomadaires 30-60 min
   - Jay partage réflexions, leçons, analyses
   - Ange édite, publie, crée clips pour TikTok/LinkedIn

2. **Séries thématiques** :
   - "Analyses Films/Mangas" (1-2x/mois)
   - "Gaming & Mindset" (extraits coaching La Salade de Fruits)
   - "Dev & Code" (discussions techniques)

3. **Voiceovers courts** :
   - Import depuis Hibiki-Dictate
   - Publier comme mini-épisodes (5-10 min)
   - Clips 30 sec pour TikTok

**Évolution Ermite Podcaster → Social Content Master** :

Si Ermite Podcaster existe déjà, deux options :

**Option A : Migration complète**
- Intégrer toutes les fonctionnalités Ermite dans Social Content Master
- Social Content Master devient l'outil unique (vidéo + audio)
- Avantage : Hub global, workflow simplifié

**Option B : Intégration API**
- Ermite Podcaster reste outil standalone
- Social Content Master communique avec Ermite via API
- Import/export épisodes entre les deux
- Avantage : Outils séparés, spécialisés

**Recommandation** : Option A (migration) pour simplifier workflow Jay/Ange et centraliser tout dans Social Content Master.

---

## 🏗️ Architecture Technique

### Stack Technologique Recommandé

**Frontend** :
- **Framework** : Next.js 15 (React)
- **UI Library** : Shadcn/ui + Tailwind CSS
- **State Management** : Zustand ou React Context
- **Video Player** : Video.js ou Plyr
- **Timeline Editor** : Custom (Canvas API) ou react-timeline-editor

**Backend** :
- **Framework** : Next.js API Routes (TypeScript)
- **Database** : PostgreSQL (métadonnées, posts, analytics, podcasts)
- **File Storage** :
  - **VPS** : `/tmp/social-content-master/` (processing temporaire, 5-10 GB max)
  - **O2Switch** : `media.shinkofa.com/` (stockage permanent + CDN, illimité)
  - **Transfer** : FTP/FTPS via `basic-ftp` package
- **Queue** : Redis (pour export vidéos, publications différées, batch processing)

**APIs Tierces** :
- **Transcription** : OpenAI Whisper API, AssemblyAI, ou Vosk (open-source)
- **Video Processing** : FFmpeg (backend)
- **Social Media APIs** :
  - TikTok : TikTok for Developers
  - YouTube : YouTube Data API v3
  - LinkedIn : LinkedIn API
  - Instagram : Instagram Graph API

**Déploiement** :
- **Frontend** : Vercel, Netlify, ou VPS (Next.js standalone)
- **Backend** : VPS OVH (Docker), Fly.io, ou Railway
- **Storage** : Voir section "Hébergement & Stockage" ci-dessous

---

### Hébergement & Stockage : Architecture Hybride VPS + O2Switch ✅

**Contexte Jay (Confirmé)** :
- **VPS OVH** : vps.theermite.dev (217.182.206.127)
  - Capacité totale : 193 GB
  - Utilisé (autres projets) : 139 GB
  - **Libre : 55 GB** ⚠️
  - Héberge : apps/api-auth, apps/web, autres projets
- **O2Switch** : Héberge site-vitrine-2026 (shinkofa.com)
  - **Stockage : Illimité** ✅
  - **Bande passante : Illimitée** ✅
  - Idéal pour CDN média

**Décision** : Architecture hybride VPS (compute) + O2Switch (storage/CDN)

---

#### Architecture Retenue : VPS (App + Processing Temporaire) + O2Switch (Stockage Permanent + CDN)

**Workflow Complet** :

```
┌─────────────────────────────────────────────────────┐
│ 1. UPLOAD (Jay/Ange → VPS)                          │
│    ↓                                                 │
│    Browser upload multi-part → VPS /tmp/uploads/    │
│    Fichiers bruts temporaires (5-10 GB max)         │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 2. PROCESSING (VPS - FFmpeg, Whisper API)           │
│    ↓                                                 │
│    - Découpe vidéo (in/out points)                  │
│    - Génération sous-titres automatiques            │
│    - Compression optimisée (TikTok 720p, YT 1080p)  │
│    - Édition audio (normalisation, fade)            │
│    - Génération miniatures                          │
│    ↓                                                 │
│    Fichiers traités → VPS /tmp/processed/           │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 3. TRANSFERT O2SWITCH (Bouton manuel Ange)          │
│    ↓                                                 │
│    [↑ Transférer vers O2Switch] ← Bouton UI         │
│    ↓                                                 │
│    VPS → FTP/SFTP → O2Switch                        │
│    Destination : media.shinkofa.com/                │
│    ↓                                                 │
│    Progress bar + DB update (cdn_url)               │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 4. NETTOYAGE VPS (Automatique après transfert)      │
│    ↓                                                 │
│    Suppression /tmp/uploads/ et /tmp/processed/     │
│    VPS garde uniquement :                           │
│      - App Social Content Master (~500 MB)          │
│      - PostgreSQL métadonnées (~100 MB)             │
│      - Redis queue (~50 MB)                         │
│    Total permanent VPS : ~1 GB                      │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 5. DIFFUSION (O2Switch = CDN)                       │
│    ↓                                                 │
│    Fichiers servis depuis :                         │
│    https://media.shinkofa.com/edited-ange/...       │
│    ↓                                                 │
│    - Preview in-app Social Content Master           │
│    - Composer posts (sélection clips)               │
│    - Publication TikTok/YouTube/LinkedIn            │
│    - Streaming podcast                              │
│    ↓                                                 │
│    Bande passante illimitée O2Switch ✅             │
└─────────────────────────────────────────────────────┘
```

**Architecture Technique** :

```
VPS OVH (217.182.206.127)
│
├─ Docker Containers
│  ├─ shinkofa_api_auth_prod (FastAPI)
│  ├─ shinkofa_web_prod (Next.js apps/web)
│  ├─ social_content_master (Next.js nouvelle app) ← NOUVEAU
│  ├─ postgres (DB métadonnées)
│  └─ redis (Queue processing)
│
└─ Filesystem (Temporaire uniquement)
   └─ /tmp/social-content-master/
      ├─ uploads/ (fichiers bruts en cours upload)
      ├─ processing/ (FFmpeg, Whisper en cours)
      └─ processed/ (prêts à transfert O2Switch)

      ⚠️ Max 5-10 GB simultanés
      ✅ Nettoyage auto après transfert O2Switch

O2Switch (media.shinkofa.com)
│
└─ public_html/media.shinkofa.com/
   ├─ raw-jay/
   │  └─ 2026/
   │      └─ 01/
   │          ├─ stream-dev-20260122-1830.mp4
   │          ├─ stream-gaming-20260124-2000.mp4
   │          └─ micro-videos-batch-20260120.mp4
   │
   ├─ edited-ange/
   │  ├─ tiktok/
   │  │  ├─ 2026-01-22-clip-projecteur-hustle.mp4
   │  │  └─ 2026-01-23-clip-gaming-mindset.mp4
   │  ├─ youtube/
   │  │  └─ 2026-01-22-analyse-akira-part1.mp4
   │  ├─ linkedin/
   │  │  └─ 2026-01-23-bts-dev-feature.mp4
   │  └─ podcast/
   │     ├─ episodes/
   │     │  └─ episode-12-analyse-akira.mp3
   │     └─ clips/
   │        └─ clip-audio-001.mp3
   │
   └─ published/ (archives posts publiés)
      ├─ tiktok/
      ├─ youtube/
      └─ linkedin/

   ✅ Stockage illimité
   ✅ Bande passante illimitée
   ✅ CDN naturel (diffusion publique)
```

**Avantages Architecture Hybride** :
- ✅ **VPS léger** : Seulement 5-10 GB temporaires (processing)
- ✅ **O2Switch stockage illimité** : Croissance infinie, pas de limite
- ✅ **O2Switch CDN gratuit** : Bande passante illimitée, diffusion rapide
- ✅ **Contrôle total** : Bouton manuel transfert (Ange décide quand)
- ✅ **Coût zéro** : VPS + O2Switch déjà payés
- ✅ **Séparation concerns** : VPS = compute, O2Switch = storage
- ✅ **Backup naturel** : O2Switch = archive permanente
- ✅ **55 GB libres VPS** : Largement suffisant (autres projets non impactés)

**Inconvénients (mineurs)** :
- ⚠️ **Transfert FTP** : ~10-30 sec pour 1 GB (acceptable)
- ⚠️ **Deux systèmes** : VPS SSH + O2Switch FTP (géré par app)

---

#### Configuration O2Switch

**1. Créer Subdomain CDN**

Panel O2Switch :
- Subdomain : `media.shinkofa.com`
- Document Root : `/public_html/media.shinkofa.com/`
- SSL : Activé (Let's Encrypt auto)

**2. Permissions & Headers (.htaccess)**

Fichier : `/public_html/media.shinkofa.com/.htaccess`

```apache
# CORS pour lecture depuis app.shinkofa.com
Header set Access-Control-Allow-Origin "https://app.shinkofa.com"
Header set Access-Control-Allow-Methods "GET, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type"

# Cache long terme (vidéos/audio ne changent jamais)
<FilesMatch "\.(mp4|mp3|jpg|png|webp|wav|m4a)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>

# Compression gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
</IfModule>

# Pas d'indexation de dossiers
Options -Indexes

# Fichiers servis directement (pas de PHP execution)
php_flag engine off
```

**3. Credentials FTP**

Panel O2Switch → Créer compte FTP :
- User : `media@shinkofa.com`
- Password : (généré sécurisé)
- Access : `/public_html/media.shinkofa.com/`
- Protocol : FTPS (FTP over SSL)

---

#### Implémentation Technique Social Content Master

**1. Database Schema Update**

```sql
-- Ajouter colonnes CDN tracking
ALTER TABLE media_files ADD COLUMN cdn_url TEXT;
ALTER TABLE media_files ADD COLUMN storage_location ENUM('vps_tmp', 'o2switch_cdn', 'processing') DEFAULT 'vps_tmp';
ALTER TABLE media_files ADD COLUMN stored_at TIMESTAMP;
ALTER TABLE media_files ADD COLUMN transfer_status ENUM('pending', 'transferring', 'completed', 'failed') DEFAULT 'pending';
ALTER TABLE media_files ADD COLUMN transfer_error TEXT;

-- Exemple données
-- id | filename              | status    | storage_location | cdn_url                                              | transfer_status
-- 1  | clip-tiktok-001.mp4  | processed | o2switch_cdn     | https://media.shinkofa.com/edited-ange/tiktok/...   | completed
-- 2  | stream-raw.mp4       | processing| vps_tmp          | NULL                                                 | pending
```

**2. Module Upload avec Transfert O2Switch**

**UI/UX Component** :

```tsx
// components/MediaLibrary/TransferButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

interface TransferButtonProps {
  fileId: string;
  filename: string;
  onTransferComplete?: () => void;
}

export function TransferButton({ fileId, filename, onTransferComplete }: TransferButtonProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTransfer = async () => {
    setIsTransferring(true);
    setProgress(0);

    try {
      const response = await fetch('/api/media/transfer-to-o2switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) throw new Error('Transfer failed');

      const data = await response.json();

      setProgress(100);
      setStatus('success');
      onTransferComplete?.();

    } catch (error) {
      console.error('Transfer error:', error);
      setStatus('error');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleTransfer}
        disabled={isTransferring || status === 'success'}
        variant={status === 'success' ? 'outline' : 'default'}
      >
        {status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
        {status === 'error' && <XCircle className="mr-2 h-4 w-4" />}
        {status === 'idle' && <Upload className="mr-2 h-4 w-4" />}
        {status === 'success' ? 'Transféré ✓' : 'Transférer vers O2Switch'}
      </Button>

      {isTransferring && (
        <div className="space-y-1">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Transfert en cours... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}
```

**API Route - Transfert FTP** :

```typescript
// app/api/media/transfer-to-o2switch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Client as FTPClient } from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();

    // 1. Récupérer métadonnées fichier depuis DB
    const file = await db.mediaFiles.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 2. Chemins local et remote
    const localPath = `/tmp/social-content-master/processed/${file.filename}`;
    const remoteDir = `/public_html/media.shinkofa.com/${file.folder}`; // ex: edited-ange/tiktok
    const remotePath = `${remoteDir}/${file.filename}`;

    // 3. Vérifier fichier local existe
    if (!fs.existsSync(localPath)) {
      return NextResponse.json({ error: 'Local file not found' }, { status: 404 });
    }

    // 4. Connexion FTPS O2Switch
    const ftpClient = new FTPClient();
    ftpClient.ftp.verbose = true; // Debug logs

    await ftpClient.access({
      host: process.env.O2SWITCH_FTP_HOST!, // ftp.shinkofa.com
      user: process.env.O2SWITCH_FTP_USER!, // media@shinkofa.com
      password: process.env.O2SWITCH_FTP_PASSWORD!,
      secure: true, // FTPS (FTP over SSL)
    });

    // 5. Créer dossier remote si nécessaire
    try {
      await ftpClient.ensureDir(remoteDir);
    } catch (error) {
      console.error('Error creating remote dir:', error);
    }

    // 6. Upload fichier
    await ftpClient.uploadFrom(localPath, remotePath);

    // 7. Fermer connexion FTP
    ftpClient.close();

    // 8. Mettre à jour DB avec URL CDN
    const cdnUrl = `https://media.shinkofa.com/${file.folder}/${file.filename}`;

    await db.mediaFiles.update({
      where: { id: fileId },
      data: {
        storage_location: 'o2switch_cdn',
        cdn_url: cdnUrl,
        stored_at: new Date(),
        transfer_status: 'completed',
      },
    });

    // 9. Supprimer fichier local VPS (libérer espace)
    fs.unlinkSync(localPath);
    console.log(`✅ Deleted local file: ${localPath}`);

    // 10. Nettoyer fichier brut si existe
    const rawPath = localPath.replace('/processed/', '/uploads/');
    if (fs.existsSync(rawPath)) {
      fs.unlinkSync(rawPath);
      console.log(`✅ Deleted raw file: ${rawPath}`);
    }

    return NextResponse.json({
      success: true,
      cdnUrl,
      message: 'File transferred successfully to O2Switch CDN',
    });

  } catch (error) {
    console.error('Transfer error:', error);

    // Mettre à jour DB avec erreur
    const { fileId } = await request.json();
    await db.mediaFiles.update({
      where: { id: fileId },
      data: {
        transfer_status: 'failed',
        transfer_error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Transfer failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
```

**Variables Environnement (.env)** :

```bash
# O2Switch FTP Credentials
O2SWITCH_FTP_HOST=ftp.shinkofa.com
O2SWITCH_FTP_USER=media@shinkofa.com
O2SWITCH_FTP_PASSWORD=your_secure_password_here

# CDN Base URL
O2SWITCH_CDN_URL=https://media.shinkofa.com
```

**Package Dependencies** :

```json
{
  "dependencies": {
    "basic-ftp": "^5.0.4"
  }
}
```

**3. Batch Transfer (Transférer Multiple Fichiers)**

```typescript
// app/api/media/batch-transfer/route.ts

export async function POST(request: NextRequest) {
  const { fileIds } = await request.json(); // Array de file IDs

  const results = [];

  for (const fileId of fileIds) {
    try {
      // Appel API transfert individuel (logique réutilisée)
      const response = await fetch('/api/media/transfer-to-o2switch', {
        method: 'POST',
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();
      results.push({ fileId, success: data.success, cdnUrl: data.cdnUrl });

    } catch (error) {
      results.push({ fileId, success: false, error: error.message });
    }
  }

  return NextResponse.json({ results });
}
```

---

#### Performances & Volumétrie

**Upload VPS → O2Switch (FTP)** :
- Connexion VPS OVH : ~1 Gbps
- O2Switch : Réception illimitée
- **1 GB ≈ 10-30 secondes** (bon débit inter-serveurs EU)
- **250 MB (5 clips TikTok) ≈ 5-10 secondes**

**Capacité VPS (55 GB libres)** :
- 1 stream brut 1080p : 2-4 GB (temporaire)
- Processing + clips : +500 MB (temporaire)
- **Max 5-10 GB simultanés** → Largement sous limite ✅

**Volume mensuel estimé** :
- 8-10 streams/mois × 3 GB = 30 GB brut
- 20-30 clips/mois × 30 MB = 900 MB édité
- 4 podcasts/mois × 100 MB = 400 MB
- **Total O2Switch : ~35-40 GB/mois** (croissance linéaire illimitée ✅)

---

#### Monitoring & Maintenance

**Cron Job VPS - Nettoyage Sécurité** :

En cas de fichiers orphelins (transfert échoué, oubliés) :

```bash
# /etc/cron.daily/cleanup-social-content-master

#!/bin/bash
# Supprimer fichiers > 24h dans /tmp/social-content-master/

find /tmp/social-content-master/uploads/ -type f -mtime +1 -delete
find /tmp/social-content-master/processed/ -type f -mtime +1 -delete

echo "✅ Cleanup completed: $(date)" >> /var/log/social-content-cleanup.log
```

**Logging & Alertes** :

```typescript
// lib/logger.ts

export function logTransfer(fileId: string, status: 'success' | 'error', details?: string) {
  console.log(`[TRANSFER] File ${fileId}: ${status}`, details);

  // Optionnel : Envoyer à Sentry, Slack, etc.
  if (status === 'error') {
    // await sendSlackAlert(`❌ Transfer failed: ${fileId}`);
  }
}
```

---

### Recommandation Finale ✅

**Phase MVP** : Architecture Hybride VPS + O2Switch

- ✅ VPS = App + Processing temporaire (5-10 GB max)
- ✅ O2Switch = Stockage permanent + CDN (illimité)
- ✅ Bouton manuel "Transférer vers O2Switch" (contrôle Ange)
- ✅ Nettoyage auto VPS après transfert réussi
- ✅ Coût zéro, scalabilité infinie

**Évolution future (si nécessaire)** :
- Phase 2 : Sync automatique planifiée (cron job quotidien)
- Phase 3 : Migration cloud CDN (R2, S3) si multi-geo requis

---

#### Option 3 : Cloud Storage (S3, R2, Supabase)

**Architecture** :
```
VPS OVH
│
├─ Social Content Master App (Next.js)
├─ PostgreSQL (métadonnées)
├─ Redis (queue)
│
└─ Stockage temporaire (en cours d'édition)
   └─ /tmp/social-content-master/ (10-20 GB)

O2Switch
│
└─ Stockage média long terme (stockage illimité)
   └─ public_html/media.shinkofa.com/
      ├─ videos/
      ├─ podcasts/
      └─ archives/
```

**Workflow** :
1. **Upload (Jay)** : Fichier brut → VPS /tmp/ (édition)
2. **Édition (Ange)** : Découpe, sous-titres → clips édités
3. **Publication** : Clips publiés → TikTok/YouTube/LinkedIn
4. **Archivage** : Fichiers bruts + édités → sync O2Switch via FTP/SFTP
5. **Nettoyage** : Suppression VPS /tmp/ après 7 jours

**Avantages** :
- ✅ **Stockage illimité O2Switch** : Pas de limite disque
- ✅ **VPS léger** : Seulement fichiers actifs (10-20 GB max)
- ✅ **Backup automatique** : O2Switch = archive long terme
- ✅ **CDN possible** : Servir médias depuis O2Switch (bande passante illimitée)

**Inconvénients** :
- ❌ **Complexité** : Sync automatique VPS → O2Switch à gérer
- ❌ **Latence réseau** : Si besoin re-télécharger depuis O2Switch
- ❌ **Deux systèmes** : FTP O2Switch + SSH VPS
- ❌ **Bande passante O2Switch** : Upload/download peut être lent

**Scripts sync automatique** :
```bash
# Cron job quotidien : sync VPS → O2Switch
rsync -avz /var/lib/social-content-master/media/ \
  ftp://user@o2switch.com/public_html/media.shinkofa.com/

# Nettoyage VPS fichiers > 7 jours
find /var/lib/social-content-master/media/ -mtime +7 -delete
```

---

#### Option 3 : Cloud Storage (S3, R2, Supabase)

**Note** : Cloud Storage (AWS S3, Cloudflare R2) sera considéré uniquement en Phase 3+ si Social Content Master devient SaaS multi-utilisateurs avec volume > 500 GB et besoin CDN mondial.

---

### Base de Données (Schema Simplifié)

```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(255),
  role ENUM('creator', 'editor', 'admin'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fichiers Media
CREATE TABLE media_files (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255),
  file_path TEXT,
  file_type ENUM('video', 'audio', 'image'),
  file_size BIGINT,
  duration INTEGER, -- secondes (si vidéo/audio)
  resolution VARCHAR(20), -- "1920x1080"
  tags TEXT[], -- Array de tags
  folder VARCHAR(100), -- "Raw-Jay", "Edited-Ange", etc.
  status ENUM('raw', 'edited', 'published'),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Clips Édités
CREATE TABLE edited_clips (
  id UUID PRIMARY KEY,
  source_media_id UUID REFERENCES media_files(id),
  clip_name VARCHAR(255),
  start_time INTEGER, -- secondes
  end_time INTEGER, -- secondes
  subtitles_generated BOOLEAN DEFAULT FALSE,
  subtitles_path TEXT, -- chemin fichier SRT
  export_formats JSONB, -- {"tiktok": "path/to/tiktok.mp4", ...}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  media_id UUID REFERENCES media_files(id),
  content TEXT, -- Texte post
  platforms TEXT[], -- ["tiktok", "linkedin", "youtube"]
  platform_specific JSONB, -- Adaptations par plateforme
  hashtags TEXT[],
  cta TEXT,
  status ENUM('draft', 'scheduled', 'published', 'failed'),
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Publications (1 post peut avoir plusieurs publications)
CREATE TABLE publications (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  platform VARCHAR(50), -- "tiktok", "linkedin", etc.
  platform_post_id VARCHAR(255), -- ID du post sur la plateforme
  platform_url TEXT, -- URL du post publié
  status ENUM('pending', 'published', 'failed'),
  error_message TEXT,
  published_at TIMESTAMP
);

-- Analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY,
  publication_id UUID REFERENCES publications(id),
  date DATE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Podcast Episodes
CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  audio_file_id UUID REFERENCES media_files(id),
  title VARCHAR(255),
  description TEXT,
  episode_number INTEGER,
  season_number INTEGER,
  artwork_url TEXT,
  duration INTEGER, -- secondes
  show_notes TEXT, -- markdown
  transcription TEXT, -- auto-générée via Whisper
  status ENUM('draft', 'scheduled', 'published'),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Podcast Publications
CREATE TABLE podcast_publications (
  id UUID PRIMARY KEY,
  episode_id UUID REFERENCES podcast_episodes(id),
  platform VARCHAR(50), -- "apple", "spotify", "youtube", "rss"
  platform_episode_id VARCHAR(255),
  platform_url TEXT,
  status ENUM('pending', 'published', 'failed'),
  error_message TEXT,
  published_at TIMESTAMP
);

-- Podcast Analytics
CREATE TABLE podcast_analytics (
  id UUID PRIMARY KEY,
  episode_id UUID REFERENCES podcast_episodes(id),
  date DATE,
  total_listens INTEGER DEFAULT 0,
  platform_listens JSONB, -- {"apple": 45, "spotify": 123, ...}
  avg_completion_rate DECIMAL(5,2), -- % épisode écouté
  new_subscribers INTEGER DEFAULT 0,
  geography JSONB, -- {"FR": 45%, "CA": 20%, ...}
  synced_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Design System

### Palette de Couleurs (Shinkofa Brand)

```css
:root {
  --primary-blue: #1c3049;
  --accent-orange: #e08f34;
  --accent-yellow: #f5cd3e;
  --white: #FFFFFF;

  --bg-dark: #0f1419;
  --bg-light: #f5f5f5;

  --text-primary: #1c3049;
  --text-secondary: #6b7280;

  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;

  --tiktok: #fe2c55;
  --youtube: #ff0000;
  --linkedin: #0a66c2;
  --instagram: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}
```

### Composants Réutilisables

**Button** :
```tsx
<Button variant="primary" size="md">
  Publier
</Button>
```

**FileCard** :
```tsx
<FileCard
  thumbnail="path/to/thumb.jpg"
  title="stream-dev-questionnaire.mp4"
  duration="2:14"
  tags={["stream", "dev"]}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

**Timeline** :
```tsx
<Timeline
  videoSrc="path/to/video.mp4"
  onMarkIn={(time) => {}}
  onMarkOut={(time) => {}}
/>
```

---

## 🚀 Roadmap de Développement

### Phase 1 : MVP (v1.0) - 2-3 mois

**Focus** : Workflow Jay → Ange fonctionnel (vidéo prioritaire)

**Features** :
- ✅ Module 1 : Media Library (upload, organisation, preview vidéo + audio)
- ✅ Module 2 : Éditeur Vidéo Basique (découpe, sous-titres auto)
- ✅ Module 3 : Composer Posts (templates, multi-plateformes)
- ✅ Module 4 : Calendrier (vue, planification manuelle)
- ✅ Module 5 : Publication (TikTok + LinkedIn + YouTube)
- ⚠️ Module 6 : Analytics Basique (affichage stats, pas d'insights)
- ⏳ Module 7 : Podcast (import audio uniquement, pas édition - Phase 1.5)

**Tech Stack MVP** :
- Frontend : Next.js + Shadcn/ui
- Backend : Next.js API Routes + PostgreSQL
- Storage : Local filesystem (VPS ou O2Switch)
- Video Processing : FFmpeg (server-side)
- Audio Processing : FFmpeg (normalisation, découpe basique)
- Transcription : OpenAI Whisper API

---

### Phase 2 : Optimisation (v1.5) - 1-2 mois

**Focus** : Améliorer UX, automatisation, podcast complet

**Features** :
- ✅ Batch export (exporter plusieurs clips d'un coup)
- ✅ Templates de posts sauvegardables
- ✅ Récurrence publications (posts automatiques)
- ✅ Intégration Instagram
- ✅ Analytics avancées (insights actionnables)
- ✅ Notifications (succès publication, échecs, milestones)
- ✅ **Module 7 Podcast complet** :
  - Éditeur audio (waveform, découpe, effets)
  - Métadonnées podcast (titre, description, artwork)
  - Publication RSS feed + plateformes (Apple, Spotify, YouTube Podcasts)
  - Clips audio courts (audiogrammes pour TikTok/Instagram)
  - Analytics podcast (écoutes, rétention)

---

### Phase 3 : IA & Automatisation (v2.0) - 2-3 mois

**Focus** : Réduire temps Ange, automatiser max

**Features** :
- ✅ **IA découpe automatique** :
  - Analyser vidéo longue → suggérer découpes optimales
  - Détecter "golden moments" (changement de ton, mots-clés)
  - Générer clips auto avec sous-titres

- ✅ **IA rédaction posts** :
  - Analyser vidéo → suggérer texte post
  - Adapter ton par plateforme (LinkedIn pro, TikTok casual)
  - Générer hashtags pertinents

- ✅ **IA planification** :
  - Suggérer meilleurs horaires (ML sur historique perf)
  - Auto-fill calendrier avec contenu optimisé

- ✅ **IA analytics prédictive** :
  - Prédire performance avant publication
  - Suggérer améliorations ("ajoutez hashtag X pour +20% vues")

---

### Phase 4 : Scale & Équipe (v3.0) - 3+ mois

**Focus** : Multi-créateurs, collaboration

**Features** :
- ✅ Multi-utilisateurs (roles : creator, editor, admin)
- ✅ Workflow approbation (creator crée → editor valide → publié)
- ✅ Commentaires & feedback in-app
- ✅ Brand guidelines centralisées
- ✅ API publique (intégrations tierces)

---

## 🔒 Sécurité & Conformité

### Protection des Données
- ✅ Chiffrement tokens OAuth (AES-256)
- ✅ HTTPS obligatoire
- ✅ Backup automatique DB (quotidien)
- ✅ RGPD compliant (export données, suppression compte)

### Gestion des Erreurs
- ✅ Retry automatique (publications échouées)
- ✅ Logs détaillés (traçabilité)
- ✅ Monitoring uptime (alertes si down)

---

## 💰 Modèle Économique (Future)

### Usage Interne (Shinkofa)
- **Gratuit** pour Jay & Ange
- Développement financé par revenus Shinkofa

### Potentiel SaaS (Phase 5+)
Si l'outil est efficace, possible de le vendre :
- **Freemium** : 1 compte gratuit, features limitées
- **Pro** : 19€/mois - Multi-comptes, analytics avancées
- **Team** : 49€/mois - Collaboration, approbations
- **Enterprise** : Sur devis - API, white-label

**Marché cible** :
- Créateurs de contenu solo/duo
- Agences social media
- Coachs/formateurs en ligne

---

## 📊 Métriques de Succès (Outil)

### Adoption (Shinkofa interne)
- Jay upload X heures de contenu/semaine
- Ange publie Y posts/semaine
- Temps économisé vs workflow manuel : -50%

### Performance (Contenu publié)
- Engagement moyen : +20% vs avant outil
- Conversions (questionnaires) : +30%
- Revenus attribués réseaux : 2000€/mois

### Technique
- Uptime : >99%
- Temps export vidéo : <2 min pour 60 sec de vidéo
- Transcription accuracy : >95%

---

## 🛠️ Intégrations Futures

### Outils Existants Shinkofa
- **Hibiki-Dictate** : Import direct audio voiceovers → Module Podcast
- **Ermite-Podcaster** : Migration complète dans Social Content Master (Module 7 Podcast)
  - Option A (recommandée) : Intégration native dans Social Content Master
  - Option B : Intégration API si Ermite reste standalone
- **Profil Holistique** : Utiliser données pour personnaliser contenu (IA future)

### Outils Tiers
- **Canva** : Créer miniatures directement depuis l'app
- **Notion** : Sync calendrier éditorial
- **Zapier** : Automatisations custom
- **Google Analytics** : Tracking conversions avancé

---

## 📝 Checklist Développement MVP

### Setup Initial
- [ ] Init repo Git
- [ ] Setup Next.js + TypeScript
- [ ] Config Tailwind + Shadcn/ui
- [ ] Setup PostgreSQL + Prisma ORM
- [ ] Config environnements (.env.local, .env.production)

### Module 1 : Media Library
- [ ] Upload fichiers (drag & drop)
- [ ] Stockage filesystem
- [ ] Métadonnées extraction (durée, résolution)
- [ ] Preview vidéo (Video.js)
- [ ] Organisation dossiers
- [ ] Tags & filtres
- [ ] Recherche

### Module 2 : Éditeur Vidéo
- [ ] Timeline UI (Canvas ou lib)
- [ ] Découpe vidéo (in/out points)
- [ ] Export clips (FFmpeg backend)
- [ ] Transcription audio (Whisper API)
- [ ] Édition sous-titres
- [ ] Burn-in sous-titres
- [ ] Export multi-formats (presets)

### Module 3 : Composer
- [ ] CRUD templates
- [ ] Éditeur post (WYSIWYG ou markdown)
- [ ] Variables dynamiques
- [ ] Adaptation multi-plateformes
- [ ] Preview posts
- [ ] Gestion hashtags

### Module 4 : Calendrier
- [ ] Vue mois/semaine/jour
- [ ] Drag & drop posts
- [ ] Color-coding plateformes
- [ ] Statuts visuels
- [ ] Planification date/heure

### Module 5 : Publication
- [ ] OAuth TikTok
- [ ] OAuth LinkedIn
- [ ] OAuth YouTube
- [ ] Publication immédiate
- [ ] Publication programmée (cron job)
- [ ] Logs & erreurs
- [ ] Queue Redis

### Module 6 : Analytics
- [ ] Fetch stats APIs (TikTok, LinkedIn, YouTube)
- [ ] Dashboard overview
- [ ] Performance par post
- [ ] Graphes évolution

### Module 7 : Podcast (Phase 1.5+)
- [ ] Import audio (MP3, WAV, M4A)
- [ ] Waveform timeline
- [ ] Découpe audio (in/out points)
- [ ] Effets basiques (normalisation, fade, noise reduction)
- [ ] Métadonnées épisode (titre, description, artwork)
- [ ] Génération RSS feed
- [ ] Publication Apple Podcasts, Spotify, YouTube Podcasts
- [ ] Clips audio courts (audiogrammes)
- [ ] Analytics podcast (écoutes, rétention)

### Hébergement & Stockage (VPS + O2Switch)

**Configuration O2Switch** :
- [ ] Créer subdomain `media.shinkofa.com` (Panel O2Switch)
- [ ] Créer dossiers `/public_html/media.shinkofa.com/{raw-jay,edited-ange,published}`
- [ ] Configurer .htaccess (CORS, Cache headers, Options -Indexes)
- [ ] Créer compte FTP `media@shinkofa.com` avec accès `/public_html/media.shinkofa.com/`
- [ ] Tester connexion FTPS depuis VPS
- [ ] Activer SSL Let's Encrypt pour `media.shinkofa.com`

**Configuration VPS** :
- [ ] Vérifier capacité disque (✅ 55 GB libres confirmé)
- [ ] Créer dossiers temporaires `/tmp/social-content-master/{uploads,processing,processed}`
- [ ] Installer package `basic-ftp` (npm install basic-ftp)
- [ ] Configurer variables env O2Switch (FTP host, user, password)
- [ ] Cron job nettoyage sécurité (fichiers > 24h)

**API Routes** :
- [ ] API `/api/media/upload` (upload VPS /tmp/)
- [ ] API `/api/media/transfer-to-o2switch` (FTP transfer + DB update)
- [ ] API `/api/media/batch-transfer` (multiple files)
- [ ] Nettoyage auto VPS après transfert réussi
- [ ] Error handling + logging FTP

### Tests & Déploiement
- [ ] Tests unitaires (critiques)
- [ ] Tests E2E (workflow complet)
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement VPS OVH (Docker)
- [ ] Monitoring (Sentry, Uptime Robot)

---

## 🎯 Prochaines Étapes Immédiates

### Phase 0 : Setup Infrastructure (1-2 jours)

**O2Switch** :
1. ✅ Créer subdomain `media.shinkofa.com`
2. ✅ Créer compte FTP `media@shinkofa.com`
3. ✅ Configurer .htaccess (CORS, Cache)
4. ✅ Tester upload FTP manuel depuis VPS

**VPS** :
1. ✅ Vérifier espace disque (df -h) : **55 GB libres confirmé**
2. ✅ Créer dossiers `/tmp/social-content-master/{uploads,processing,processed}`
3. ✅ Tester connexion FTP VPS → O2Switch

### Phase 1 : Init Projet Social Content Master (3-5 jours)

1. **Créer repo Git** :
   ```bash
   mkdir social-content-master
   cd social-content-master
   npx create-next-app@latest . --typescript --tailwind --app
   git init
   git remote add origin https://github.com/theermite/social-content-master.git
   ```

2. **Setup Stack** :
   - Next.js 15 + TypeScript
   - Shadcn/ui + Tailwind CSS
   - Prisma ORM + PostgreSQL
   - Redis (queue)
   - Basic-ftp (O2Switch transfer)

3. **Setup Database** :
   ```bash
   npx prisma init
   # Créer schemas (media_files, posts, publications, analytics, podcasts)
   npx prisma migrate dev
   ```

4. **Variables Environnement** :
   ```bash
   # .env.local
   DATABASE_URL=postgresql://user:password@localhost:5432/social_content_master
   REDIS_URL=redis://localhost:6379
   O2SWITCH_FTP_HOST=ftp.shinkofa.com
   O2SWITCH_FTP_USER=media@shinkofa.com
   O2SWITCH_FTP_PASSWORD=***
   O2SWITCH_CDN_URL=https://media.shinkofa.com
   OPENAI_API_KEY=*** (pour Whisper transcription)
   ```

### Phase 2 : Développer Module 1 - Media Library + Transfert O2Switch (1 semaine)

**Priorité 1** :
- [ ] Upload fichiers (drag & drop, multi-part)
- [ ] Stockage VPS `/tmp/uploads/`
- [ ] Preview vidéo/audio
- [ ] Métadonnées extraction (durée, résolution)

**Priorité 2** :
- [ ] API transfert FTP vers O2Switch
- [ ] Bouton "Transférer vers O2Switch"
- [ ] Progress bar + status tracking
- [ ] DB update avec cdn_url
- [ ] Nettoyage auto VPS

**Priorité 3** :
- [ ] Organisation dossiers (raw-jay, edited-ange)
- [ ] Tags & filtres
- [ ] Recherche

### Phase 3 : Développer Module 2 - Éditeur Vidéo (2 semaines)

- [ ] Timeline vidéo (scrub, markers in/out)
- [ ] Découpe clips (FFmpeg backend)
- [ ] Sous-titres auto (Whisper API)
- [ ] Export multi-formats (TikTok 720p, YouTube 1080p)

### Phase 4 : Développer Modules 3-6 (3-4 semaines)

- [ ] Module 3 : Composer Posts (templates, variables)
- [ ] Module 4 : Calendrier (vue mois/semaine, drag & drop)
- [ ] Module 5 : Publication (OAuth TikTok, LinkedIn, YouTube)
- [ ] Module 6 : Analytics (fetch stats APIs)

### Phase 5 : Déploiement VPS + Tests (1 semaine)

- [ ] Docker container `social_content_master`
- [ ] Deploy VPS OVH (vps.theermite.dev)
- [ ] Tests E2E workflow complet Jay → Ange
- [ ] Monitoring (Sentry, logs)

---

**Timeline Total MVP** : **8-10 semaines**

**Milestone 1** (2 semaines) : Media Library + Transfert O2Switch fonctionnel
**Milestone 2** (4 semaines) : Éditeur Vidéo + Composer Posts
**Milestone 3** (8 semaines) : MVP complet (tous modules)
**Milestone 4** (10 semaines) : Déployé production + tests utilisateurs

---

**Version** : 1.0 | **Date** : 2026-01-22 | **La Voie Shinkofa**
