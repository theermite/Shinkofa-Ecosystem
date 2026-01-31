# DEVELOPMENT ROADMAP - Social-Content-Master (Shinkofa Studio)

> **URL Production**: studio.shinkofa.com
> **Dernière mise à jour**: 2025-01-25
> **Version cible**: 3.0.0

---

## ÉTAT ACTUEL: v2.0.0

### Modules Complétés
- [x] Media Library (upload, filtres, stream, delete, FTP)
- [x] Video Editor (timeline multi-segments, blade tool, undo/redo)
- [x] Auto-cut (détection silences, suppression automatique)
- [x] Transcription (Groq Whisper v3)
- [x] Audio Mixing (musique + fréquences thérapeutiques)
- [x] Audio Preview (Web Audio API temps réel)
- [x] Multi-Format Export (TikTok, YouTube, LinkedIn, Instagram)
- [x] Job Queue System (BullMQ workers)

---

## PLAN DE DÉVELOPPEMENT v3.0.0

### PHASE 1: Améliorations Éditeur (Priorité HAUTE)

#### 1.1 Dictionnaire de Transcription
```
Statut: À FAIRE
Priorité: HAUTE
Effort: 0.5 jour
```
- [ ] Table `transcription_dictionary` (userId, term, replacement)
- [ ] UI dans SubtitlePanel pour gérer le dictionnaire
- [ ] Application automatique lors de la transcription
- [ ] Import/Export du dictionnaire (JSON)

**Fichiers à modifier:**
- `prisma/schema.prisma` - Nouvelle table
- `src/components/editor/SubtitlePanel.tsx` - UI dictionnaire
- `app/api/transcription/dictionary/route.ts` - CRUD API
- `src/services/transcription/groq.ts` - Appliquer corrections

#### 1.2 Style des Sous-titres
```
Statut: À FAIRE
Priorité: HAUTE
Effort: 1 jour
```
- [ ] Panel de configuration style (font, size, color, bg, position)
- [ ] Preview en temps réel sur la vidéo
- [ ] Presets de styles (Moderne, Classique, TikTok, etc.)
- [ ] Sauvegarde du style dans EditedClip.subtitleStyle

**Fichiers à modifier:**
- `src/components/editor/SubtitleStylePanel.tsx` - Nouveau composant
- `src/components/editor/VideoPreview.tsx` - Appliquer style
- `src/types/subtitle.ts` - Types pour styles
- `app/api/editor/subtitle-style/route.ts` - Sauvegarder style

#### 1.3 Thème Clair/Sombre
```
Statut: À FAIRE
Priorité: MOYENNE
Effort: 0.5 jour
```
- [ ] next-themes configuration
- [ ] Toggle dans le header
- [ ] Persistance localStorage
- [ ] Variables CSS pour les deux thèmes

**Fichiers à modifier:**
- `app/layout.tsx` - ThemeProvider
- `src/components/ui/theme-toggle.tsx` - Nouveau composant
- `tailwind.config.ts` - Dark mode config
- `globals.css` - Variables CSS

---

### PHASE 2: Gestion Media Library (Priorité HAUTE)

#### 2.1 Édition Métadonnées Fichiers
```
Statut: À FAIRE
Priorité: HAUTE
Effort: 0.5 jour
```
- [ ] Modal d'édition (nom, catégorie/folder, tags)
- [ ] Renommage fichier sur VPS + DB
- [ ] Gestion des tags (ajout/suppression)
- [ ] Changement de catégorie (RAW_JAY, EDITED_ANGE, etc.)

**Fichiers à modifier:**
- `src/components/media/MediaEditModal.tsx` - Nouveau composant
- `src/components/media/MediaGrid.tsx` - Bouton edit
- `app/api/media/[id]/route.ts` - PATCH endpoint
- `src/services/files/rename.ts` - Renommage VPS

#### 2.2 Génération de Vignettes
```
Statut: À FAIRE
Priorité: MOYENNE
Effort: 1-2 jours
```
- [ ] Extraction frame vidéo (FFmpeg)
- [ ] Upload image custom
- [ ] Éditeur de vignette (canvas)
  - Ajout texte (titre, sous-titre)
  - Positionnement drag & drop
  - Styles de texte (font, couleur, ombre)
- [ ] Export PNG/JPG
- [ ] Stockage et association au clip

**Fichiers à créer:**
- `src/components/thumbnail/ThumbnailEditor.tsx`
- `src/components/thumbnail/TextOverlay.tsx`
- `app/api/thumbnail/generate/route.ts`
- `app/api/thumbnail/extract-frame/route.ts`
- `src/services/ffmpeg/thumbnail.ts`

---

### PHASE 3: IA Content Generation (Priorité HAUTE)

#### 3.1 Génération Titre/Description/Hashtags
```
Statut: À FAIRE
Priorité: HAUTE
Effort: 1 jour
```
- [ ] Intégration DeepSeek API (ou Groq si suffisant)
- [ ] Prompt optimisé par plateforme (TikTok, YouTube, LinkedIn, Instagram)
- [ ] UI dans ExportModal ou nouveau panel
- [ ] Génération basée sur la transcription
- [ ] Édition manuelle après génération
- [ ] Sauvegarde dans Post

**Fichiers à créer:**
- `src/services/ai/content-generator.ts`
- `src/components/editor/ContentGeneratorPanel.tsx`
- `app/api/ai/generate-content/route.ts`

**Prompts par plateforme:**
```
TikTok: Titre accrocheur court, hashtags trending, description avec CTA
YouTube: Titre SEO, description longue avec timestamps, tags
LinkedIn: Ton professionnel, hashtags B2B, description engageante
Instagram: Titre court, hashtags mixtes (niche + popular), caption story
```

#### 3.2 Configuration API DeepSeek
```
Statut: À FAIRE
Priorité: MOYENNE
Effort: 0.5 jour
```
- [ ] Ajouter DEEPSEEK_API_KEY dans .env
- [ ] Service client DeepSeek
- [ ] Fallback Groq si DeepSeek indisponible

**Fichiers à créer:**
- `src/services/ai/deepseek.ts`
- `src/lib/ai-client.ts` - Client unifié

---

### PHASE 4: Module Publication (Priorité MOYENNE)

#### 4.1 Interface Posts
```
Statut: À FAIRE
Priorité: MOYENNE
Effort: 2 jours
```
- [ ] Page `/posts` - Liste des posts
- [ ] Page `/posts/new` - Création
- [ ] Page `/posts/[id]` - Édition
- [ ] Formulaire multi-plateforme
- [ ] Association clip/export
- [ ] Planification

**Fichiers à créer:**
- `app/(dashboard)/posts/page.tsx`
- `app/(dashboard)/posts/new/page.tsx`
- `app/(dashboard)/posts/[id]/page.tsx`
- `src/components/posts/PostForm.tsx`
- `src/components/posts/PostList.tsx`
- `app/api/posts/route.ts`
- `app/api/posts/[id]/route.ts`

#### 4.2 Intégrations Social Media (Future)
```
Statut: PLANIFIÉ
Priorité: BASSE (Phase future)
```
- [ ] TikTok API
- [ ] LinkedIn API
- [ ] YouTube API
- [ ] Instagram API

---

### PHASE 5: Infrastructure & Déploiement

#### 5.1 Configuration studio.shinkofa.com
```
Statut: À FAIRE
Priorité: HAUTE
Effort: 0.5 jour
```
- [ ] Vérifier DNS A record → IP VPS
- [ ] Configurer Nginx reverse proxy
- [ ] SSL avec Certbot (Let's Encrypt)
- [ ] PM2 pour process management
- [ ] Variables d'environnement production

**Configuration Nginx:**
```nginx
server {
    server_name studio.shinkofa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5.2 Authentification
```
Statut: À FAIRE
Priorité: HAUTE
Effort: 1 jour
```
- [ ] Activer NextAuth.js
- [ ] Page login/register
- [ ] Protection middleware
- [ ] Gestion rôles (CREATOR, EDITOR, ADMIN)

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

### Sprint 1: Core Features (3-4 jours)
1. [ ] 1.1 Dictionnaire de Transcription
2. [ ] 1.2 Style des Sous-titres
3. [ ] 2.1 Édition Métadonnées Fichiers
4. [ ] 1.3 Thème Clair/Sombre

### Sprint 2: IA & Vignettes (2-3 jours)
5. [ ] 3.1 Génération Titre/Description/Hashtags
6. [ ] 3.2 Configuration DeepSeek
7. [ ] 2.2 Génération de Vignettes

### Sprint 3: Publication & Deploy (2-3 jours)
8. [ ] 5.1 Configuration studio.shinkofa.com
9. [ ] 5.2 Authentification
10. [ ] 4.1 Interface Posts

### Sprint 4: Polish & Intégrations (Future)
11. [ ] 4.2 Intégrations Social Media
12. [ ] Dashboard Analytics
13. [ ] Optimisations performance

---

## NOTES TECHNIQUES

### APIs Externes
| Service | Usage | Clé Env |
|---------|-------|---------|
| Groq | Transcription Whisper v3 | `GROQ_API_KEY` |
| DeepSeek | Génération contenu IA | `DEEPSEEK_API_KEY` |
| O2Switch | CDN FTP | `FTP_HOST`, `FTP_USER`, `FTP_PASS` |

### Structure Base de Données (à ajouter)
```prisma
model TranscriptionDictionary {
  id          String   @id @default(cuid())
  userId      String
  term        String
  replacement String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, term])
}
```

### Dépendances à Ajouter
```bash
npm install next-themes          # Thème clair/sombre
npm install @deepseek/sdk        # IA (si SDK existe, sinon fetch)
npm install fabric               # Canvas pour vignettes (optionnel)
```

---

## CHANGELOG

### v2.0.0 (2025-01-25)
- Timeline multi-segments avec blade tool
- Auto-cut silences
- Audio mixing (musique + fréquences)
- Audio preview temps réel
- Export multi-format

### v3.0.0 (En cours)
- Dictionnaire transcription
- Style sous-titres
- Thème clair/sombre
- Édition métadonnées media
- Génération vignettes
- IA content generation
- Déploiement studio.shinkofa.com
