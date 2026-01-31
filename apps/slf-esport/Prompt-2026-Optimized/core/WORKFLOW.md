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

4. ⚠️ AVANT BUILD :
   → Déléguer à Build-Deploy-Test Agent
   → Vérifier checklist pré-build

5. ⚠️ AVANT COMMIT :
   → Déléguer à Code-Reviewer Agent
   → Review factuel, pas d'opinions

6. ⚠️ SI REFACTORING > 3 fichiers :
   → Déléguer à Refactor-Safe Agent
   → Petits pas, validation continue

7. Auto-review avant présentation
8. Checkpoint toutes les 30 min (tâche longue)
```

**Format Commit** : `[TYPE] description`
- FEAT, FIX, DOCS, REFACTOR, CHORE, TEST

**Recommandation Agents** : Je te suggère de ne pas bypass les agents. Ils sont là pour éviter les erreurs répétitives.

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

---

## Extended Thinking (Boost Performance)

> +39% de performance sur tâches de raisonnement complexe (AIME 2025)

### Quand Activer

| Type de Tâche | Thinking | Raison |
|---------------|----------|--------|
| Architecture système | ✅ Oui | Décisions multi-facteurs |
| Debug complexe | ✅ Oui | Analyse causale profonde |
| Refactoring > 5 fichiers | ✅ Oui | Impact croisé |
| Revue de code critique | ✅ Oui | Détection patterns subtils |
| Migration DB | ✅ Oui | Risques et rollback |
| Bug simple/typo | ❌ Non | Overhead inutile |
| Commit message | ❌ Non | Tâche triviale |
| Config/env | ❌ Non | Pas de raisonnement |

### Comment Déclencher

**Explicite** :
```
"Réfléchis étape par étape avant de proposer une solution"
"Analyse en profondeur avant de coder"
"Prends le temps de considérer toutes les implications"
```

**Implicite** (mots-clés que Claude détecte) :
- "complexe", "critique", "architecture"
- "migration", "refactoring majeur"
- "impact sur tout le système"

### Interleaved Thinking (Post-Tool)

Après chaque résultat d'outil, réfléchir avant d'agir :

```
1. Recevoir résultat outil (grep, read, etc.)
2. Réfléchir : "Que m'apprend ce résultat ?"
3. Planifier : "Quelle est la meilleure prochaine action ?"
4. Agir de manière informée
```

**Prompt suggéré** :
```
"Après chaque résultat d'outil, réfléchis à sa qualité et détermine
les prochaines étapes optimales avant de continuer."
```

### Multi-Context Window (Sessions Longues)

Pour tâches dépassant une session :

1. **Premier contexte** : Setup framework (tests, scripts)
2. **Contextes suivants** : Itération sur todo-list

**State Management** :
```json
// tests.json - État structuré
{
  "tests": [
    {"id": 1, "name": "auth_flow", "status": "passing"},
    {"id": 2, "name": "user_mgmt", "status": "failing"}
  ]
}
```

```text
// progress.txt - Notes libres
Session 3 progress:
- Fixed auth token validation
- Next: investigate user_mgmt test failures
```

**Git comme State Tracker** :
- Commit fréquents = checkpoints
- `git log` = historique des décisions
- Permet reprise avec contexte frais

---

## Parallel Tool Calling (Optimisation)

Claude 4.x excelle à l'exécution parallèle d'outils.

### Quand Paralléliser

```
✅ Lire 3 fichiers indépendants → 3 Read en parallèle
✅ Grep + Glob pour recherche → En parallèle
✅ Build + Lint indépendants → En parallèle

❌ Read puis Edit (dépendance) → Séquentiel
❌ Test puis Deploy (dépendance) → Séquentiel
```

### Boost Performance

```
"Si tu dois appeler plusieurs outils sans dépendances entre eux,
fais tous les appels en parallèle dans un seul message."
```

---

**Version** : 3.0.0 | **Mise à jour** : 2026-01-24 | **Nouveautés** : Extended Thinking, Multi-Context, Parallel Tools
