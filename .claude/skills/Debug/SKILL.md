---
name: debug
description: Investigation méthodique de bug. Déclenche Debug-Investigator Agent pour diagnostic avec preuves.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
user-invocable: true
---

# Skill: /debug

> Point d'entrée vers Debug-Investigator Agent.

## Déclencheurs
- `/debug` — Démarrer investigation
- `/debug [error message]` — Investigation ciblée
- Auto : Erreur/bug détecté (via AGENT-BEHAVIOR)

## Action

1. **Collecter** : Logs, stack trace, reproduction
2. **Isoler** : Hypothèses testées avec preuves
3. **Corriger** : Fix minimal
4. **Vérifier** : Prouver résolution

## Workflow

```
/debug [message?]
    ↓
Collecter infos (logs, stack trace)
    ↓
Formuler hypothèses
    ↓
Tester chaque hypothèse
    ↓
Identifier cause EXACTE (avec preuve)
    ↓
Proposer fix
    ↓
Vérifier résolution
```

## Règle Absolue

```
❌ "Je pense que c'est X"
❌ "Ça doit être lié à Y"
✅ "Erreur ligne 42: [preuve exacte]"
✅ "Log montre: [output réel]"
```

## Comportement Complet

→ Voir `agents/Debug-Investigator/AGENT.md` pour méthodologie complète

## Output Minimal

```
🔍 Debug — [Nom Bug]

📋 Collecte
- Stack trace : [fichier:ligne]
- Reproduction : [étapes]

🎯 Cause Identifiée
**Fichier** : src/api/users.py:42
**Code** : `user.name` quand `user` est None
**Preuve** : TypeError dans logs

💡 Fix Proposé
```python
if user is None:
    raise NotFoundError()
return user.name
```

✅ Vérification
- Test ajouté : test_user_none
- Tests passent : 142/142

Appliquer ce fix ?
```

---

**Agent associé** : Debug-Investigator
