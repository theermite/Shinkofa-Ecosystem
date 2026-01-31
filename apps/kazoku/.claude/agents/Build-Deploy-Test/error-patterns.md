# Error Patterns — Build-Deploy-Test

> Base de connaissances des erreurs rencontrées et leurs solutions.
> Consulter AVANT de debug. Mettre à jour APRÈS résolution nouvelle erreur.

---

## Format Entrée

```markdown
## [CATÉGORIE] — [Nom Court Erreur]

**Pattern** : `[regex ou texte exact de l'erreur]`

**Cause** : [Explication]

**Solution** :
1. [Étape 1]
2. [Étape 2]

**Prévention** : [Comment éviter à l'avenir]

**Dernière occurrence** : [YYYY-MM-DD] — [Projet]
```

---

## BUILD — Erreurs Courantes

### [BUILD] Module Not Found

**Pattern** : `Cannot find module 'xxx'` | `ModuleNotFoundError: No module named 'xxx'`

**Cause** : Dépendance non installée ou chemin import incorrect.

**Solution** :
1. Vérifier `package.json` / `requirements.txt`
2. `npm install` / `pip install -r requirements.txt`
3. Si persiste, vérifier chemin import (relatif vs absolu)

**Prévention** : Toujours `npm install` après pull

---

### [BUILD] TypeScript Strict Errors

**Pattern** : `Type 'xxx' is not assignable to type 'yyy'`

**Cause** : Types incompatibles, souvent après refactoring.

**Solution** :
1. Identifier le type attendu vs fourni
2. Ajouter type guard ou assertion si légitime
3. Corriger le type source si erreur réelle

**Prévention** : `tsc --noEmit` avant commit

---

### [BUILD] Out of Memory

**Pattern** : `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed`

**Cause** : Build trop gourmand en RAM.

**Solution** :
1. `NODE_OPTIONS=--max_old_space_size=4096 npm run build`
2. Réduire taille bundle (code splitting)
3. Augmenter RAM si VPS

**Prévention** : Monitorer taille bundle régulièrement

---

## DEPLOY — Erreurs Courantes

### [DEPLOY] Port Already in Use

**Pattern** : `Error: listen EADDRINUSE: address already in use :::3000`

**Cause** : Process précédent toujours actif.

**Solution** :
1. `lsof -i :3000` pour trouver PID
2. `kill -9 [PID]`
3. Ou `docker-compose down` puis `up`

**Prévention** : Toujours `down` avant `up`

---

### [DEPLOY] SSL Certificate Error

**Pattern** : `SSL_ERROR_RX_RECORD_TOO_LONG` | `certificate verify failed`

**Cause** : Certificat expiré, mal configuré, ou HTTP au lieu de HTTPS.

**Solution** :
1. Vérifier date expiration : `openssl s_client -connect domain:443`
2. Renouveler avec certbot : `certbot renew`
3. Vérifier nginx/apache config

**Prévention** : Auto-renew certbot, monitoring certificat

---

### [DEPLOY] Docker Build Cache Issues

**Pattern** : Build réussit mais changements pas visibles.

**Cause** : Cache Docker non invalidé.

**Solution** :
1. `docker-compose build --no-cache`
2. Ou `docker system prune` (attention: supprime tout)

**Prévention** : Utiliser `--no-cache` pour builds critiques

---

### [DEPLOY] Database Connection Refused

**Pattern** : `psycopg2.OperationalError: could not connect to server: Connection refused`

**Cause** : Container DB pas démarré, mauvais host/port, ou firewall.

**Solution** :
1. `docker-compose ps` — vérifier DB running
2. Vérifier `DATABASE_URL` dans `.env`
3. Vérifier network Docker : `docker network ls`

**Prévention** : Health check DB avant app start

---

## TEST — Erreurs Courantes

### [TEST] Fixture Not Found

**Pattern** : `fixture 'xxx' not found`

**Cause** : Fixture non importée ou mal nommée.

**Solution** :
1. Vérifier import dans `conftest.py`
2. Vérifier nom exact (case sensitive)
3. Vérifier scope fixture

**Prévention** : Centraliser fixtures dans `conftest.py`

---

### [TEST] Async Test Timeout

**Pattern** : `Timeout - Async callback was not invoked within the 5000 ms timeout`

**Cause** : Promise non résolue, await manquant, ou vrai timeout.

**Solution** :
1. Vérifier tous les `await`
2. Augmenter timeout si légitime : `jest.setTimeout(10000)`
3. Mock les appels réseau lents

**Prévention** : Toujours mock services externes

---

### [TEST] Database State Pollution

**Pattern** : Tests passent seuls, échouent ensemble.

**Cause** : Tests partagent état DB, pas d'isolation.

**Solution** :
1. Transaction rollback après chaque test
2. Ou truncate tables dans `setUp`
3. Utiliser DB test séparée

**Prévention** : Fixtures avec scope `function` + rollback

---

## GÉNÉRAL — Patterns Transversaux

### [GIT] Merge Conflict on Deploy

**Pattern** : `CONFLICT (content): Merge conflict in xxx`

**Cause** : Branche locale diverge de remote.

**Solution** :
1. `git stash` si changements locaux
2. `git pull --rebase origin main`
3. Résoudre conflits
4. `git stash pop` si applicable

**Prévention** : Pull régulier, branches courtes

---

### [ENV] Variable Not Set

**Pattern** : `KeyError: 'DATABASE_URL'` | `undefined environment variable`

**Cause** : Variable manquante dans `.env` ou non chargée.

**Solution** :
1. Vérifier `.env` existe et contient la variable
2. Vérifier chargement : `dotenv` / `python-dotenv`
3. Sur serveur : vérifier export ou docker-compose env

**Prévention** : `.env.example` à jour, check en début app

---

## Template Nouvelle Erreur

```markdown
## [CATÉGORIE] — [Nom]

**Pattern** : `[message erreur]`

**Cause** : [explication]

**Solution** :
1. [étape]

**Prévention** : [comment éviter]

**Dernière occurrence** : [date] — [projet]
```

---

**Dernière mise à jour** : 2026-01-24
