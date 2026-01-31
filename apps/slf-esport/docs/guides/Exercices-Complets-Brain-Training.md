# Exercices Complets - Brain Training pour SLF Esport

**Total:** 11 exercices cognitifs et gaming
**Source:** Package @theermite/brain-training
**Date:** 31 décembre 2025

---

## 📊 Vue d'Ensemble

### Par Catégorie

| Catégorie | Nombre | Exercices |
|-----------|--------|-----------|
| **Mémoire** | 4 | Memory Cards, Pattern Recall, Sequence Memory, Image Pairs |
| **Réflexes & Attention** | 3 | Reaction Time, Peripheral Vision, MultiTask |
| **Gaming MOBA (HOK)** | 3 | Last Hit Trainer, Dodge Master, Skillshot Trainer |
| **Bien-être** | 1 | Breathing Exercise |

---

## 🧠 EXERCICES DE MÉMOIRE

### 1. Memory Card Game 🎴
**Fichier:** `MemoryCardGame.tsx`
**Description:** Jeu de mémoire classique - retourner des paires de cartes identiques
**Type:** Mémoire visuelle

**Caractéristiques:**
- Grille configurable (2x2 à 6x6)
- Emojis ou images personnalisées
- Timer et compteur de coups
- Score basé sur temps + précision

**Config:**
```typescript
{
  grid_rows: 4,
  grid_cols: 4,
  time_weight: 0.5,
  accuracy_weight: 0.5
}
```

**Niveaux:**
- Easy: 4x2 (4 paires)
- Medium: 4x4 (8 paires)
- Hard: 6x4 (12 paires)

---

### 2. Pattern Recall 🎨
**Fichier:** `PatternRecall.tsx`
**Description:** Mémoriser et reproduire un motif de couleurs
**Type:** Mémoire visuelle + spatiale

**Caractéristiques:**
- Grille de carrés colorés
- Phase de mémorisation (3-10 secondes)
- Phase de reproduction
- Feedback immédiat sur les erreurs

**Config:**
```typescript
{
  grid_rows: 3,
  grid_cols: 3,
  colors: ['#3CB371', '#FF9800', '#FFD600', '#E53935', '#8E24AA'],
  preview_duration_ms: 3000
}
```

**Niveaux:**
- Easy: 3x3, 5 couleurs, 5s preview
- Medium: 4x4, 6 couleurs, 3s preview
- Hard: 5x5, 8 couleurs, 2s preview

---

### 3. Sequence Memory 🔢
**Fichier:** `SequenceMemory.tsx`
**Description:** Mémoriser et reproduire une séquence (type Simon)
**Type:** Mémoire séquentielle

**Caractéristiques:**
- Grille de carrés qui s'illuminent
- Séquence croissante (niveau 1 = 3 steps, +1 par niveau)
- Vitesse d'affichage configurable
- Game over si erreur

**Config:**
```typescript
{
  grid_rows: 3,
  grid_cols: 3,
  initial_sequence_length: 3,
  max_sequence_length: 15,
  preview_duration_ms: 500
}
```

**Niveaux:**
- Easy: Start 3, max 10, 800ms/step
- Medium: Start 4, max 15, 500ms/step
- Hard: Start 5, max 20, 300ms/step

---

### 4. Image Pairs 🖼️
**Fichier:** `ImagePairs.tsx`
**Description:** Associer des paires d'images contextuelles (question/réponse)
**Type:** Mémoire associative

**Caractéristiques:**
- Paires contextuelles (ex: drapeau → pays)
- Images personnalisables
- Timer optionnel
- Score basé sur temps + précision

**Config:**
```typescript
{
  grid_rows: 4,
  grid_cols: 4,
  time_limit_ms: 180000, // 3 minutes
  pairs: [
    { left: 'question.png', right: 'answer.png' }
  ]
}
```

**Thèmes possibles:**
- Champions HOK → Rôles
- Items → Effets
- Maps → Objectifs

---

## ⚡ EXERCICES DE RÉFLEXES & ATTENTION

### 5. Reaction Time ⏱️
**Fichier:** `ReactionTime.tsx`
**Description:** Mesurer et améliorer le temps de réaction
**Type:** Réflexes

**Caractéristiques:**
- Bouton rouge → attendre → bouton vert → clic!
- 5 tentatives par défaut
- Statistiques détaillées (moyenne, meilleur, pire, consistance)
- Pénalité si clic trop tôt

**Config:**
```typescript
{
  totalAttempts: 5,
  difficulty: 'medium' // easy/medium/hard
}
```

**Difficultés:**
- Easy: Délai 2-5s
- Medium: Délai 1.5-4s
- Hard: Délai 1-3s

**Métriques:**
- Temps moyen
- Meilleur temps
- Consistance (écart-type)
- Clics anticipés

---

### 6. Peripheral Vision 👁️
**Fichier:** `PeripheralVision.tsx`
**Description:** Entraîner la vision périphérique
**Type:** Attention visuelle périphérique

**Caractéristiques:**
- Point central de fixation
- Cibles apparaissent aléatoirement en périphérie
- Cliquer sans bouger les yeux du centre
- Zones de difficulté (proche/moyen/loin du centre)

**Config:**
```typescript
{
  duration: 60, // secondes
  targetCount: 30,
  minDistance: 100, // pixels du centre
  maxDistance: 400,
  targetDuration: 2000 // ms avant disparition
}
```

**Niveaux:**
- Easy: Cibles proches (100-200px), durée 3s
- Medium: Cibles moyennes (150-300px), durée 2s
- Hard: Cibles lointaines (200-400px), durée 1.5s

**Métriques:**
- Hits périphériques
- Misses
- Précision
- Temps de réaction moyen

---

### 7. MultiTask 🎯
**Fichier:** `MultiTask.tsx`
**Description:** Gérer plusieurs tâches simultanément
**Type:** Multitasking cognitif

**Caractéristiques:**
- 2-4 tâches simultanées:
  - Compter des objets spécifiques
  - Cliquer des cibles
  - Mémoriser une séquence
  - Répondre à des questions
- Score par tâche + score global
- Progression de difficulté

**Config:**
```typescript
{
  duration: 90, // secondes
  simultaneousTasks: 2, // 2-4
  taskTypes: ['counting', 'clicking', 'memory', 'questions']
}
```

**Niveaux:**
- Easy: 2 tâches, lent
- Medium: 3 tâches, normal
- Hard: 4 tâches, rapide

**Métriques:**
- Score par tâche
- Score global
- Efficacité multitâche
- Erreurs par tâche

---

## 🎮 EXERCICES GAMING MOBA (Honor of Kings)

### 8. Last Hit Trainer 💰
**Fichier:** `LastHitTrainer.tsx`
**Description:** Entraînement farming (last hit des creeps)
**Type:** Timing + Précision

**Caractéristiques:**
- Simulation creeps avec barres de vie
- Champion mêlée ou distance au choix
- Ennemis qui attaquent aussi les creeps
- Stats: CS, gold, accuracy, perfect hits, combo

**Mécaniques HOK:**
- Vitesse d'attaque réaliste
- Timing du dernier coup
- Compétition avec adversaire IA
- Système de combo

**Config:**
```typescript
{
  duration: 120, // secondes
  difficulty: 'medium', // easy/medium/hard/survival
  championType: 'melee' // melee/ranged
}
```

**Niveaux:**
- Easy: Creeps lents, adversaire faible
- Medium: Creeps normaux, adversaire moyen
- Hard: Creeps rapides, adversaire fort
- Survival: Infini, difficulté croissante

**Métriques:**
- CS (Creep Score)
- Gold total
- Perfect hits
- Combo maximum
- Accuracy %
- Creeps manqués

---

### 9. Dodge Master 🏃
**Fichier:** `DodgeMaster.tsx`
**Description:** Esquive de projectiles avec joystick virtuel
**Type:** Mobilité + Réflexes

**Caractéristiques:**
- Joystick virtuel (gauche de l'écran)
- Projectiles avec patterns variés:
  - Targeted (vers le joueur)
  - Wave (vagues)
  - Circle (cercles)
  - Cross (croix)
  - Random
- Mode landscape (16:9) comme HOK
- Zone de jeu restreinte (comme MOBA)

**Mécaniques HOK:**
- Contrôle joystick fluide
- Hitbox précise
- Patterns de compétences ennemies
- Mode survival progressif

**Config:**
```typescript
{
  duration: 60, // secondes
  difficulty: 'medium', // easy/medium/hard/survival
  patterns: ['targeted', 'wave', 'circle']
}
```

**Niveaux:**
- Easy: Projectiles lents, peu nombreux
- Medium: Projectiles normaux
- Hard: Projectiles rapides, nombreux
- Survival: Infini, difficulté progressive

**Métriques:**
- Esquives réussies
- Temps de survie
- Projectiles évités
- Niveau de survie atteint
- Précision de déplacement

---

### 10. Skillshot Trainer 🎯
**Fichier:** `SkillshotTrainer.tsx`
**Description:** Visée de compétences (skillshots) MOBA
**Type:** Précision + Prédiction

**Caractéristiques:**
- Joystick virtuel (gauche) + 3 boutons de compétences (droite)
- 3 types de skillshots:
  - **Line** (ligne droite, ex: Lux Q)
  - **Circle** (cercle à distance, ex: Ziggs Q)
  - **Cone** (cône, ex: Annie W)
- Cibles mobiles avec patterns
- Système de combo
- Mode landscape (16:9) comme HOK

**Mécaniques HOK:**
- Contrôles tactiles optimisés
- Indicateurs de visée
- Cooldowns de compétences
- Smart targeting

**Config:**
```typescript
{
  duration: 90, // secondes
  difficulty: 'medium',
  skillshotTypes: ['line', 'circle', 'cone']
}
```

**Cooldowns:**
- Line: 0.8s
- Circle: 1.2s
- Cone: 1.5s

**Niveaux:**
- Easy: Cibles lentes, grandes
- Medium: Cibles normales
- Hard: Cibles rapides, petites
- Survival: Infini, difficulté croissante

**Métriques:**
- Hits
- Misses
- Accuracy %
- Combo actuel
- Combo maximum
- Temps de survie

---

## 🧘 EXERCICE DE BIEN-ÊTRE

### 11. Breathing Exercise 🌬️
**Fichier:** `BreathingExercise.tsx`
**Description:** Exercices de respiration guidée avec audio
**Type:** Relaxation + Gestion du stress

**Caractéristiques:**
- 3 patterns de respiration:
  - **Cohérence Cardiaque** (5s inhale / 5s exhale) - 432 Hz
  - **Relaxation 4-7-8** (4s inhale / 7s hold / 8s exhale) - 396 Hz
  - **Énergisant Box** (4s inhale / 4s hold / 4s exhale / 4s hold) - 528 Hz
- Animation visuelle de cercle
- Fréquences audio thérapeutiques
- Mode avec/sans son

**Config:**
```typescript
{
  pattern: 'cardiac_coherence', // cardiac/relaxation/energizing
  duration_minutes: 5,
  enableSound: true,
  audioFrequency: 432 // Hz
}
```

**Patterns:**
1. **Cohérence Cardiaque** (5-5)
   - Équilibre système nerveux
   - 432 Hz (fréquence naturelle)
   - Recommandé: 5 minutes, 3x/jour

2. **Relaxation 4-7-8** (4-7-8)
   - Réduction stress/anxiété
   - 396 Hz (libération peur)
   - Recommandé: 3-4 cycles avant match

3. **Énergisant Box** (4-4-4-4)
   - Boost concentration
   - 528 Hz (réparation ADN)
   - Recommandé: avant entraînement

**Métriques:**
- Cycles complétés
- Durée totale
- Cohérence (suivi du rythme)
- Fréquence cardiaque (si capteur dispo)

---

## 🎨 Adaptation Charte SLF

### Thème Custom SLF

```typescript
{
  variant: 'slf',
  colors: {
    primary: 'bg-primary-900',        // #004225 Vert SLF
    accent: 'bg-secondary-500',       // #FF9800 Orange SLF
    success: 'bg-success-500',        // #3CB371 Vert clair
    warning: 'bg-accent-500',         // #FFD600 Jaune
    error: 'bg-danger-500',           // #E53935 Rouge
    background: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white'
  },
  borderRadius: 'xl',
  shadows: 'xl'
}
```

---

## 📱 Optimisations Mobile

### Exercices MOBA (8, 9, 10)
- **Format:** Landscape 16:9 (1280x720)
- **Contrôles:** Joystick virtuel + boutons tactiles
- **Fullscreen:** Mode plein écran disponible
- **Performance:** 60 FPS, Canvas optimisé
- **Touch:** Multi-touch support

### Autres Exercices
- **Format:** Portrait ou carré adaptatif
- **Contrôles:** Touch/Click hybride
- **Responsive:** S/M/L/XL breakpoints
- **Gestures:** Swipe, tap, hold

---

## 🗄️ Intégration Backend

### Enum Types (backend/app/models/memory_exercise.py)

```python
class MemoryExerciseType(str, PyEnum):
    # Mémoire
    MEMORY_CARDS = "MEMORY_CARDS"
    PATTERN_RECALL = "PATTERN_RECALL"
    SEQUENCE_MEMORY = "SEQUENCE_MEMORY"
    IMAGE_PAIRS = "IMAGE_PAIRS"

    # Réflexes & Attention
    REACTION_TIME = "REACTION_TIME"
    PERIPHERAL_VISION = "PERIPHERAL_VISION"
    MULTITASK = "MULTITASK"

    # Gaming MOBA
    LAST_HIT_TRAINER = "LAST_HIT_TRAINER"
    DODGE_MASTER = "DODGE_MASTER"
    SKILLSHOT_TRAINER = "SKILLSHOT_TRAINER"

    # Bien-être
    BREATHING = "BREATHING"
```

### Scoring Par Type

| Type | Formule Score |
|------|---------------|
| Memory Cards | `(accuracy * 0.5 + time_efficiency * 0.5) * 100` |
| Pattern Recall | `(correct_cells / total_cells) * 100` |
| Sequence Memory | `level_reached * 10 + bonus` |
| Image Pairs | `(accuracy * 0.6 + time_efficiency * 0.4) * 100` |
| Reaction Time | `(1000 / avg_reaction_ms) * 100` (capped 100) |
| Peripheral Vision | `(hits / total_targets) * 100` |
| MultiTask | `avg_task_score` |
| Last Hit Trainer | `(cs * 10) + (accuracy * 0.3) + (combo_bonus)` |
| Dodge Master | `(time_alive / duration) * 100 + dodge_bonus` |
| Skillshot Trainer | `(accuracy * 0.7 + combo * 0.3) * 100` |
| Breathing | `(cycles_completed / target_cycles) * 100` |

---

## 📊 Catégorisation & Navigation

### Structure Menu

```
Exercices Cognitifs
├── 🧠 Mémoire
│   ├── Memory Cards
│   ├── Pattern Recall
│   ├── Sequence Memory
│   └── Image Pairs
│
├── ⚡ Réflexes & Attention
│   ├── Reaction Time
│   ├── Peripheral Vision
│   └── MultiTask
│
├── 🎮 Gaming MOBA
│   ├── Last Hit Trainer
│   ├── Dodge Master
│   └── Skillshot Trainer
│
└── 🧘 Bien-être
    └── Breathing Exercise
```

---

## 🎯 Priorités d'Implémentation

### Phase 1 - MVP (3-4 jours)
1. ✅ Installer package brain-training
2. ✅ Créer thème SLF
3. ✅ Créer architecture modulaire (registry)
4. ✅ Intégrer backend (enums + scoring)
5. ✅ Implémenter 3 exercices prioritaires:
   - Memory Cards (mémoire de base)
   - Reaction Time (réflexes)
   - Last Hit Trainer (MOBA)
6. ✅ Page principale avec grid
7. ✅ Statistiques basiques

### Phase 2 - Complet (1 semaine)
1. Implémenter les 8 exercices restants
2. Dashboard statistiques avancé
3. Système de recommandations
4. Miniatures personnalisées

### Phase 3 - Avancé (2 semaines)
1. Intégration coaching (assignment)
2. Leaderboards par exercice
3. Progression & achievements
4. Mode compétition équipe

---

## 📝 Documentation Utilisateur

### Guides à Créer

1. **Guide Général** - "Comment utiliser les exercices"
2. **Guide Mémoire** - "Améliorer ta mémoire avec SLF"
3. **Guide Gaming** - "Maîtriser les mécaniques MOBA"
4. **Guide Bien-être** - "Gérer le stress pré-match"
5. **Guide Coach** - "Assigner des exercices ciblés"

---

🤖 Document généré par TAKUMI
📅 31 décembre 2025
🎯 SLF Esport - La Salade de Fruits
