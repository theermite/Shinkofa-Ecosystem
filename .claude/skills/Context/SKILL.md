---
name: context
description: Afficher ou modifier l'état de session (environnement, projet, énergie). Gestion session-state.md.
allowed-tools:
  - Read
  - Write
  - Bash
user-invocable: true
---

# Skill: /context

> Point d'entrée vers Context-Guardian Agent.

## Déclencheurs
- `/context` — Afficher état session
- `/context prod` — Changer vers PROD
- `/context local` — Changer vers LOCAL
- `/env [env]` — Alias pour changer environnement

## Action

1. **Lire** : `.claude/session-state.md`
2. **Afficher** : État actuel
3. **Modifier** : Si paramètre fourni + confirmation Jay

## Workflow

```
/context
    ↓
Lire session-state.md
    ↓
[Si fichier absent] → Créer à partir du template
    ↓
Afficher état
    ↓
[Si paramètre] → Demander confirmation → Mettre à jour
```

## Auto-Création Session-State

Si `.claude/session-state.md` n'existe pas :

1. Créer le dossier `.claude/` si absent
2. Copier template depuis `templates/session-state.md`
3. Demander à Jay :
   - Environnement cible ?
   - Projet ?
   - Objectif session ?
   - Énergie (1-10) ?
4. Remplir et sauvegarder

## Comportement Complet

→ Voir `agents/Context-Guardian/AGENT.md` pour tracking complet

## Output : /context (afficher)

```
📍 Session State — [PROJET]

| Clé | Valeur |
|-----|--------|
| **Target** | PROD |
| **Branche** | main |
| **Énergie** | 7/10 (Normale) |
| **Début** | 14:30 |
| **Checkpoint** | dans 25 min |

Commandes :
- /context prod → Changer vers PROD
- /context local → Changer vers LOCAL
```

## Output : /context [env] (modifier)

```
⚠️ Changement Environnement

Actuel : LOCAL
Demandé : PROD

Confirmes-tu ce changement ?
[Oui] [Non]
```

→ Si confirmé :
```
✅ Environnement changé : LOCAL → PROD
Session-state.md mis à jour.
```

---

**Agent associé** : Context-Guardian
