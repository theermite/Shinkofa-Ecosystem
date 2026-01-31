# Workflow Standard — Optimisé

> **Principe** : AUDIT → PLAN → VALIDATION → CODE → BILAN

---

## Phase 1 : AUDIT

```
1. Annoncer : "Je lis [fichiers] pour comprendre"
2. Scanner contexte (max 10 fichiers)
3. Identifier problèmes / dépendances
4. Poser questions clarification SI besoin
```

**Durée** : 5-10 min | **Output** : Compréhension du contexte

---

## Phase 2 : PLAN

```
1. Proposer 2-3 options avec trade-offs
2. Estimer effort + énergie requise
3. Lister fichiers à modifier
4. ANNONCER : "Je vais modifier X, Y, Z"
5. ATTENDRE GO de Jay
```

**Template** :
```markdown
## Options

### Option A (Recommandée)
[Description]
- ✅ Avantages
- ⚠️ Inconvénients
- Effort : [Bas/Moyen/Élevé]

### Option B
[...]

## Plan d'Action
1. [Étape 1]
2. [Étape 2]
...

**Fichiers touchés** : [liste]
**Énergie requise** : [Basse/Modérée/Haute]

Valides-tu ?
```

---

## Phase 3 : CODE

```
1. Implémenter par petites séries cohérentes
2. Commits atomiques et clairs
3. Tests si applicable
4. Auto-review avant présentation
5. Checkpoint toutes les 30 min (tâche longue)
```

**Format Commit** : `[TYPE] description`
- FEAT, FIX, DOCS, REFACTOR, CHORE, TEST

---

## Phase 4 : BILAN

```
✅ Quoi fait : 2-3 phrases
📝 Fichiers modifiés : liste
⚡ Impacts : changements, side-effects
🎯 Next steps : suite logique
❓ Questions ouvertes : à décider
```

---

## Adaptation Énergie

| Niveau | Durée Max | Type Tâches | Checkpoints |
|--------|-----------|-------------|-------------|
| **Basse (1-4)** | 45 min | Bugfix simple, config | 15 min |
| **Normale (5-7)** | 2-3h | Features, refactor | 30 min |
| **Haute (8-10)** | 4-8h | Architecture, migration | 1h |

---

## Situations Spéciales

### Énergie Basse
```
Jay : "Énergie basse, pas de grosse tâche"

Claude réagit :
✅ Propose que des bugfixes simples / config
✅ Réduit durée (30-45 min max)
✅ Minimise décisions (Claude décide, Jay valide)
✅ Pas de deep learning / architecting
✅ Checkpoint toutes les 15 min
✅ Reste léger et supportif
```

### Mode Laboratoire (Deep Work)
```
Jay : "En mode laboratoire"

Claude sait :
✅ Jay a l'énergie pour grosse tâche
✅ Contexte contrôlé, pas d'interruptions
✅ Peut être ambitieux
✅ Checkpoints moins fréquents (1h OK)
✅ Peut explorer options
✅ Support intense sur 4-8h
```

### Interruption / Pause
```
Jay : "Pause 1h" / "Reviens plus tard"

Claude :
✅ Sauvegarde l'état (/compact)
✅ Résume où on en est
✅ Lisse le code avant pause
✅ Prépare next steps clairs
✅ Attends Jay sans relancer
```

### Changement Direction
```
Jay : "Finalement, on fait autrement..."

Claude :
✅ Zéro frustration / blame
✅ Valide le besoin de refactor
✅ Propose nouveau plan
✅ Attends GO
✅ Pivote
```

---

## Types de Tâches

### Type A : Bugfix / Feature small
- Temps : 15-30 min
- Énergie : Basse
- Checkpoints : 1 (avant implémentation)

### Type B : Feature moyenne / Refactor
- Temps : 2-4h
- Énergie : Modérée
- Checkpoints : 3-4 (avant, milieu, fin)

### Type C : Architecture / Refactoring massive
- Temps : 1-5 jours
- Énergie : Haute
- Checkpoints : quotidien + fin de phase

---

## Phrases Types

**Clarification** :
```
"Avant de proposer, j'ai besoin de préciser [X].
Options : [A], [B], [C]. Quelle approche ?"
```

**Annonce plan** :
```
"Voici ce que je propose :
1. [étape 1]
2. [étape 2]
Temps estimé : [durée]
Énergie : [Basse/Modérée/Haute]
Valides-tu ?"
```

**Mid-task checkpoint** :
```
"On est à [point].
Avant de continuer, valides-tu la direction ?"
```

**Résumé livraison** :
```
"C'est fait. Voici ce qu'on a :
✅ [quoi]
📝 Fichiers : [liste]
🎯 Next : [étape suivante]
Questions ?"
```

---

## Communication

**À utiliser** :
- "Voici ce que je propose..."
- "Valides-tu ?"
- "Options : A, B, C. Laquelle ?"
- "C'est fait. Résumé : ..."

**À éviter** :
- "Tu dois..."
- "Il faut..."
- Agir sans annoncer
- Ignorer les hésitations

---

**Version** : 2.1.0 | Enrichi depuis Perplexity
