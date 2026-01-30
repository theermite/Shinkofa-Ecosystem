# Lessons Learned - Docker & Containers

> Leçons apprises liées à Docker, containers, volumes, réseaux.

---

## 📊 Statistiques

**Leçons documentées** : 3
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [DOCKER] [VOLUME] [PERMISSIONS] Upload fichiers échoue après rebuild - Permission denied
**Date** : 2026-01-25 | **Projet** : shinkofa-platform | **Sévérité** : 🔴

**Contexte** :
Upload d'avatar utilisateur échouait avec erreur 500 après rebuild du container.

**Erreur** :
```
PermissionError: [Errno 13] Permission denied: 'static/uploads/avatars/user-xxx.jpg'
```
Le volume Docker était monté mais avec le mauvais propriétaire (UID 1001 au lieu de 1000).

**Solution** :
```bash
# 1. Identifier l'UID de l'utilisateur dans le container
docker exec container_name id
# Résultat: uid=1000(appuser) gid=1000(appuser)

# 2. Corriger les permissions sur l'hôte
sudo chown -R 1000:1000 /var/lib/docker/volumes/volume_name/_data/
sudo chmod -R 775 /var/lib/docker/volumes/volume_name/_data/

# 3. Vérifier dans le container
docker exec container_name ls -la /app/static/
```

**Prévention** :
1. Documenter l'UID/GID utilisé dans le Dockerfile
2. Initialiser les volumes avec les bonnes permissions dans docker-compose :
```yaml
volumes:
  api_static:
    driver: local
```
3. Script d'init pour créer la structure avec bonnes permissions
4. Après tout rebuild : vérifier `docker exec container ls -la /chemin/volume`

**Fichiers/Commandes Clés** :
- `docker-compose.yml` - Configuration volumes
- `docker exec <container> id` - Vérifier UID/GID
- `sudo chown -R 1000:1000 /path` - Corriger permissions

---

### [DOCKER] [VOLUME] Données perdues après rebuild
**Date** : 2026-01-15 | **Projet** : shinkofa-platform | **Sévérité** : 🔴

**Contexte** :
Rebuild du container PostgreSQL pour mise à jour.

**Erreur** :
Toutes les données DB perdues car volume non persisté correctement.

**Solution** :
```yaml
# docker-compose.yml - TOUJOURS définir un volume nommé
volumes:
  - postgres_data:/var/lib/postgresql/data  # ✅ Volume nommé

# PAS ça:
  - ./data:/var/lib/postgresql/data  # ⚠️ Bind mount peut causer problèmes permissions
```

**Prévention** :
1. Toujours utiliser volumes nommés pour les DB
2. Backup AVANT tout rebuild : `docker-compose exec db pg_dump > backup.sql`
3. Vérifier que le volume existe : `docker volume ls`

**Fichiers/Commandes Clés** :
- `docker-compose.yml` - Déclaration volumes
- `docker volume ls` - Lister volumes
- `docker-compose exec db pg_dump` - Backup DB

---

### [DOCKER] [NETWORK] Containers ne communiquent pas
**Date** : 2026-01-10 | **Projet** : SLF-Esport | **Sévérité** : 🟠

**Contexte** :
App frontend ne pouvait pas joindre l'API backend.

**Erreur** :
`Connection refused` entre containers du même docker-compose.

**Solution** :
```yaml
# Utiliser le nom du service, pas localhost
services:
  frontend:
    environment:
      - API_URL=http://backend:8000  # ✅ Nom du service
      # PAS: API_URL=http://localhost:8000  # ❌
  backend:
    # ...
```

**Prévention** :
- Dans Docker, `localhost` = le container lui-même
- Utiliser le nom du service pour communication inter-container
- Vérifier avec `docker network inspect`

**Fichiers/Commandes Clés** :
- `docker-compose.yml` - Configuration services
- `docker network inspect <network>` - Debug réseau

---

## 💡 Patterns Communs

### Pattern 1 : Setup Volume Sécurisé
```yaml
volumes:
  app_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/on/host
```

### Pattern 2 : Communication Inter-Containers
```yaml
# Service A
services:
  api:
    networks:
      - backend

# Service B appelle A
  frontend:
    environment:
      API_URL: http://api:8000  # Nom du service
    networks:
      - backend
```

### Pattern 3 : Backup DB Automatique
```bash
# Script backup.sh
docker-compose exec -T db pg_dump -U user dbname > backup_$(date +%Y%m%d).sql
```

---

## 🔗 Voir Aussi

- [database.md](database.md) - Migrations DB dans containers
- [deploy.md](deploy.md) - Déploiement avec Docker
- Infrastructure: [VPS-OVH-SETUP.md](../VPS-OVH-SETUP.md)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
