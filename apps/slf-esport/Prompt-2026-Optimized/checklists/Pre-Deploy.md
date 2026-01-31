# Checklist: Pré-Déploiement

> À vérifier AVANT chaque déploiement en production.

---

## 1. Code Ready

- [ ] **Branche main** à jour et stable
- [ ] **Tous les tests passent** (CI green)
- [ ] **Pas de warnings** critiques
- [ ] **Code review** fait (si équipe)

---

## 2. Configuration

- [ ] **Variables d'environnement** prod configurées
  - DATABASE_URL
  - API keys
  - JWT_SECRET
  - CORS origins

- [ ] **Mode production** activé
  ```bash
  # Node.js
  NODE_ENV=production

  # Python/FastAPI
  DEBUG=false
  ```

- [ ] **Logs** configurés (pas de debug en prod)

---

## 3. Base de Données

- [ ] **Migrations** appliquées
  ```bash
  # Prisma
  npx prisma migrate deploy

  # Alembic
  alembic upgrade head
  ```

- [ ] **Backup** récent disponible

- [ ] **Connexion** testée depuis serveur prod

---

## 4. Sécurité

- [ ] **HTTPS** configuré et fonctionnel

- [ ] **Headers sécurité** actifs (CSP, HSTS, X-Frame-Options)

- [ ] **CORS** restrictif (pas de `*` en prod)

- [ ] **Rate limiting** actif sur endpoints sensibles

- [ ] **Secrets** non exposés (vérifier logs, erreurs)

---

## 5. Performance

- [ ] **Assets minifiés** (CSS, JS)

- [ ] **Images optimisées** (WebP, compression)

- [ ] **Gzip/Brotli** activé sur serveur

- [ ] **Cache headers** configurés

---

## 6. Infrastructure

- [ ] **Docker** images buildées et testées
  ```bash
  docker-compose build --no-cache
  docker-compose up -d
  ```

- [ ] **Ressources** suffisantes (RAM, CPU, disque)

- [ ] **Monitoring** actif (uptime, erreurs)

- [ ] **Rollback plan** préparé

---

## 7. Post-Déploiement

- [ ] **Smoke test** rapide (pages principales)

- [ ] **Vérifier logs** (pas d'erreurs critiques)

- [ ] **Tester auth** (login/logout)

- [ ] **Tester feature** principale

- [ ] **Monitorer** 15-30 min après deploy

---

## Commandes Déploiement Type

### VPS (Docker)
```bash
# Pull dernière version
git pull origin main

# Rebuild et redémarrer
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Vérifier
docker-compose logs -f --tail=100
```

### VPS (Systemd)
```bash
git pull origin main
pip install -r requirements.txt
sudo systemctl restart myapp
sudo systemctl status myapp
```

---

## Rollback Rapide

```bash
# Git
git revert HEAD
git push origin main

# Docker
docker-compose down
docker image ls  # Trouver image précédente
docker-compose up -d  # Avec tag précédent
```

---

**Usage** : Lire avant déploiement | **Trigger** : Chaque mise en production
