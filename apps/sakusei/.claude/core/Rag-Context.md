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

PRIORITÉ 2 — PROJET (~5KB)
└── .claude/CLAUDE.md du projet actif

PRIORITÉ 3 — CONTEXTUEL (on-demand)
├── infrastructure/Lessons-Learned.md  ← SI tâche similaire déjà rencontrée
├── skills/[pertinent]/SKILL.md        ← SI tâche déclenche le skill
└── infrastructure/Knowledge-Hub.md    ← SI navigation nécessaire

PRIORITÉ 4 — TECHNIQUE (on-demand)
├── quickrefs/dev/[pertinent].md       ← SI besoin référence
├── infrastructure/Vps-Ovh-Setup.md    ← SI deploy/infra
└── infrastructure/Projects-Registry.md ← SI multi-projet

PRIORITÉ 5 — CODE PROJET (lazy)
└── Fichiers sources un par un selon besoin
```

---

## Consultation Automatique Lessons-Learned

**AVANT ces actions, toujours vérifier Lessons-Learned.md** :

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

**Version** : 2.1.0 | **Mise à jour** : 2026-01-20
