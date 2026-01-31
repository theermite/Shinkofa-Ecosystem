# CLAUDE.md — [NOM_PROJET]

> Instructions Claude Code pour ce projet.
> Référence centrale : `D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\`

---

## 🎯 Projet

**Nom** : [NOM_PROJET]
**Type** : [fullstack | api | frontend | cli | desktop | coaching]
**Copyright** : [The Ermite | La Voie Shinkofa]
**Stack** : [TypeScript, Python, React, FastAPI, etc.]

---

## 📍 Environnements

| Env | URL | Branche | Serveur |
|-----|-----|---------|---------|
| **PROD** | [url] | main | [serveur] |
| **LOCAL** | localhost:[port] | develop / feature/* | local |

---

## 🤖 Agents Actifs

Tous les agents de `Instruction-Claude-Code/Prompt-2026-Optimized/agents/` s'appliquent :

| Agent | Déclencheur |
|-------|-------------|
| Context-Guardian | Début session, `/context` |
| Build-Deploy-Test | Build, deploy, `/deploy` |
| Code-Reviewer | Commit, `/pre-commit` |
| Debug-Investigator | Bug, `/debug` |
| Security-Guardian | Deploy PROD |

**Commandes disponibles** : `/pre-commit`, `/deploy`, `/context`, `/debug`

---

## 📍 Session State

Fichier : `.claude/session-state.md`

**OBLIGATOIRE** avant toute action sur PROD :
1. Vérifier l'environnement dans session-state
2. Confirmer avec Jay si action ≠ env session

---

## 📝 Centralisation Erreurs

```
TOUTE erreur significative de ce projet
→ D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\infrastructure\Lessons-Learned.md

PAS de fichier local d'erreurs.
```

---

## 🔧 Spécificités Projet

### Commandes Fréquentes

```bash
# Dev
[commande dev]

# Build
[commande build]

# Test
[commande test]

# Deploy
[commande deploy]
```

### Structure

```
[NOM_PROJET]/
├── .claude/
│   ├── CLAUDE.md           # Ce fichier
│   └── session-state.md    # État session
├── [dossiers projet]
└── ...
```

### Notes Importantes

- [Note 1]
- [Note 2]

---

## 📚 Référence

Pour instructions complètes, consulter :
- `D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\core\` — Comportement, workflow
- `D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\agents\` — Agents détaillés
- `D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\infrastructure\Lessons-Learned.md` — Erreurs connues

---

**Version** : 1.0.0 | **Date** : [DATE]
