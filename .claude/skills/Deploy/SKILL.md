---
name: deploy
description: Cycle déploiement complet avec vérification environnement. Déclenche Build-Deploy-Test + Security-Guardian.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
user-invocable: true
---

# Skill: /deploy

> Point d'entrée vers Build-Deploy-Test Agent + Security-Guardian.

## Déclencheur
- Commande : `/deploy`
- Commande : `/deploy prod` ou `/deploy alpha`
- Auto : Mention "deploy", "mise en prod" (via AGENT-BEHAVIOR)

## Action

1. **Vérifier environnement** : Lire `.claude/session-state.md`
2. **Confirmer cible** : "Déploiement sur [ENV] — correct ?"
3. **Security scan** : Si PROD → `agents/Security-Guardian.md`
4. **Cycle complet** : `agents/Build-Deploy-Test/AGENT.md`
5. **Vérification post** : Health check, logs

## Workflow

```
/deploy [env]
    ↓
Vérifier session-state.md
    ↓
Confirmer environnement avec Jay
    ↓
[Si PROD] Security-Guardian scan
    ↓
Build-Deploy-Test (PRÉ → EXEC → POST)
    ↓
Rapport + preuves
```

## Sécurités

| Check | Action si échec |
|-------|-----------------|
| Env différent de session | STOP + demander confirmation |
| Vulnérabilité critique | BLOQUER deploy |
| Tests échouent | BLOQUER deploy |
| Build échoue | BLOQUER deploy |

## Comportement Complet

→ Voir `agents/Build-Deploy-Test/AGENT.md` pour cycle complet
→ Voir `agents/Security-Guardian.md` pour scan sécurité

## Output Minimal

```
🚀 Deploy — [PROJET] → [ENV]

1. Environnement : ✅ Confirmé [ENV]
2. Sécurité : ✅ Scan OK (0 critique)
3. Build : ✅ Success (45s)
4. Deploy : ✅ Containers up
5. Health : ✅ 200 OK

Preuves :
- curl https://domain.com/health → 200
- docker-compose ps → all running
- Logs clean (0 errors)

✅ DÉPLOIEMENT RÉUSSI
```

---

**Agents associés** : Build-Deploy-Test, Security-Guardian, Context-Guardian
