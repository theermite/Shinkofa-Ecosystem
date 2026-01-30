---
name: pre-commit
description: Vérification obligatoire avant commit. Déclenche Code-Reviewer Agent pour review factuel.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
user-invocable: true
---

# Skill: /pre-commit

> Point d'entrée vers Code-Reviewer Agent.

## Déclencheur
- Commande : `/pre-commit`
- Auto : AVANT tout `git commit` (via AGENT-BEHAVIOR)

## Action

1. **Charger** : `agents/Code-Reviewer/AGENT.md`
2. **Exécuter** : Review factuel des fichiers staged
3. **Rapport** : Issues trouvées avec lignes exactes
4. **Verdict** :
   - ✅ Prêt à commit
   - ⚠️ Warnings (commit possible)
   - ❌ Critiques (bloquer commit)

## Workflow

```
/pre-commit
    ↓
git diff --staged (voir changements)
    ↓
Code-Reviewer Agent (analyse)
    ↓
Rapport factuel
    ↓
Verdict + action
```

## Comportement Complet

→ Voir `agents/Code-Reviewer/AGENT.md` pour checklist complète et format rapport.

## Output Minimal

```
📋 Pre-Commit Check

Fichiers : [n] modifiés
Issues : [X] critique, [Y] warning, [Z] info

[Si critique]
❌ BLOQUER — Corriger avant commit :
- [fichier:ligne] : [problème]

[Si warning only]
⚠️ Commit possible avec réserves :
- [fichier:ligne] : [problème]

[Si clean]
✅ Prêt à commit
```

---

**Agent associé** : Code-Reviewer
