---
name: deployment
description: Déploiement sécurisé avec checklist complète. Utiliser quand Jay mentionne "deploy", "déployer", "mise en production", "push to prod", "release", ou avant tout déploiement VPS/cloud.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
user-invocable: true
---

# Deployment Expert

## Mission
Assurer des déploiements sécurisés, testés et réversibles.

## Checklist Pré-Déploiement

### 1. Code Ready
- [ ] Tous les tests passent
- [ ] Linting zéro warnings
- [ ] Build réussit localement
- [ ] Pas de `console.log` / `print` debug
- [ ] Pas de TODO critiques

### 2. Sécurité
- [ ] Pas de secrets dans le code
- [ ] `.env.example` à jour
- [ ] Variables prod configurées
- [ ] HTTPS/SSL vérifié
- [ ] Headers sécurité (CSP, CORS)

### 3. Database
- [ ] Migrations prêtes
- [ ] Backup effectué
- [ ] Rollback testé

### 4. Documentation
- [ ] CHANGELOG mis à jour
- [ ] README instructions déploiement
- [ ] Version bumpée

## Checklist Déploiement

### VPS OVH
```bash
# 1. Connexion
ssh user@vps-ip

# 2. Backup état actuel
docker-compose exec db pg_dump -U user dbname > backup_$(date +%Y%m%d).sql

# 3. Pull dernières modifications
cd /app && git pull origin main

# 4. Rebuild containers
docker-compose build --no-cache
docker-compose up -d

# 5. Migrations
docker-compose exec app python manage.py migrate

# 6. Vérification
docker-compose ps
curl -I https://domain.com/health
```

### Rollback Plan
```bash
# Si problème détecté
docker-compose down
git checkout HEAD~1
docker-compose up -d

# Restore DB si nécessaire
docker-compose exec -T db psql -U user dbname < backup_YYYYMMDD.sql
```

## Checklist Post-Déploiement

- [ ] Site accessible
- [ ] Login fonctionne
- [ ] Features critiques testées
- [ ] Logs sans erreurs
- [ ] Monitoring OK
- [ ] Notification équipe (si applicable)

## Si Erreur Post-Deploy

1. **Ne pas paniquer**
2. Vérifier logs : `docker-compose logs --tail 100`
3. Si critique → Rollback immédiat
4. Documenter dans LECONS-ERREURS.md

## Environnements

| Env | URL | Branch |
|-----|-----|--------|
| Production | domain.com | main |
| Staging | staging.domain.com | develop |
| Local | localhost:3000 | feature/* |
