# Guide Migration v2 → v3

> Mise à jour des projets existants vers le système d'instructions v3.0.

---

## Résumé des Changements

### Nouveautés v3.0 (Janvier 2026)

| Composant | Changement |
|-----------|------------|
| **Claude 4.x** | Comportement instruction littérale documenté |
| **Agents** | YAML frontmatter standardisé sur tous les agents |
| **RAG** | Adaptive RAG, Self-RAG, Corrective RAG |
| **Workflow** | Extended Thinking, Parallel Tool Calling |
| **Features** | Checkpoints/rewind, /tasks, /keybindings |
| **Docs** | ONBOARDING.md ajouté |

---

## Actions de Migration

### 1. Mettre à jour CLAUDE.md du projet

Ajouter la section Claude 4.x dans le CLAUDE.md de chaque projet :

```markdown
## Comportement Claude 4.x

Claude 4.x suit les instructions **littéralement**. Implications :
- Être explicite sur les comportements attendus
- Donner le contexte (POURQUOI, pas juste QUOI)
- Utiliser "Réfléchis étape par étape" pour tâches complexes
```

### 2. Vérifier session-state.md

Si le projet n'a pas de `.claude/session-state.md`, en créer un :

```bash
cp Prompt-2026-Optimized/templates/session-state.md votre-projet/.claude/
```

### 3. Mettre à jour les références agents

Si votre CLAUDE.md référence des agents, mettre à jour les chemins :

```markdown
# Ancien (v2)
agents/Security-Auditor.md

# Nouveau (v3)
agents/Security-Guardian.md  # Renommé
```

### 4. Ajouter les nouvelles commandes

Informer Claude des nouvelles commandes disponibles :

```markdown
## Commandes Disponibles (v3)

| Commande | Usage |
|----------|-------|
| `/rewind` | Revenir à checkpoint précédent |
| `/tasks` | Voir/gérer tâches en cours |
| `/keybindings` | Configurer raccourcis |
```

---

## Breaking Changes

### 1. Format Instructions

**v2** : Instructions implicites fonctionnaient
```
"Améliore ce code"  # Claude ajoutait tests, docs, etc.
```

**v3** : Instructions explicites requises
```
"Améliore ce code en ajoutant :
- Validation des inputs
- Gestion d'erreurs
- Tests unitaires"
```

### 2. Agents YAML

**v2** : Certains agents sans frontmatter YAML

**v3** : Tous les agents ont un frontmatter standardisé :
```yaml
---
name: agent-name
version: "2.0"
description: ...
triggers: [...]
commands: [...]
allowed-tools: [...]
handoff:
  receives-from: [...]
  hands-to: [...]
---
```

### 3. Syntaxe Arguments Skills

**v2** : `$ARGUMENTS.0`

**v3** : `$ARGUMENTS[0]` ou `$0`

---

## Checklist Migration

### Projet Existant

- [ ] Mettre à jour `.claude/CLAUDE.md` avec section Claude 4.x
- [ ] Vérifier/créer `.claude/session-state.md`
- [ ] Remplacer références `Security-Auditor` → `Security-Guardian`
- [ ] Vérifier syntaxe arguments skills (`$ARGUMENTS.0` → `$0`)
- [ ] Ajouter nouvelles commandes dans CLAUDE.md si pertinent

### Dépôt Instructions

- [ ] Copier les fichiers core/ mis à jour
- [ ] Copier les agents/ avec nouveaux YAML headers
- [ ] Copier quickrefs/Index.md mis à jour
- [ ] Copier ONBOARDING.md

---

## Compatibilité

| Élément | Rétrocompatible | Notes |
|---------|-----------------|-------|
| Anciens CLAUDE.md | ✅ Oui | Fonctionnent, mais moins optimaux |
| Agents sans YAML | ✅ Oui | Fonctionnent, YAML optionnel |
| Skills v2 | ⚠️ Partiel | Syntaxe `$ARGUMENTS.0` dépréciée |
| Commandes slash | ✅ Oui | Nouvelles commandes additives |

---

## Versions Fichiers

| Fichier | v2 | v3 |
|---------|-----|-----|
| AGENT-BEHAVIOR.md | 1.0 | 2.0 |
| RAG-CONTEXT.md | 2.1 | 3.0 |
| WORKFLOW.md | 2.1 | 3.0 |
| Claude-Commands.md | 1.0 | 2.0 |
| Agents core | - | 2.0 |

---

## Support

Si problèmes après migration :
1. Vérifier `/doctor` pour diagnostic
2. Consulter `infrastructure/Lessons-Learned.md`
3. Ouvrir issue sur le dépôt

---

**Version** : 1.0 | **Date** : 2026-01-24
