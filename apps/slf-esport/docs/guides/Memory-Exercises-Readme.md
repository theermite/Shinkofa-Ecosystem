# Système d'Exercices de Mémoire Visuelle

## 📋 Vue d'ensemble

Système complet d'exercices de mémoire visuelle intégré à la plateforme SLF E-Sport, optimisé pour mobile et desktop.

### ✨ Fonctionnalités

- **4 types d'exercices interactifs** : Memory Cards, Pattern Recall, Sequence Memory, Image Pairs
- **Design mobile-first** : Interface tactile optimisée, gestures, responsive layouts
- **Système de scoring automatique** : Calcul intelligent basé sur précision, vitesse et difficulté
- **Sauvegarde auto en temps réel** : Progression sauvegardée automatiquement toutes les 5 secondes
- **4 niveaux de difficulté** : Easy, Medium, Hard, Expert avec configurations préchargées
- **Statistiques complètes** : Historique, progression, leaderboards
- **Type-safe** : TypeScript complet pour backend et frontend

---

## 🎮 Types d'exercices

### 1. Memory Card Game (Jeu de paires)
**Objectif** : Trouver toutes les paires de cartes identiques

**Configurations** :
- **Facile** : Grille 4x4 (8 paires)
- **Moyen** : Grille 6x6 (18 paires)
- **Difficile** : Grille 8x8 (32 paires)

**Métriques** :
- Nombre de coups
- Temps écoulé
- Précision (coups corrects / total coups)

### 2. Pattern Recall (Mémorisation de motifs)
**Objectif** : Mémoriser et reproduire un motif de couleurs

**Configurations** :
- **Facile** : Grille 3x3, 4 couleurs, 3s de mémorisation
- **Moyen** : Grille 4x4, 6 couleurs, 4s de mémorisation
- **Difficile** : Grille 6x6, 8 couleurs, 5s de mémorisation

**Métriques** :
- Cellules correctes / total cellules
- Temps de reproduction
- Précision globale

### 3. Sequence Memory (Séquence style Simon)
**Objectif** : Mémoriser et reproduire des séquences de plus en plus longues

**Configurations** :
- **Facile** : Début 3, max 20, grille 3x3
- **Moyen** : Début 4, max 30, grille 4x4
- **Difficile** : Début 5, max 50, grille 5x5

**Métriques** :
- Longueur maximale de séquence atteinte
- Nombre de vies restantes
- Précision des reproductions

### 4. Image Pairs (Associations d'images gaming)
**Objectif** : Associer des paires d'images liées (compétences, items, stats)

**Configurations** :
- **Facile** : 4x4 (8 paires thématiques)
- **Moyen** : 6x6 (18 paires thématiques)
- **Difficile** : 8x8 (32 paires thématiques)

**Métriques** :
- Essais corrects / total essais
- Temps pour compléter
- Précision

---

## 🏗️ Architecture technique

### Backend (FastAPI + PostgreSQL)

#### Modèles
```
MemoryExerciseSession
├── user_id (FK)
├── exercise_id (FK)
├── exercise_type (ENUM)
├── difficulty (ENUM)
├── config (JSONB)
├── performance metrics (moves, time, accuracy)
├── final_score (auto-calculated)
└── score_breakdown (JSONB)
```

#### Endpoints API
```
POST   /api/v1/memory-exercises/sessions              # Créer session
PUT    /api/v1/memory-exercises/sessions/{id}         # MAJ session
GET    /api/v1/memory-exercises/sessions/{id}         # Récup session
GET    /api/v1/memory-exercises/sessions/me/history   # Historique user
GET    /api/v1/memory-exercises/leaderboard/{id}      # Leaderboard
GET    /api/v1/memory-exercises/stats/me              # Stats user
GET    /api/v1/memory-exercises/presets/{type}        # Presets config
```

#### Calcul du score
```python
base_score = (accuracy_score * accuracy_weight) + (time_score * time_weight)
sequence_bonus = min(20, max_sequence * 2)  # Pour Sequence Memory
difficulty_multiplier = {easy: 1.0, medium: 1.2, hard: 1.5, expert: 2.0}
final_score = (base_score + bonus) * multiplier
```

### Frontend (React + TypeScript)

#### Composants
```
MemoryExercisePlayer (wrapper principal)
├── MemoryCardGame
├── PatternRecall
├── SequenceMemory
└── ImagePairs
```

#### Flux de données
```
1. Chargement presets (GET /presets/{type})
2. Sélection difficulté
3. Création session (POST /sessions)
4. Jeu actif
   ├── Auto-save toutes les 5s (PUT /sessions/{id})
   └── Progress callbacks
5. Completion
   ├── Sauvegarde finale (PUT /sessions/{id} avec completed_at)
   └── Affichage score
```

#### Optimisations mobile
- Touch events optimisés (`touch-manipulation`)
- Responsive grid avec `aspect-ratio`
- Active states pour feedback tactile (`:active:scale-95`)
- Boutons minimum 50x50px (recommandation UX mobile)
- Font sizes adaptatifs (`text-base sm:text-xl`)

---

## 🚀 Installation & Déploiement

### 1. Appliquer la migration SQL
```bash
cd /home/ubuntu/SLF-Esport
psql -h localhost -U your_user -d slf_esport -f migrations/004_add_memory_exercise_sessions.sql
```

### 2. Redémarrer le backend
```bash
docker-compose restart backend
```

### 3. Rebuild frontend (si nécessaire)
```bash
cd frontend
npm run build
```

### 4. Vérifier que les exercices sont créés
```bash
# Via API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8001/api/v1/exercises?category=memoire

# Devrait retourner 4 exercices de mémoire
```

---

## 📱 Utilisation

### Depuis l'interface utilisateur

1. **Naviguer vers la page Exercices**
   - Menu : `Exercices` ou `/exercises`

2. **Filtrer par catégorie "Mémoire"**
   - Voir les 4 exercices de mémoire visuelle

3. **Cliquer sur un exercice**
   - Route : `/games/memory/{exerciseId}`

4. **Choisir la difficulté**
   - Easy, Medium, Hard, ou Expert

5. **Jouer !**
   - Le jeu s'affiche full-screen
   - Stats en temps réel en haut
   - Auto-save automatique

6. **Voir les résultats**
   - Score final affiché
   - Options : Rejouer, Retour, Voir stats

### Depuis le dashboard joueur

- Voir les exercices assignés par le coach
- Consulter les statistiques globales
- Accéder aux leaderboards

---

## 📊 Statistiques disponibles

### Par exercice
- **Total tentatives** : Nombre de sessions jouées
- **Meilleur score** : Score maximum atteint
- **Précision moyenne** : % de coups corrects
- **Temps le plus rapide** : Meilleure performance temporelle
- **Séquence maximale** : Pour Sequence Memory
- **Taux d'amélioration** : % progression sur les 10 dernières sessions

### Globales
- Historique complet des sessions
- Graphiques de progression
- Comparaison avec d'autres joueurs
- Classements par difficulté

---

## 🧪 Tests

### Backend
```bash
cd backend
pytest tests/test_memory_exercises.py -v --cov=app/services/memory_exercise_service --cov-report=html
```

### Frontend
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

---

## 🔧 Configuration avancée

### Personnaliser les presets

Modifier dans `backend/app/routes/memory_exercises.py` :

```python
@router.get("/presets/{exercise_type}")
async def get_config_presets(exercise_type: MemoryExerciseType):
    presets = {
        MemoryExerciseType.MEMORY_CARDS: [
            {
                "name": "Custom Difficulty",
                "difficulty": DifficultyLevel.EXPERT,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.MEMORY_CARDS,
                    difficulty=DifficultyLevel.EXPERT,
                    grid_rows=10,  # Personnalisé !
                    grid_cols=10,
                    time_limit_ms=600000,
                    time_weight=0.6,
                    accuracy_weight=0.4
                ).model_dump()
            }
        ]
    }
```

### Ajouter de nouvelles images/emojis

Dans `frontend/src/components/games/memory/MemoryCardGame.tsx` :

```typescript
const EMOJI_SETS = {
  gaming: ['🎮', '🕹️', ...],  // Actuel
  custom: ['🚀', '🌟', ...],   // Nouveau set
}
```

Dans `frontend/src/components/games/memory/ImagePairs.tsx` :

```typescript
const MOBA_PAIRS = [
  { question: '⚔️', answer: '🗡️', label: 'Arme' },
  // Ajouter plus de paires
]
```

---

## 🐛 Troubleshooting

### Exercices ne s'affichent pas
```bash
# Vérifier que les exercices existent en base
psql -d slf_esport -c "SELECT * FROM exercises WHERE category='memoire';"

# Si vide, réappliquer la migration SQL
```

### Score non sauvegardé
```bash
# Vérifier les logs backend
docker-compose logs backend | grep memory_exercises

# Vérifier que la table existe
psql -d slf_esport -c "\d memory_exercise_sessions"
```

### Erreur TypeScript frontend
```bash
# Rebuilder les types
cd frontend
npm run type-check

# Recompiler
npm run dev
```

---

## 📈 Améliorations futures

- [ ] Ajouter images réelles (champions, items) au lieu d'emojis
- [ ] Mode multijoueur compétitif
- [ ] Achievements et badges
- [ ] Entraînement personnalisé basé sur performances
- [ ] Export des statistiques en PDF
- [ ] Mode hors-ligne (PWA)
- [ ] Animations et sons améliorés
- [ ] Support langues multiples

---

## 📝 Crédits

**Développé par** : TAKUMI Agent (Jay The Ermite)
**Projet** : SLF E-Sport Training Platform
**Date** : 27 décembre 2025
**Version** : 1.0.0

---

## 📄 Licence

Copyright © 2025 La Salade de Fruits - Tous droits réservés
