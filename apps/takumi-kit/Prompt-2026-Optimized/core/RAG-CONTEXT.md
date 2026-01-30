# Gestion Contexte & RAG — Règles Optimisées

> **Principe** : Charge minimale, impact maximal, mémoire persistante.

---

## Seuils d'Action (Automatiques)

| Contexte | Action | Trigger |
|----------|--------|---------|
| **< 40%** | ✅ Zone confort | Continuer normalement |
| **40-60%** | ⚠️ Attention | Éviter nouveaux chargements non essentiels |
| **60-75%** | 🟠 Compacter | `/compact` avant nouvelle tâche majeure |
| **> 75%** | 🔴 Critique | `/compact` obligatoire OU `/clear` si nouvelle tâche |

**Affichage recommandé** : `📊 Contexte: XXX,XXX / 200,000 tokens (XX% utilisé)`

---

## Hiérarchie de Chargement (Priorité)

```
PRIORITÉ 1 — TOUJOURS (~8KB)
├── core/Profil-Jay.md
├── core/Workflow.md
├── core/Rag-Context.md (ce fichier)
└── core/Agent-Behavior.md

PRIORITÉ 1.5 — AGENTS (auto-chargés si action déclencheur)
├── agents/Context-Guardian/AGENT.md   ← Début session, tracking env
├── agents/Build-Deploy-Test/AGENT.md  ← Si build/deploy
├── agents/Code-Reviewer/AGENT.md      ← Si commit
├── agents/Debug-Investigator/AGENT.md ← Si bug/erreur
├── agents/Refactor-Safe/AGENT.md      ← Si refactoring > 3 fichiers
├── agents/Security-Guardian/AGENT.md  ← Si deploy PROD
├── agents/Project-Bootstrap/AGENT.md  ← Si nouveau projet
├── agents/Project-Planner/AGENT.md    ← Si planification feature majeure
└── agents/Documentation-Generator/AGENT.md ← Si génération/sync docs

PRIORITÉ 2 — PROJET (~5KB)
├── .claude/CLAUDE.md du projet actif
└── .claude/session-state.md           ← État session (env, branche, énergie)

PRIORITÉ 3 — CONTEXTUEL (on-demand)
├── infrastructure/Lessons-Learned.md  ← SI tâche similaire déjà rencontrée
├── skills/[pertinent]/SKILL.md        ← SI tâche déclenche le skill
├── agents/Build-Deploy-Test/error-patterns.md ← SI debug erreur connue
└── infrastructure/Knowledge-Hub.md    ← SI navigation nécessaire

PRIORITÉ 4 — TECHNIQUE (on-demand)
├── quickrefs/dev/[pertinent].md       ← SI besoin référence
├── infrastructure/Vps-Ovh-Setup.md    ← SI deploy/infra
└── infrastructure/Projects-Registry.md ← SI multi-projet

PRIORITÉ 5 — CODE PROJET (lazy)
└── Fichiers sources un par un selon besoin
```

### Règle Agents

Les agents de PRIORITÉ 1.5 sont chargés **automatiquement** quand leur déclencheur est détecté :
- Mention "build", "deploy", "test" → Build-Deploy-Test
- Mention "commit", "push" → Code-Reviewer
- Erreur/bug détecté → Debug-Investigator
- Refactoring annoncé → Refactor-Safe
- Deploy PROD → Security-Guardian
- Nouveau projet → Project-Bootstrap
- Début session → Context-Guardian

### Skills Principaux (Points d'Entrée)

| Skill | Commande | Agent Associé |
|-------|----------|---------------|
| Pre-Commit | `/pre-commit` | Code-Reviewer |
| Deploy | `/deploy` | Build-Deploy-Test + Security-Guardian |
| Context | `/context` | Context-Guardian |
| Debug | `/debug` | Debug-Investigator |

### Handoff Inter-Agents

Voir `agents/AGENT-HANDOFF.md` pour le protocole formel de communication entre agents.

### Centralisation Erreurs

**Recommandation forte** : Je te propose de documenter toute erreur significative → `infrastructure/lessons/`
- Éviter de disperser dans les projets locaux
- Éviter les fichiers session
- Garder une source unique de vérité

---

## Consultation Recommandée Lessons-Learned

**Avant ces actions, je te propose de vérifier les lessons apprises** :

| Action | Rechercher |
|--------|------------|
| Migration DB | `[DB] [MIGRATION]` |
| Deploy prod | `[DEPLOY]` `[SSL]` |
| Mise à jour deps | `[DEPS] [BREAKING]` |
| Config Docker | `[DOCKER]` |
| Auth/JWT | `[AUTH]` |

**Pattern** :
```
Jay: "On va faire une migration Alembic"
Claude: [Consulte Lessons-Learned.md section DB]
        → "Attention, on a documenté un problème similaire: [leçon]"
```

---

## Mémoire Inter-Session

### Fichiers de Persistance

| Fichier | Usage | Emplacement |
|---------|-------|-------------|
| `PLAN-DEV-TEMPORAIRE.md` | État feature en cours | Racine projet |
| `/compact` output | Résumé session | Géré par Claude Code |
| `Lessons-Learned.md` | Erreurs/solutions | Ce dépôt (centralisé) |

### Reprise de Session
```
1. Lire PLAN-DEV-TEMPORAIRE.md si existe
2. git status pour voir état
3. Proposer: continuer OU nouveau plan
```

### Fin de Session
```
1. Mettre à jour PLAN-DEV-TEMPORAIRE.md
2. Commit si code stable
3. /compact pour résumé
4. Lister next steps
```

---

## Stratégie Subagents

### Quand Déléguer à Haiku
- Exploration > 20 fichiers
- Recherche pattern projet entier
- Tâche isolée sans contexte partagé
- Analyse comparative

### Pattern Économique
```
Main (Opus/Sonnet) : Décision, architecture
     ↓
Subagent (Haiku) : Exploration, recherche → Résumé 1.5K tokens max
     ↓
Main : Utilise résumé, contexte préservé < 40%
```

---

## Stratégie Sélection Modèles (Économie Crédits)

### Principe : Start Small, Scale Up

**Claude Max x5** : Crédits limités, Opus consomme 5x plus vite que Sonnet.

### Décision Automatique par Type de Tâche

#### Haiku (via Subagent uniquement)
- Exploration codebase >20 fichiers
- Recherche patterns multiples
- Listing/inventaire
- Tâches isolées sans décision architecturale

**Pattern** : Main agent délègue, reçoit résumé 1.5K tokens max

#### Sonnet (Défaut)
- Implémentation features guidées
- Bug fixes simples à modérés
- Refactoring <5 fichiers
- Tests unitaires
- Documentation
- 90% des tâches quotidiennes

#### Opus (Escalade seulement si)
- Architecture multi-composants (>5 fichiers)
- Migration base de données
- Refonte majeure système existant
- Debug complexe après échec Sonnet
- Décisions impactant l'ensemble du projet
- Jay demande explicitement

### Workflow d'Escalade

```
Début session → Sonnet
    ↓
Tâche révèle complexité > prévue ?
    ↓
Proposer à Jay : "Cette tâche semble nécessiter Opus (raison). Je bascule ?"
    ↓
Si oui → `/model opus` → Tâche → `/model sonnet` après
```

### Anti-Pattern
```
❌ Rester en Opus toute la session "au cas où"
❌ Utiliser Opus pour des tâches simples
❌ Ne jamais utiliser Haiku (délégation subagent)
```

### Métriques Cibles
- **Haiku** : 10-20% des opérations (via subagents)
- **Sonnet** : 70-80% du temps session
- **Opus** : 5-10% (tâches critiques uniquement)

---

## Règles d'Économie Tokens

| Situation | Action |
|-----------|--------|
| Début session | Core/ + CLAUDE.md uniquement |
| Relecture fichier | Résumer en notes, pas recharger |
| Gros fichier (>300 lignes) | Lire par sections |
| Exploration large | Déléguer à subagent |
| Tâche terminée | `/compact` si > 50% |

---

## MCP Tool Search

**Configuration** : `mcpToolSearchAutoEnable: "auto:15"`

- Lazy loading des outils MCP
- Économie : 134K → 5K tokens (96%)
- Auto quand outils > 15% du contexte

---

## Anti-Patterns

```
❌ Charger TOUS les fichiers au début
❌ Relire 10x le même fichier sans résumer
❌ Charger quickrefs philosophie pour bug technique
❌ Contexte > 60% avant d'implémenter
❌ Ignorer Lessons-Learned avant tâche risquée
❌ Pas sauvegarder état avant interruption
```

---

## Checklist Avant Chargement

- [ ] Vraiment nécessaire pour cette tâche ?
- [ ] Déjà chargé cette session ?
- [ ] Puis-je résumer au lieu de charger ?
- [ ] Subagent plus approprié ?
- [ ] Contexte actuel permet ? (< 60%)

---

## Métriques à Suivre

| Métrique | Cible | Comment |
|----------|-------|---------|
| Contexte moyen fin session | < 70% | `/status` |
| Recharges même fichier | 0-1 par fichier | Discipline |
| Consultations Lessons-Learned | 1+ par session risquée | Automatique |
| Compacts par session longue | 1-2 | Proactif |

---

---

## Techniques RAG Avancées (2025-2026)

### Adaptive RAG — Chargement Intelligent

**Principe** : Ne charger que ce qui est **nécessaire** pour la tâche courante.

| Signal | Action |
|--------|--------|
| Incertitude détectée | → Charger contexte supplémentaire |
| Tâche similaire passée | → Consulter Lessons-Learned d'abord |
| Question hors domaine | → Recherche web ou escalade |
| Information manquante | → Recherche corrective ciblée |

**Implémentation** :
```
1. Évaluer la tâche
2. Charger contexte minimum (Priorité 1)
3. SI incertitude → charger Priorité 2-3
4. SI toujours incertain → demander clarification
5. Éviter de charger "au cas où"
```

### Self-RAG — Auto-Vérification

**Principe** : Vérifier la qualité des réponses avant livraison.

```
AVANT de répondre à une question factuelle :
1. Générer réponse candidate
2. Self-check : "Cette réponse est-elle vérifiable ?"
3. SI non vérifiable → citer source ou avouer incertitude
4. SI vérifiable → livrer avec confiance calibrée
```

**Intégration Debug-Investigator** :
- Appliquer Self-RAG avant chaque hypothèse de debug
- Demander preuve pour chaque affirmation technique

### Corrective RAG — Recherche Additionnelle

**Trigger** : Information ambiguë ou incomplète après première recherche.

```
SI première recherche insuffisante :
1. Identifier ce qui manque précisément
2. Recherche ciblée (grep, glob, web)
3. Combiner avec contexte existant
4. SI toujours insuffisant → escalader à Jay
```

**Exemple** :
```
Jay: "Pourquoi le deploy a échoué hier ?"
Claude: [Cherche logs] → Pas trouvé
Claude: [Corrective] Cherche dans git log, docker logs
Claude: [Corrective] Consulte Lessons-Learned section DEPLOY
Claude: "J'ai trouvé dans les logs Docker que..."
```

### Granularity-Aware — Chunks Optimaux

| Type de Document | Chunk Size | Overlap |
|------------------|------------|---------|
| Code source | 500-1000 chars | 100 |
| Documentation | 1000-1500 chars | 200 |
| Logs/Erreurs | Ligne par ligne | 0 |
| Config | Fichier entier | 0 |

**Règle** : Plus le document est technique, plus les chunks sont petits.

### Confidence-Calibrated RAG

**Principe** : L'ordre des documents et la structure du prompt affectent la certitude.

```
Documents les plus pertinents → EN PREMIER
Documents contextuels → AU MILIEU
Documents de backup → À LA FIN
```

**Format réponse calibrée** :
```
"Basé sur [source], je suis [confiant/modérément confiant/incertain] que..."
```

---

## Nouvelles Fonctionnalités Claude Code (2026)

### Checkpoints & /rewind

Claude Code sauvegarde automatiquement l'état du code avant chaque modification.

**Usage** :
- Double-tap `Esc` pour revenir en arrière
- `/rewind` pour choisir un checkpoint spécifique
- Permet des expérimentations sans risque

**Intégration Workflow** :
```
1. Proposer changement ambitieux
2. Implémenter
3. SI échec → /rewind au checkpoint
4. Essayer approche alternative
```

### Gestion Tâches /tasks

Système de tâches avec dépendances pour workflows complexes.

**Commandes** :
- `/tasks` : Voir toutes les tâches
- Tâches avec `blockedBy` attendent les dépendances

**Quand utiliser** :
- Refactoring multi-fichiers
- Migration avec étapes séquentielles
- Features avec dépendances

### Auto-Compact MCP

Les descriptions d'outils MCP > 10% du contexte sont automatiquement différées via MCPSearch.

**Économie** : 134K → 5K tokens (96% réduction)

**Désactiver si nécessaire** : Ajouter `MCPSearch` à `disallowedTools`

### Skill Hot-Reload

Les skills dans `~/.claude/skills` ou `.claude/skills` se rechargent automatiquement sans redémarrer la session.

**Usage dev** : Modifier un skill → Tester immédiatement

---

**Version** : 3.0.0 | **Mise à jour** : 2026-01-24 | **Nouveautés** : Adaptive RAG, Self-RAG, Corrective RAG, Claude Code 2.1.x features
