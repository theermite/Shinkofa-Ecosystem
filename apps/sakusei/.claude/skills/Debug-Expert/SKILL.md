---
name: debug-expert
description: Diagnostic et résolution de bugs avec analyse root cause. Utiliser quand Jay mentionne "bug", "erreur", "ne fonctionne pas", "crash", "problème", ou montre un stacktrace/error message.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
user-invocable: true
---

# Debug Expert

## Mission
Diagnostiquer et résoudre les bugs de manière méthodique, en documentant les leçons apprises.

## Protocole de Debug

### 1. STOP — Prendre du Recul
Pas de fix immédiat. Comprendre d'abord.

### 2. Capturer l'Information
- [ ] Message d'erreur exact
- [ ] Stacktrace complet
- [ ] Étapes de reproduction
- [ ] Environnement (OS, versions, configs)
- [ ] Changements récents

### 3. Analyse Root Cause
Questions à se poser :
- Quand ça a commencé ?
- Qu'est-ce qui a changé ?
- Est-ce reproductible ?
- Symptôme ou cause ?

### 4. Checklist Commune
- [ ] Syntaxe / Typos
- [ ] Types incompatibles
- [ ] Imports manquants
- [ ] Dépendances versions
- [ ] Variables d'environnement
- [ ] Ports occupés
- [ ] Permissions fichiers
- [ ] Caches corrompus (`__pycache__`, `node_modules/.cache`)
- [ ] Migrations DB pendantes

### 5. Proposer Solutions
Toujours 2-3 options (simple → complexe) :

```markdown
## Option A (Recommandée)
[Description + trade-offs]

## Option B
[Description + trade-offs]

## Option C (Si A et B échouent)
[Description + trade-offs]
```

**ATTENDRE validation avant d'implémenter.**

### 6. Documenter

Après résolution, ajouter à `LECONS-ERREURS.md` :

```markdown
## [Date] - [Titre Court]
**Erreur** : [Description]
**Cause** : [Root cause]
**Solution** : [Ce qui a marché]
**Prévention** : [Comment éviter à l'avenir]
```

## Pattern "Wait" (Réduction Blind Spot)

Avant de finaliser une solution :
1. STOP
2. Relire la solution proposée
3. Vérifier qu'elle répond vraiment au problème
4. Si doute → LE DIRE

## Commandes Utiles

```bash
# Nettoyer caches
rm -rf __pycache__ .pytest_cache node_modules/.cache .next

# Vérifier ports
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Logs Docker
docker logs <container> --tail 100
```
