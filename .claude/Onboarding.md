# Onboarding — Système d'Instructions Claude Code

> Guide de démarrage rapide pour utiliser le système d'instructions de Jay The Ermite.

---

## Vue d'Ensemble

Ce dépôt contient un système complet d'instructions pour Claude Code, optimisé pour :
- Un développeur neurodivergent (HPI, Projecteur 1/3)
- Des workflows sécurisés avec validation continue
- Une économie de crédits Claude (stratégie multi-modèles)
- Un suivi d'erreurs centralisé

---

## Démarrage Rapide (5 min)

### 1. Copier dans un Nouveau Projet

```bash
# Depuis ce dépôt, copier le template
cp -r Prompt-2026-Optimized/templates/CLAUDE-PROJECT.md votre-projet/.claude/CLAUDE.md
```

Ou utiliser le template spécifique :
- `CLAUDE-Fullstack.md` — Next.js + FastAPI
- `CLAUDE-Frontend.md` — React/Vue
- `CLAUDE-Desktop.md` — Electron
- `CLAUDE-Tooling.md` — CLI tools

### 2. Créer le Session-State

```bash
cp Prompt-2026-Optimized/templates/session-state.md votre-projet/.claude/session-state.md
```

Remplir :
- **Target** : PROD / LOCAL
- **Branche** : main / develop
- **Objectif** : Description courte de la session

### 3. Commencer une Session

Lancer Claude Code dans le projet :
```bash
cd votre-projet
claude
```

Claude détectera automatiquement `.claude/CLAUDE.md` et chargera le contexte.

---

## Architecture du Système

```
Instruction-Claude-Code/
├── Prompt-2026-Optimized/
│   ├── core/                  # Fondation (toujours chargé)
│   │   ├── Profil-Jay.md      # Profil utilisateur
│   │   ├── WORKFLOW.md        # AUDIT→PLAN→CODE→BILAN
│   │   ├── AGENT-BEHAVIOR.md  # Comportement Claude
│   │   └── RAG-CONTEXT.md     # Gestion contexte
│   │
│   ├── agents/                # Agents spécialisés (auto-chargés)
│   │   ├── Context-Guardian/  # Tracking environnement
│   │   ├── Build-Deploy-Test/ # Cycle build/deploy
│   │   ├── Code-Reviewer/     # Review avant commit
│   │   └── ...
│   │
│   ├── skills/                # Points d'entrée commandes
│   ├── templates/             # Templates projets
│   ├── checklists/            # Processus répétables
│   ├── quickrefs/             # Références on-demand
│   └── infrastructure/        # Docs infra + Lessons-Learned
```

---

## Agents — Qui Fait Quoi

| Agent | Déclencheur | Mission |
|-------|-------------|---------|
| **Context-Guardian** | Début session | Tracking env, énergie, session-state |
| **Build-Deploy-Test** | Build/Deploy | Cycle PRÉ→EXEC→POST avec preuves |
| **Code-Reviewer** | Avant commit | Review factuel, pas opinions |
| **Debug-Investigator** | Bug/Erreur | Investigation méthodique 4 phases |
| **Refactor-Safe** | Refactor > 3 fichiers | Petits pas, validation continue |
| **Security-Guardian** | Deploy PROD | Scan OWASP, secrets, deps |
| **Project-Bootstrap** | Nouveau projet | Structure complète prête |

---

## Commandes Essentielles

### Session
| Commande | Action |
|----------|--------|
| `/context` | Voir état session |
| `/compact` | Résumer conversation |
| `/tasks` | Voir tâches en cours |

### Qualité
| Commande | Action |
|----------|--------|
| `/pre-commit` | Review avant commit |
| `/lint-fix` | Auto-fix linters |
| `/test-coverage` | Tests + coverage |

### Sécurité & Deploy
| Commande | Action |
|----------|--------|
| `/security-scan` | Audit sécurité complet |
| `/deploy` | Cycle deploy avec vérifications |
| `/rewind` | Revenir à checkpoint précédent |

---

## Workflow Standard

```
1. AUDIT   — Lire fichiers, comprendre contexte
2. PLAN    — Proposer 2-3 options, ATTENDRE validation
3. CODE    — Petits commits, agents obligatoires
4. BILAN   — Résumer, next steps
```

**Règle Clé** : Claude demande toujours "Valides-tu ?" avant d'implémenter.

---

## Gestion de l'Énergie

Le système s'adapte au niveau d'énergie :

| Niveau | Durée Max | Type Tâches |
|--------|-----------|-------------|
| **Basse (1-4)** | 45 min | Bugfix simple |
| **Normale (5-7)** | 2-3h | Features |
| **Haute (8-10)** | 4-8h | Architecture |

Indiquer son niveau : "Énergie 3 aujourd'hui" → Claude s'adapte.

---

## Stratégie Modèles (Économie Crédits)

| Modèle | Usage | % Temps |
|--------|-------|---------|
| **Haiku** | Exploration via subagent | 10-20% |
| **Sonnet** | Développement standard | 70-80% |
| **Opus** | Architecture critique | 5-10% |

**Par défaut** : Sonnet. Escalade vers Opus seulement si nécessaire.

---

## Leçons Apprises

Toute erreur significative → `infrastructure/Lessons-Learned.md`

Consulter AVANT :
- Migration DB
- Deploy prod
- Mise à jour dépendances
- Config Docker/SSL

---

## Claude 4.x — Points Clés

Claude 4.x suit les instructions **littéralement**. Implications :

1. **Être explicite** — Dire exactement ce qu'on veut
2. **Donner le contexte** — Expliquer POURQUOI
3. **Utiliser des exemples** — Show, don't tell
4. **Extended thinking** — Pour tâches complexes, dire "Réfléchis étape par étape"

```
# Exemple Claude 4.x
❌ "Améliore ce code"
✅ "Améliore ce code en ajoutant validation des inputs,
    gestion d'erreurs, et tests unitaires"
```

---

## Premiers Pas Recommandés

1. **Lire** `core/WORKFLOW.md` — Comprendre le cycle
2. **Parcourir** `agents/` — Voir les agents disponibles
3. **Consulter** `quickrefs/dev/Claude-Commands.md` — Commandes utiles
4. **Créer** un projet test avec `/new-project`

---

## Support

- **Questions** : Ouvrir issue sur ce dépôt
- **Feedback** : https://github.com/anthropics/claude-code/issues
- **Documentation Claude Code** : https://docs.claude.com

---

**Version** : 1.0 | **Date** : 2026-01-24
