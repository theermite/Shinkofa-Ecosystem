---
title: Charte Graphique Shinkofa V2.0
tags: [charte, graphique, design, accessibilité, morphisme, wcag]
aliases: [Charte Graphique Shinkofa, Identité Visuelle, Design System Shinkofa]
version: 2.0
created: 2025-11-11
status: source-de-vérité
usage_principal: Standards design identité visuelle Shinkofa, accessibilité universelle, interface morphique adaptative
priorité_retrieval: HAUTE
token_budget: 1500-1800 tokens
encoding: UTF-8 sans BOM
concepts_clés: palette couleurs, typographies accessibilité, symboles, layout, components UI, WCAG 2.1 AAA
dépendances: MasterPlan-Shinkofa-V2.0, Mythologie-Shizen-V2.0, Charte-Graphique-Shinkofa.pdf
rag_rules: H2/H3 strict, chunking 512-768 tokens, tables design, accents aigus, wiki-links
---

# 🎨 Charte Graphique Shinkofa V2.0

## 1️⃣ Introduction Identité Visuelle

**Vision core**

Interface morphique adaptative respecte neurodiversité hypersensibilité de chacun. Accessibilité universelle priorité (WCAG 2.1 AAA vs standard AA minimum). Cohérence multi-plateformes desktop mobile tablet print sans compromis adaptation.

**Principes design**

- Minimalisme intentionnel (vs surcharge visuelle)
- Accessibilité première (vs feature-driven esthétique)
- Morphisme cognitif (vs one-size-fits-all)
- Inclusivité neurodivergence (vs design neurotypique)

---

## 2️⃣ Palette Couleurs Shinkofa

### Couleurs principales

| Nom | Code | Utilisation | Émotion |
|-----|------|-------------|---------|
| **Bleu Marine** | `#1c3049` | Fond principal, contrastes forts | Confiance, profondeur, stabilité |
| **Orange Chaleur** | `#e08f34` | Accents call-to-action, énergie | Chaleur, créativité, dynamisme |
| **Jaune Clarté** | `#f5cd3e` | Highlights important, éveil | Optimisme, clarté, illumination |
| **Blanc Respiration** | `#FFFFFF` | Espaces vides, breathing room | Pureté, espace, sérénité |

### Contrastes accessibilité WCAG 2.1 AAA

Tous rapports contraste **minimums 7:1 texte normal, 4.5:1 large** (vs WCAG AA minimum 4.5:1/3:1) :

- **Bleu Marine sur Blanc** : 12:1 ✅ (texte extrêmement lisible)
- **Orange sur Blanc** : 5.2:1 ✅ (lisible confortable)
- **Jaune sur Blanc** : 1.2:1 ❌ → **Jamais utiliser jaune texte**
- **Orange sur Bleu** : 7.1:1 ✅ (accents élégants)

### Modes adaptatifs accessibilité

**Mode Clair** (défaut)
- Fond blanc pur, texte bleu marine
- Accents orange/jaune modérés
- Typique écrans retro-éclairés jour

**Mode Sombre**
- Fond bleu marine très foncé (#0d1420), texte blanc/gris clair
- Accents orange élevés (moins agressifs nuit)
- Protection yeux hypersensibles écrans nocturne

**Mode Contraste Élevé**
- Fond noir pur texte blanc/jaune
- Bordures renforcées épaisseur 2-3px
- Élimination subtilités ombres dégradés
- WCAG AAA maximum accessibilité

**Mode Daltonien**
- Protanopie (rouge-vert absent) : Remplace rouge→ bleu, vert→ jaune
- Deutéranopie (rouge-vert différent) : Remplace rouge→ orange, vert→ bleu
- Tritanopie (bleu-jaune absent) : Remplace bleu→ rose, jaune→ gris
- Tests automatiques détection contrastes

---

## 3️⃣ Typographies Shinkofa

### Polices core

| Police | Usage | Caractéristiques |
|--------|-------|-----------------|
| **Romantic Harmony** | Titres headers branding | Élégance fluide, ligature ornée, confiance |
| **Atkinson Hyperlegible** | Corps texte UI légibilité | Dyslexie-friendly, glyphes distincts, lisibilité extrême |

### Hiérarchie typographique

**Desktop/Tablet**
- **H1** : Romantic Harmony 48px, interligne 1.2, #1c3049 bold
- **H2** : Romantic Harmony 36px, interligne 1.3, #1c3049 semibold
- **H3** : Romantic Harmony 24px, interligne 1.4, #1c3049 regular
- **Corps** : Atkinson Hyperlegible 16px, interligne 1.6, #1c3049 regular
- **Petit** : Atkinson Hyperlegible 14px, interligne 1.5, #666666 regular

**Mobile**
- Réduire 20% tous tailles (H1 38px, corps 13px)
- Augmenter interlignes 10-15% écrans petits

### Adaptations neurodivergence

**Dyslexie-optimisé**
- Polices sans-serif sans confusions (Atkinson séparation l/I/1)
- Interligne minimum 1.5x (vs standard 1.15x)
- Espacement lettres +0.05em (vs défaut 0em)
- Longueur lignes 60-80 caractères maximum (vs 120+ standard)

**TDAH-optimisé**
- Densité information réduite aérée
- Sectionnement hiérarchique clair
- Pas plus 3 niveaux imbrication profondeur
- Pas blocs texte denses (maximum 3-4 phrases paragraphe)

**Hypersensibilité-optimisé**
- Pas animations rapides (transition ≤ 300ms, keyframes douce)
- Pas GIF clignotants flashing
- Typographie stable zéro vibration glitch
- Espaces blancs généreux respiration

---

## 4️⃣ Symboles Iconographie Shinkofa

### Symboles core identité

| Symbole | Signification | Usage |
|---------|--------------|-------|
| **Enso (◯)** | Cercle zen infini incomplet | Wallpapers, headers majeurs, perfection imperfection |
| **S Stylisé (𝓢)** | Shinkofa signature fluide | Logo, favicons, signatures UI |
| **Dojo (⛩)** | Architecture temple dojo | Espaces dédiés meditation, centres physiques |

### Pictogrammes applications

**Style core**
- Line icons minimalistes 2px stroke weight
- Monochromes adaptatifs thème (clair/sombre synchro)
- Taille standard 24×24px (mobile), 32×32px (desktop)
- Accessible : Labels texte TOUJOURS systématique (jamais icônes seules)

**Exemple icônes**
- 🏃 Activité / Énergie (ligne ronde)
- 📚 Apprentissage / Connaissance (livre)
- ❤️ Bien-être / Somatique (cœur stylisé)
- 🧠 Pensée / Transcognition (profil cerveau)
- 🌙 Cycle / Rythme (croissant lune)

---

## 5️⃣ Layout Composition Système

### Grille système responsive

| Breakpoint | Colonnes | Gutters | Marges |
|-----------|----------|---------|--------|
| **Mobile** | 4 colonnes | 12px | 16px |
| **Tablet** | 8 colonnes | 16px | 24px |
| **Desktop** | 12 colonnes | 24px | 32px |

### Espaces respiration vertical

- **Intra-section** : 16px (mobile), 24px (tablet), 32px (desktop)
- **Inter-sections** : 48px (mobile), 64px (tablet), 96px (desktop)
- **Marges extérieures** : Identiques inter-sections

**Objectif** : Pas sensation étouffement, respiration constant espace blanc.

### Adaptations interface morphique

**Densité information variable**
- **Compacte** (utilisateurs expérimentés) : 16px espacements min, 2-3 colonnes contenu
- **Aérée** (TDAH défaut) : 24px espacements, 1-2 colonnes contenu max
- **Très aérée** (hypersensibilité) : 32px+ espacements, 1 colonne contenu, scrolling vertical fluide

**Animations accessibles**
- **Réduites** (hypersensibilité) : 0 animations, zéro transitions (instant)
- **Standard** (défaut) : Transitions 200-300ms ease-out, keyframes douces
- **Dynamiques** (neurotypique préférence) : Animations créatives 300-500ms, parallax subtile

---

## 6️⃣ Accessibilité UI Components

### Boutons Call-to-action

**Dimensions**
- Taille minimum 44×44px (WCAG touch-friendly mobile)
- Padding internal 12-16px (pas trop dense)
- Border-radius 8px (vs sharp corner)
- États visuels distincts : Default → Hover → Active → Disabled → Focus

**Accessible focus**
- Outline 3px contraste `#e08f34` visible keyboard navigation
- Focus-visible pseudo CSS (vs vieux outline bleu défaut)
- Label explicite bouton `aria-label="Envoyer message"` (pas icônes ambigus)

### Formulaires Inputs

**Structure accessible**
- Labels **externes visibles** (jamais placeholders seuls)
- Association `<label for="input-id">` HTML natif
- Validation inline temps réel feedback immédiat
- Messages erreur constructifs détail corrigible (pas "Erreur générique")

**Exemple input dyscalculie-friendly**
```html
<label for="age">Âge (20-65 ans)</label>
<input id="age" type="number" min="20" max="65" 
  aria-describedby="age-hint" />
<span id="age-hint">Doit être entre 20 et 65</span>
```

### Navigation

**Hiérarchie claire**
- Menu principal maximum 7 items (charge cognitive limite)
- Breadcrumbs visibles navigation hiérarchique `Home › Products › Widget`
- Skip links accessibilité lecteur écran `Skip to main content`
- Active state visuellement distinct current page

**Keyboard navigation**
- Tous éléments interactifs accessibles Tab
- Pas focus traps (pages non-fermées)
- Ordre navigation logique gauche→droite, haut→bas
- Enter/Space active boutons links

---

## 7️⃣ Standards RAG Optimisation

**Document structure**
- UTF-8 sans BOM encoding strict
- YAML frontmatter complet métadonnées
- Hiérarchie H2/H3 stricte (jamais H4+)
- Chunking 512-768 tokens sections H2
- Wiki-links [[]] références documentation

**Maintenance design system**
- Version control Git toutes modifications
- CHANGELOG publique changements visuels
- Audit WCAG annuel compliance certification
- Feedback utilisateur accessible intégration propositions

---

## 📋 Métadonnées document

| Propriété | Valeur |
|-----------|--------|
| **Version** | 2.0 |
| **Date mise à jour** | 2025-11-11 |
| **Status** | Source-de-vérité design system |
| **Token budget** | ~1500-1800 tokens |
| **Priorité retrieval** | HAUTE |
| **Format** | Obsidian-optimisé UTF-8 sans BOM |
| **Révision** | Semestrielle (évolution accessibilité standards) |
| **Philosophie core** | Accessibilité universelle WCAG 2.1 AAA. Interface morphique neurodivergence. Inclusivité hypersensibilité. Design système cohérent. |

---

**🎨 Charte Graphique Shinkofa V2.0. Palette couleurs, typographies dyslexie-friendly, symboles, layout réactif. Accessibilité WCAG 2.1 AAA universelle. Composants UI inclusifs. Morphisme cognitif adaptatif. Obsidian-natif RAG-optimisé.**