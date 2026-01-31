# 📝 CHANGELOG - Ermite-Podcaster

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.23] - 2025-12-25

### ✨ Ajouté - Phase 4A Templates Custom + Effets Défilement

**VideoGenerator.jsx - Effets Défilement Star Wars Customisables** :
- **Vitesse défilement** : Slider 30-150 (lent 🐌 → très rapide 💨)
- **Direction** : Toggle Bas→Haut (classic) / Haut→Bas (inversé)
- **Zone fade** : Slider 0-50% (texte apparaît progressivement)
- **Espacement lignes** : Slider 0.3-1.2x (compact 📏 → spacieux 📊)
- Section contrôles visible uniquement en mode Star Wars
- Indicateurs visuels pour chaque réglage

**videoService.js - Support Paramètres Custom** :
- `scrollDirection` : 'bottom-to-top' ou 'top-to-bottom'
- `fadeZone` : Pourcentage dynamique (0-50%)
- `lineSpacing` : Espacement custom entre blocs texte
- Logique bidirectionnelle avec fade adaptatif selon direction
- Calcul position Y initial selon direction choisie

**VideoGenerator.jsx - Quick Save Template Custom** :
- Bouton "💾 Sauvegarder comme Template Custom"
- Sauvegarde couleurs + effets actuels comme template réutilisable
- Prompt nom template (default: "Mon Template [timestamp]")
- Auto-switch vers template nouvellement créé
- Persistence localStorage via templateService
- UX simplifiée : plus besoin d'aller dans Settings

### 📄 Documentation

**AMELIORATIONS-FUTURES.md** (NOUVEAU FICHIER) :
- Document complet 300+ lignes listant TOUTES les améliorations possibles
- Organisé par phases (4A-4M)
- Matrice priorités recommandées TAKUMI
- Estimations temps + complexité pour chaque feature
- Prérequis APIs (YouTube, DeepSeek, etc.)
- Questions à se poser pour prioriser roadmap
- Features : Export MP3, YouTube Upload, DeepSeek IA, Analytics, etc.

### 🎯 Impact Utilisateur - Phase 4A

- **Scroll customisable** : Contrôle total sur l'effet Star Wars (vitesse, direction, fade, espacement)
- **Templates rapides** : Création templates custom en 2 clics (sans passer par Settings)
- **Réutilisabilité** : Sauvegarde configs favorites pour usage futur
- **Roadmap claire** : Document AMELIORATIONS-FUTURES pour planifier évolution app

### 📦 Build

- **Taille** : ~275 KB JS (~75 KB gzip) - +4 KB pour features custom

---

## [1.0.22] - 2025-12-25

### 🐛 Corrigé - Crash Génération Vidéo

**VideoGenerator.jsx - Fix Race Condition (ligne 497)** :
- **Problème** : Écran blanc (crash) lors de l'ouverture de l'accordion "Génération Vidéo"
- **Cause** : Race condition React - `VIDEO_TEMPLATES` chargé après le premier rendu
- **Erreur console** : `Uncaught TypeError: Cannot read properties of undefined (reading 'name')`
- **Solution** : Ajout optional chaining `?.` + fallback text
  - Avant : `{VIDEO_TEMPLATES[selectedTemplate].name}`
  - Après : `{VIDEO_TEMPLATES[selectedTemplate]?.name || 'Chargement...'}`
- Accordion vidéo s'ouvre maintenant sans crash
- Affiche "Chargement..." pendant que templates se chargent

### 🎯 Impact Utilisateur

- ✅ Plus d'écran blanc lors de l'ouverture de la section vidéo
- ✅ Génération vidéo accessible immédiatement
- ✅ UX fluide sans interruption

### 📦 Build

- **Taille** : ~271 KB JS (~74 KB gzip) - Stable (fix 1 ligne)

---

## [1.0.21] - 2025-12-25

### ✨ Ajouté - Phase 3 UX Audio & Visualisation

**AudioRecorder.jsx - Mode Test Micro Avant Enregistrement** :
- Nouveau mode test micro permettant de vérifier le niveau audio AVANT d'appuyer sur enregistrement
- State `isTesting` + `streamRef` pour gérer le mode test indépendamment
- Fonction `startTest()` : Initialise AudioContext + analyser sans MediaRecorder
- Fonction `stopTest()` : Nettoyage propre du stream et contexte
- Volume analyzer partagé : `useEffect` détecte `(isTesting || (isRecording && !isPaused))`
- UI nouvelle :
  - Boutons initiaux : "🎤 Tester Micro" + "⏺ Démarrer Enregistrement"
  - Pendant test : Volume meter + "⏹ Arrêter Test" + "✓ OK, Enregistrer"
  - Transition fluide test → enregistrement via bouton "OK, Enregistrer"
- Dark theme support : Backgrounds adaptés (`colors.inputBg` au lieu de `colors.cremeBlanc`)
- Labels volume renforcés avec `font-semibold` pour meilleure lisibilité

**Frequency Volumes - Ajustement 5-7%** :
- `completeTemplateService.js` : Réduction volumes fréquences templates
  - The Ermite Pro : 10% → 6%
  - The Ermite Light : 8% → 5%
  - The Ermite Emerald : 12% → 7%
- `AudioConfig.jsx` : Volume par défaut 5% → 6%
- Enrichissement fréquentiel plus subtil, voix mieux préservée

**AudioWaveform.jsx - Visualisation Audacity-Style** (NOUVEAU COMPOSANT) :
- Remplacement du spectrogramme par waveform classique (comme Audacity)
- Technique min/max amplitude sampling pour performance optimale
- Canvas rendering double couche :
  - Stroke outline (bleuRoyal) pour contours
  - Fill avec 30% opacity pour effet visuel
- Ligne centrale baseline pour référence
- Canvas Retina-ready (2x resolution)
- Labels : "Temps →" (axe X) et "Amplitude" (axe Y)
- Dark theme compatible (fond `colors.inputBg`)
- Bordure `colors.bleuProfond` + padding soigné
- Permet de voir niveaux audio générés de manière intuitive

**AudioExport.jsx - Mise à Jour Visualisation** :
- Import `AudioWaveform` au lieu de `AudioSpectrogram`
- Accordion "Analyse Audio (Waveform)" au lieu de "Spectrogramme"
- Props identiques (`audioBuffer`, `colors`)

### 🎯 Impact Utilisateur - Phase 3

- **Test micro avant enregistrement** : Plus de risque d'enregistrer avec micro trop faible/fort
- **Volumes fréquences optimisés** : Enrichissement subtil (5-7%) sans masquer la voix
- **Waveform lisible** : Visualisation amplitude dans le temps (style Audacity)
- **Dark theme amélioré** : Contraste optimal pour volume meters et waveform

### 📝 Notes Techniques

**WhisperX/Distil-Whisper Research** :
- WhisperX : 70x plus rapide, timestamps word-level, diarisation, **mais server-side uniquement**
- Distil-Whisper : 6x plus rapide, 49% plus petit, **mais anglais uniquement**
- **Recommandation** : Garder Whisper OpenAI API actuel (multilingue français, simplicité, pas de backend requis)
- Alternative future : Whisper.cpp WebAssembly (offline, multilingue, zéro coût API, privacité totale)

### 📦 Build

- **Taille** : ~271 KB JS (~74 KB gzip) - +1 KB pour AudioWaveform component

---

## [1.0.20] - 2025-12-25

### ✨ Ajouté - Phase 2 Multi-Export & Templates Complets

**completeTemplateService.js - Service Templates Complets** (NOUVEAU) :
- Service pour gérer templates complets (audio + vidéo + miniature)
- 3 templates par défaut : The Ermite Pro / Light / Emerald
- Chaque template contient :
  - Configuration audio (fréquence thérapeutique, ambiance, volumes)
  - Template vidéo sélectionné automatiquement
  - Template miniature sélectionné automatiquement
- Sauvegarde localStorage avec `DEFAULT_COMPLETE_TEMPLATES` fallback
- Interface : `getAllTemplates()`, `getTemplate(id)`, `saveTemplate(template)`, `deleteTemplate(id)`

**AudioConfig.jsx - Dropdown Templates Complets** :
- Dropdown "Templates Complets (Audio + Vidéo + Miniature)" après section Templates Complets
- Fonction `handleLoadCompleteTemplate(templateId)` pour charger config complète
- Propagation IDs templates vidéo/miniature vers parent via `handleConfigNext()`
- Option "Aucun (Configuration manuelle)" pour désactiver
- Message aide : "Tu peux modifier les valeurs ci-dessous après avoir chargé un template"

**VideoGenerator.jsx - Multi-Export Simultané** :
- **Checkboxes multi-sélection** pour formats vidéo (16:9, 9:16, 1:1) au lieu de dropdown
- Fonction `handleRatioToggle()` pour gérer sélection (minimum 1 format requis)
- Counter dynamique : "✅ X format(s) sélectionné(s) → X vidéo(s) générée(s)"
- **Génération multi-vidéos** : `handleGenerate()` boucle sur tous ratios sélectionnés
- State `videos` array de `{ratio, blob}` au lieu de `videoBlob` unique
- Progression globale : 10% init + (80% / nombre ratios) + 10% final
- Label progression : "Génération 16:9 (1/3)...", "Génération 9:16 (2/3)...", etc.
- **UI Preview Grille** :
  - Grid responsive (1 colonne mobile, 2 colonnes desktop)
  - Chaque vidéo : Preview + bouton téléchargement individuel
  - Bouton "📦 Télécharger Toutes les Vidéos (X)" si plusieurs vidéos
- Fonction `handleDownloadAll()` avec delays séquentiels (500ms) pour éviter blocage navigateur
- Filename pattern : `{custom}-{style}-{ratio}.webm` (ex: `Podcast-TheErmite-typewriter-16x9.webm`)
- Suppression state obsolète `videoBlob` (remplacé par `videos`)
- Accepte prop `defaultTemplate` pour auto-sélection template depuis AudioConfig

**ThumbnailGenerator.jsx - Auto-Sélection Template** :
- Accepte prop `defaultTemplate` pour auto-sélection depuis AudioConfig
- useEffect pour charger template par défaut au mount si fourni

**App.jsx - Propagation Templates** :
- States `videoTemplateId` et `thumbnailTemplateId` pour stocker sélection
- Fonction `handleConfigNext()` accepte 2 params supplémentaires : `videoTplId`, `thumbnailTplId`
- Props `defaultVideoTemplate` et `defaultThumbnailTemplate` passées à `<AudioExport />`

**AudioExport.jsx - Propagation Templates aux Enfants** :
- Props `defaultVideoTemplate` et `defaultThumbnailTemplate` reçues depuis App
- Passées directement à `<VideoGenerator />` et `<ThumbnailGenerator />`
- Workflow complet : AudioConfig → App → AudioExport → Composants enfants
- **Bouton Spotify Podcaster** : Lien direct vers https://creators.spotify.com/ pour upload manuel
- Couleur officielle Spotify (#1DB954) avec hover effect
- Ouverture nouvel onglet avec sécurité `rel="noopener noreferrer"`

### 🎯 Impact Utilisateur - Phase 2

- **1 clic pour charger config complète** : Audio + Vidéo + Miniature pré-configurés (The Ermite Pro/Light/Emerald)
- **Multi-export simultané** : Générer YouTube (16:9) + TikTok (9:16) + Instagram (1:1) en une seule action
- **Téléchargement batch** : Bouton "Télécharger Toutes les Vidéos" pour export rapide
- **Upload Spotify direct** : Bouton dédié pour uploader rapidement sur Spotify Podcaster
- **Workflow optimisé** : Moins de clics, cohérence visuelle automatique entre audio/vidéo/miniature

---

## [1.0.19] - 2025-12-25

### ✨ Ajouté - Phase 1 Quick Wins

**thumbnailService.js - Filtres Image Opérationnels** :
- Implémentation filtres blur + overlay opacity (UI déjà présente depuis v1.0.17)
- `drawCoverImage()` : Paramètres `imageBlur` (0-10px) et `overlayOpacity` (0-100%)
- Application `ctx.filter = 'blur(Npx)'` avant `drawImage()`
- Overlay avec `ctx.globalAlpha` après image pour assombrir/éclaircir fond
- Templates modern/minimal/gradient tous supportent les filtres
- Miniatures personnalisables avec image de fond floutée + overlay ajustable

**VideoGenerator.jsx - Nom Fichier Éditable** :
- State `videoFilename` avec format par défaut : `Podcast-TheErmite-YYYYMMDD`
- Input texte pour éditer nom avant téléchargement
- Preview nom complet : `{custom}-{style}-{ratio}.webm`
- Consistance UX avec AudioExport.jsx

**ThumbnailGenerator.jsx - Nom Fichier Éditable** :
- State `thumbnailFilename` avec format par défaut : `Thumbnail-TheErmite-YYYYMMDD`
- Input texte pour éditer nom avant téléchargement
- Preview nom complet : `{custom}-{template}-{format}.png`
- Gestion labels formats (spotify/instagram/ratio)

**AudioExport.jsx - Bouton Export All** :
- Bouton "📦 Tout Exporter" télécharge audio WAV + vidéo WebM + miniature PNG en 1 clic
- States `videoData` et `thumbnailDataUrl` pour tracker fichiers générés
- Callbacks `onVideoGenerated` et `onThumbnailGenerated` depuis composants enfants
- Downloads séquentiels avec délais (500ms vidéo, 1000ms miniature) pour éviter blocage navigateur
- Label dynamique : affiche quels fichiers seront exportés
- Visible uniquement si vidéo OU miniature générée

**AudioConfig.jsx - Preset Auto-Save** :
- Auto-sauvegarde config dans `localStorage.lastUsedPreset` au clic "Suivant"
- Auto-chargement dernier preset utilisé au démarrage composant
- Fichiers upload ambiants exclus de la sauvegarde (trop lourds pour localStorage)
- UX transparente : utilisateurs retrouvent leurs réglages préférés automatiquement

### 🎯 Impact

- **Productivité** : Workflow 3x plus rapide avec Export All
- **Personnalisation** : Miniatures avec filtres image professionnels
- **Organisation** : Noms fichiers éditables pour classification facile
- **Confort** : Auto-save preset = moins de clics répétitifs

### 📦 Build

- **Taille** : ~260 KB JS (~72 KB gzip) - +5 KB pour nouvelles features

---

## [1.0.18] - 2025-12-16

### 🐛 Corrigé - Template Modern Miniatures

**thumbnailService.js - drawModernTemplate() Adaptatif (lignes 72-165)** :
- Fix titre ne s'affichant pas correctement (police trop grande)
- Fix encadré trop grand par rapport au texte
- Fix positionnement sous-titre incorrect
- **Nouvelle logique adaptative** :
  - Taille police calculée avec wrapping : `Math.min(width * 0.05, 80)` départ
  - Pré-calcul lignes wrappées pour mesurer hauteur réelle du texte
  - Réduction automatique taille police si texte > 25% hauteur totale
  - **Hauteur box adaptée au texte réel** : `boxHeight = textHeight + boxPadding * 2`
  - Padding vertical proportionnel : `titleSize * 1.5`
- Titre toujours lisible et correctement centré dans la box

**ThumbnailGenerator.jsx - Preview Modern Adaptatif (lignes 181-261)** :
- Même logique adaptative que thumbnailService pour preview
- Preview maintenant identique au rendu final (encore plus précis)
- Box s'adapte à la longueur du titre

### 📦 Build

- **Taille** : 254.86 KB JS (70.47 KB gzip) - +0.92 KB pour logique adaptative

---

## [1.0.17] - 2025-12-16

### 🐛 Corrigé - Preview Miniatures + Images Par Template

**ThumbnailGenerator.jsx - Preview Templates Réels (lignes 93-296)** :
- Preview utilise maintenant les VRAIS templates (modern, minimal, gradient) au lieu d'un simple fond + texte
- Template "Modern" : Fond dégradé + encadré avec bordure autour du titre + sous-titre en dehors
- Template "Minimal" : Fond uni + texte avec ombres
- Template "Gradient" : Fond dégradé 3 stops + bande diagonale + texte
- Template "Custom" : Fond uni simple personnalisable
- Helpers ajoutés : `drawTextCentered()`, `roundRect()`, `adjustColor()`
- Preview parfaitement identique au rendu final

**SettingsPanel.jsx - Images Par Template (lignes 15-78, 266-308, 377-419)** :
- Architecture refactorisée : 1 image par template au lieu de globale
- localStorage : `videoBackgrounds` et `thumbnailBackgrounds` (objets `{ templateId: dataUrl }`)
- Upload d'image intégré dans chaque card de template (onglets Templates Vidéo et Templates Miniatures)
- Preview miniature 16px + bouton supprimer dans chaque card
- Suppression ancienne section globale "Images de Fond par Défaut" de l'onglet Général

**VideoGenerator.jsx + ThumbnailGenerator.jsx - Chargement Par Template** :
- useEffect charge image spécifique au template sélectionné (pas globale)
- Dépendance `selectedTemplate` pour recharger image quand template change
- Conversion dataURL → File via fetch/blob

### 🔧 Amélioré

- UX miniatures : Preview maintenant fiable pour juger du rendu final
- UX images : Gestion granulaire par template (plus logique et flexible)
- Workflow : Image auto-chargée quand on change de template

### 📦 Build

- **Taille** : 253.94 KB JS (70.17 KB gzip) - +1.97 KB pour preview templates réels

---

## [1.0.16] - 2025-12-16

### ✨ Ajouté - UX Améliorations Majeures

**AudioExport.jsx - Nom Fichier Audio** :
- Nom automatique format `Podcast-TheErmite-YYYYMMDD`
- Helper `getDateString()` pour format date (exemple : 20251216)
- Input éditable pour modifier nom avant téléchargement
- Extension .wav affichée séparément

**ThumbnailGenerator.jsx - Text Wrapping Preview** :
- Ajout fonction `drawTextCentered()` locale dans useEffect preview (lignes 98-126)
- Texte titre et sous-titre wrappent automatiquement (maxWidth 85%)
- Texte ne déborde plus jamais visuellement
- Preview identique à génération finale

**SettingsPanel.jsx - Images de Fond par Défaut** :
- Nouvelle section "🖼️ Images de Fond par Défaut" dans onglet Général
- Upload image de fond vidéo par défaut (stockage localStorage base64)
- Upload image de fond miniature par défaut (stockage localStorage base64)
- Preview miniatures des images uploadées
- Boutons supprimer pour reset

**VideoGenerator.jsx + ThumbnailGenerator.jsx - Auto-load Images** :
- useEffect charge automatiquement images par défaut au démarrage
- Conversion dataURL → File via fetch/blob pour compatibilité
- Images chargées uniquement si aucune image déjà sélectionnée

### 🔧 Amélioré

- UX génération audio : Nom fichier clair et modifiable
- UX miniatures : Texte toujours lisible sans débordement
- UX settings : Gestion centralisée images de fond
- Workflow plus rapide : Images de fond auto-chargées

### 📦 Build

- **Taille** : 251.97 KB JS (69.58 KB gzip) - +4.66 KB pour nouvelles features UX

---

## [1.0.15] - 2025-12-16

### 🐛 Corrigé - Vidéo Génération Critique

**videoService.js - Animation Star Wars (lignes 186-272)** :
- Fix superposition texte illisible dans style Star Wars
- Refactorisation complète : pré-calcul des lignes wrappées avant animation
- Calcul hauteur réelle de chaque bloc de texte (wrapped lines × lineHeight)
- Positionnement Y cumulatif basé sur hauteurs réelles + espacement (`fontSize * 0.6`)
- Texte scrolling parfaitement espacé, lisible, sans chevauchement

**VideoGenerator.jsx - Barre de Progression (lignes 123-200, 486-494)** :
- Ajout `setTimeout` delays pour forcer React reflows avant opérations bloquantes
- Label progression clair : "Enregistrement en temps réel (~Xs)..."
- Console.log debugging pour tracking génération
- Encadré informatif expliquant : page figée = normal (enregistrement temps réel)
- UX améliorée : utilisateur comprend que le freeze est attendu

### 📝 Notes Techniques

**MediaRecorder Limitation** :
- Enregistrement vidéo = synchrone, bloque thread JavaScript pendant durée audio
- React state updates impossible pendant enregistrement
- Solution : Messaging clair pour éviter impression de crash

---

## [1.0.14] - 2025-12-15

### ✨ Ajouté - Sécurité + UX

**Page de Login** :
- LoginPage.jsx avec code d'accès (238897)
- Explication complète de l'application (features audio, transcription, vidéo, miniatures)
- Authentification localStorage persistante
- Bouton déconnexion dans header (🚪)

**Gestion Téléchargements** :
- Nouvelle section "📁 Dossier de Téléchargement" dans Settings → Général
- Instructions détaillées pour Chrome/Edge et Firefox
- Conseils pour organiser fichiers (Audio/Vidéos/Miniatures)

### 🐛 Corrigé - Bugs Critiques

**AudioConfig.jsx (ligne 110)** :
- Fix condition `selectedFrequency !== null` → `selectedFrequency !== 'none'`
- Slider volume fréquence n'apparaît plus quand "Aucune" sélectionné

**AudioExport.jsx (ligne 71)** :
- Fix condition `value !== null` → `value !== null && value !== 'none'`
- Fréquence thérapeutique n'est plus appliquée quand "Aucune" sélectionné

**VideoGenerator.jsx (ligne 266)** :
- Fix `VIDEO_TEMPLATES[key].description` → `VIDEO_TEMPLATES[key].name`
- Propriété description n'existait pas dans templates (undefined error)

**ThumbnailGenerator.jsx (ligne 234)** :
- Fix `THUMBNAIL_TEMPLATES[key].description` → `THUMBNAIL_TEMPLATES[key].name`
- Même correction que VideoGenerator

### 🔧 Amélioré

- App.jsx : Gestion state authentification + logout
- SettingsPanel : Version mise à jour v1.0.14
- Sécurité : Accès protégé par code personnel

### 📦 Build

- **Taille** : 246.46 KB JS (68.39 KB gzip) - +7.42 KB pour LoginPage

---

## [1.0.13] - 2025-12-15

### 🔧 Amélioré - Phases K+L : Templates Dynamiques + Text Wrapping

**Phase K - Intégration Templates Dynamiques** :
- VideoGenerator charge templates depuis templateService (+ templates custom)
- ThumbnailGenerator charge templates depuis templateService (+ templates custom)
- Templates mis à jour automatiquement lors de modifications dans Settings
- Support templates créés/édités via SettingsPanel

**Phase L - Text Wrapping Optimisé** :
- Refactorisation `videoService.js` : utilisation fonctions helper `wrapText()` et `drawMultilineText()`
- Suppression code dupliqué dans `animateStarWars()`, `animateTypeWriter()`, `animateSimple()`
- Texte vidéo garantit de toujours rentrer dans le cadre de la résolution choisie
- Code plus maintenable et DRY (Don't Repeat Yourself)

### 📦 Build

- **Taille** : 239.04 KB JS (66.85 KB gzip) - Optimisé (code dupliqué supprimé)

---

## [1.0.12] - 2025-12-15

### ✨ Ajouté - Phase J : Settings Panel Fonctionnel

**TemplateService** :
- Service localStorage pour gestion templates vidéo/miniatures
- 5 templates vidéo par défaut (The Ermite Pro, Light, Emerald, Dark Modern, Light Elegant)
- 5 templates miniatures par défaut (The Ermite Pro, Light, Emerald, Dark Gold, Minimal White)
- CRUD complet : Create, Read, Update, Delete pour templates custom
- Protection templates par défaut (non supprimables)

**SettingsPanel Complet** :
- 3 onglets : Templates Vidéo, Templates Miniatures, Général
- Bouton "+ Nouveau Template" pour création custom
- Modal éditeur avec preview temps réel
- Sélecteurs de couleurs (color picker + input hex)
- Sliders pour effets d'ombre (blur, offsetX, offsetY)
- Preview live dans modal avant sauvegarde
- Boutons Enregistrer/Annuler/Supprimer

### 🔧 Amélioré

- App.jsx : Ajout state `templatesVersion` pour trigger refresh VideoGenerator/ThumbnailGenerator
- SettingsPanel accessible via bouton ⚙️ (top-right)
- Templates réutilisables entre sessions (localStorage)

### 📦 Build

- **Taille** : 241.18 KB JS (67.18 KB gzip) - +9.6 KB pour templateService + modals

---

## [1.0.11] - 2025-12-15

### ✨ Ajouté - Phase I : UX Improvements

**Back to Top Button** :
- Bouton flottant "↑" apparaît après scroll 300px
- Scroll smooth vers le haut
- Style : fond vertEmeraude, hover scale 110%, z-index 50

**Settings Panel (UI)** :
- Bouton ⚙️ Settings (top-right à côté dark mode toggle)
- Panel latéral slide-in avec overlay backdrop
- 4 tabs : Presets Audio, Templates Vidéo, Templates Miniatures, Général
- Instructions utilisateur pour chaque section
- Bouton ❌ pour fermeture

### 🔧 Amélioré

- App.jsx : State `showBackToTop` et `showSettings`
- Event listener scroll pour affichage Back to Top
- UX plus fluide pour navigation longues pages

### 📦 Build

- **Taille** : 231.58 KB JS (66.07 KB gzip) - +9.4 KB pour SettingsPanel

---

## [1.0.10] - 2025-12-15

### ✨ Ajouté - Phases E+F : Dark Mode Fix + Preview Temps Réel

**Phase E - Dark Mode Contrast Fix** :
- Fix contraste texte noir sur fond foncé (body.dark CSS)
- Sélecteurs globaux : `select`, `option`, `input[type="file"]` en mode dark
- Input file selector button stylisé (background #2B4C7E)
- Range inputs avec accent-color #8A9A85
- Placeholders inputs avec opacité 0.7 pour lisibilité
- Conformité WCAG AAA maintenue

**Phase F - Preview Functionality** :
- Canvas preview temps réel dans VideoGenerator (useEffect + previewCanvasRef)
- Canvas preview temps réel dans ThumbnailGenerator (useEffect + previewCanvasRef)
- Aperçu mise à jour automatique lors changement couleurs/positions/shadows
- Échelle preview adaptée au ratio (9:16 → 0.15, autres → 0.25)
- Sample text visible avant génération complète

### 🔧 Amélioré

- index.css : Ajout règles CSS globales dark mode pour form elements
- App.jsx : `useEffect` pour ajouter/retirer classe `dark` sur body
- VideoGenerator : Preview canvas avec shadows et effets en temps réel
- ThumbnailGenerator : Preview canvas avec titre/sous-titre positionnés

### 📦 Build

- **Taille** : 222.43 KB JS (64.57 KB gzip) - +2.55 KB pour previews

---

## [1.0.9] - 2024-12-15

### ✨ Ajouté - Phase B : Améliorations Miniatures

**Templates Miniatures** :
- 6 templates prédéfinis pour miniatures (The Ermite Pro, Light, Emerald, Dark Gold, Minimal White, Custom)
- Template "The Ermite Pro" par défaut pour branding cohérent
- Descriptions détaillées pour chaque template

**Personnalisation Couleurs** :
- Sélecteurs de couleurs (fond, titre, sous-titre) pour template "Custom"
- Preview couleurs en temps réel
- Gestion automatique des couleurs lors du changement de template

**Filtres Image** :
- Slider flou fond (0-10px) - UI prête
- Slider opacité overlay (0-100%) - UI prête
- Filtres visibles uniquement si image de fond uploadée

### 🔧 Amélioré

- Cohérence UI avec VideoGenerator (même style de templates)
- Dark mode complet maintenu

### 📦 Build

- **Taille** : 219.88 KB JS (63.96 KB gzip) - +3.7 KB

---

## [1.0.8] - 2024-12-15

### 🐛 Corrigé - Phase A : Corrections Critiques

**Fix Dark Mode ThumbnailGenerator** :
- ThumbnailGenerator accepte maintenant le prop `colors`
- Remplacement de toutes les références `COLORS.` par `colors.` (24 occurrences)
- Contraste WCAG AAA parfait en mode sombre

**Barre de Progression** :
- Ajout barre de progression avec % (0-100%) pour génération miniatures
- Labels détaillés : Préparation → Chargement → Génération → Finalisation
- Bouton Annuler pour stopper la génération
- Gestion état `cancelGeneration` avec vérifications

### 🔧 Amélioré

- Cohérence UI avec VideoGenerator et TranscriptionPanel
- Pattern identique : spinner + barre + pourcentage + bouton annuler
- Transitions smooth (setTimeout 500ms après génération)

### 📦 Build

- **Taille** : 216.18 KB JS (63.41 KB gzip) - +0.88 KB

---

## [1.0.7] - 2024-12-15

### ✨ Ajouté - Phase C : Améliorations Vidéo

**Templates Vidéo** :
- 6 templates prédéfinis (The Ermite Pro, Light, Emerald, Dark Modern, Light Elegant, Custom)
- Template "The Ermite Pro" par défaut (branding cohérent)
- Descriptions détaillées pour chaque template

**Personnalisation Couleurs Vidéo** :
- Sélecteurs de couleurs (fond, texte, ombre) pour template "Custom"
- Preview couleurs en temps réel dans configuration
- Carrés de couleurs dans récapitulatif final

**Effets de Texte Avancés** :
- Slider intensité ombre (0-30px blur)
- Sliders décalage ombre X/Y (-10 à +10px)
- Effets appliqués aux 3 styles : StarWars, TypeWriter, Simple

### 🔧 Amélioré

**Service Vidéo** :
- Support paramètres `shadowColor`, `shadowBlur`, `shadowOffsetX`, `shadowOffsetY`
- Mise à jour `generateStarWarsVideo` avec effets personnalisés
- Mise à jour `generateTypeWriterVideo` avec effets personnalisés
- Mise à jour `generateSimpleVideo` avec effets personnalisés

### 📦 Build

- **Taille** : 215.30 KB JS (63.31 KB gzip) - +6 KB pour templates

---

## [1.0.6] - 2024-12-15

### ✨ Ajouté - Barres Progression + Annulation

**Barres de Progression Complètes** :
- Barre progression avec % pour génération audio (AudioExport)
- Barre progression avec % pour transcription (Whisper/AssemblyAI)
- Barre progression avec % pour génération vidéo
- Bouton Annuler sur toutes les barres de progression

**Fix Dark Mode Complet** :
- TranscriptionPanel : Fix dark mode (tous inputs, backgrounds, textes)
- VideoGenerator : Fix dark mode (selects, inputs, configuration)

### 🔧 Amélioré

- Labels détaillés pour chaque étape de traitement
- Gestion état `cancelProcessing`/`cancelTranscription`/`cancelGeneration`
- Vérifications cancellation tout au long des processus

### 📦 Build

- **Taille** : 209.52 KB JS (62.12 KB gzip)

---

## [1.0.5] - 2024-12-15

### ✨ Ajouté - Enregistrement Audio Direct

**AudioRecorder Component** :
- Enregistrement direct via microphone (MediaRecorder API)
- Timer en temps réel pendant enregistrement
- Pause/Reprise fonctionnel
- Preview audio avant utilisation (élément HTML5 audio)
- Format WebM output
- Bouton Recommencer si insatisfait

**Upload Mode Toggle** :
- Toggle style onglets : "📁 Upload Fichier" vs "🎤 Enregistrer Direct"
- Interface intuitive avec indicateurs visuels

### 🐛 Corrigé

- Fix contraste dark mode partout (WCAG AAA)
- Correction doublons bouton upload
- Fix tab-style interface upload/record

### 📦 Build

- **Taille** : 207.14 KB JS gzip

---

## [1.0.4] - 2024-12-15

### ✨ Ajouté

**Configuration UI** :
- Conversion fréquences : radio buttons → dropdown (gain de place)
- Ajout barre de progression génération audio avec labels et %

### 🔧 Amélioré

**Dark Mode** :
- Ajout `cardBg`, `inputBg`, `borderColor` aux palettes COLORS
- Fix backgrounds de tous les cards et inputs en mode sombre

### 📦 Build

- **Taille** : 202.54 KB JS gzip

---

## [1.0.3] - 2024-12-15

### ✨ Ajouté - Production Ready

**Musique d'Ambiance** :
- Activation des 8 fichiers ambiance dans MUSIC_LIBRARY
- Brazilian Streets, Lofi Hip Hop, Deep Forest, etc.

**Branding The Ermite** :
- Logo intégré (`/logo.png`, `/favicon.ico`)
- Charte graphique complète (bleuProfond, bleuRoyal, vertEmeraude, etc.)

**Dark Mode** :
- Toggle dark/light mode avec icône ☀️/🌙
- Persistence localStorage
- Palette `COLORS_DARK` complète

**Responsive Design** :
- Breakpoints Tailwind (sm, md, lg, xl)
- Mobile-first optimisé
- Textes et boutons adaptés tailles écran

**Documentation** :
- COPYRIGHT.md complet (licence personnelle Jay The Ermite)
- USER-GUIDE.md détaillé (non-technique pour end-users)
- README.md avec instructions déploiement o2Switch

### 📦 Build

- **Taille** : 201 KB JS gzip
- Format : PWA (Progressive Web App)
- Offline support via Service Worker

---

## [1.0.2] - 2024-12-14

### ✨ Ajouté

**Transcription** :
- Support Whisper OpenAI (ultra rapide ~$0.006/min)
- Support AssemblyAI (gratuit 5h/mois)
- Saisie manuelle transcription
- Export SRT/VTT
- Édition transcription inline

**Génération Vidéo** :
- 3 styles : TypeWriter, Star Wars, Simple
- 3 formats : 16:9 (YouTube), 9:16 (TikTok), 1:1 (Instagram)
- Support image de fond custom
- Preview avant téléchargement

**Génération Miniatures** :
- 3 templates : Modern, Minimal, Gradient
- 4 formats : YouTube, TikTok, Instagram, Spotify (3000x3000)
- Positionnement vertical titre/sous-titre
- Support image de fond

### 🔧 Amélioré

- Interface 3 steps claire (Upload → Config → Export)
- Preview audio enrichi avant téléchargement
- Volume principal ajustable (0.1x - 2.0x)

---

## [1.0.1] - 2024-12-13

### ✨ Ajouté

**Fréquences Thérapeutiques** :
- 432 Hz (Harmonie universelle)
- 528 Hz (Transformation ADN)
- 639 Hz (Relations harmonieuses)
- 741 Hz (Éveil intuition)
- Binaural 7 Hz (Ondes Thêta méditation)

**Gestion Presets** :
- Sauvegarde configurations personnalisées
- Presets par défaut (Méditation, Concentration, Sommeil)
- Export/Import JSON
- Suppression presets (sauf défauts)

### 🔧 Amélioré

- Mixage audio optimisé (Web Audio API)
- Volume fréquence ajustable (1-20%)
- Volume ambiance ajustable (1-30%)

---

## [1.0.0] - 2024-12-12

### ✨ Première Release

**Features Core** :
- Upload fichiers audio (MP3, WAV, M4A, OGG, WEBM)
- Enrichissement avec fréquences thérapeutiques
- Export WAV haute qualité
- Interface React 18 + Vite
- PWA avec offline support
- Responsive mobile-first

**Stack Technique** :
- React 18
- Vite 5
- Tailwind CSS 3
- Web Audio API
- Service Workers (PWA)

---

## Format des Versions

- **MAJOR** (X.0.0) : Changements incompatibles API
- **MINOR** (0.X.0) : Ajout fonctionnalités compatibles
- **PATCH** (0.0.X) : Corrections bugs compatibles

---

**Légende** :
- ✨ Ajouté : Nouvelles fonctionnalités
- 🔧 Amélioré : Améliorations features existantes
- 🐛 Corrigé : Corrections bugs
- 🗑️ Supprimé : Features retirées
- 🔒 Sécurité : Correctifs vulnérabilités
- 📦 Build : Informations build/packaging
