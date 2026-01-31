# Lessons Learned - Déploiement

> Leçons apprises liées au déploiement, SSL, CI/CD, production.

---

## 📊 Statistiques

**Leçons documentées** : 1
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [DEPLOY] [SSL] Certificat expiré en production
**Date** : 2025-12-20 | **Projet** : shinkofa-platform | **Sévérité** : 🔴

**Contexte** :
Site inaccessible, erreur SSL.

**Erreur** :
Let's Encrypt auto-renew avait échoué silencieusement.

**Solution** :
```bash
# Forcer renouvellement
certbot renew --force-renewal

# Vérifier le cron
cat /etc/cron.d/certbot

# Ajouter monitoring
# Dans crontab:
0 0 1 * * /usr/bin/certbot renew && docker-compose restart nginx
```

**Prévention** :
1. Monitorer dates expiration (voir `Vps-Ovh-Setup.md`)
2. Alertes 30 jours avant expiration
3. Tester renewal : `certbot renew --dry-run`

**Fichiers/Commandes Clés** :
- `/etc/letsencrypt/` - Certificats Let's Encrypt
- `certbot renew` - Renouvellement manuel
- `certbot certificates` - Lister certificats + dates expiration

---

## 💡 Patterns Communs

### Pattern 1 : Monitoring SSL
```bash
#!/bin/bash
# check-ssl-expiry.sh

DOMAIN="app.shinkofa.com"
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
  echo "⚠️ SSL expire dans $DAYS_LEFT jours"
  # Envoyer alerte
fi
```

### Pattern 2 : Auto-Renewal Certbot
```bash
# /etc/cron.d/certbot
0 0,12 * * * root certbot renew --quiet --post-hook "docker-compose -f /path/to/docker-compose.yml restart nginx"
```

### Pattern 3 : Backup Avant Deploy
```bash
#!/bin/bash
# pre-deploy-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$TIMESTAMP"

# Backup DB
docker-compose exec -T db pg_dump -U user dbname > "$BACKUP_DIR/db.sql"

# Backup uploads
cp -r ./uploads "$BACKUP_DIR/uploads"

# Backup .env
cp .env "$BACKUP_DIR/.env"

echo "✅ Backup créé : $BACKUP_DIR"
```

---

## 🚀 Checklist Pre-Deploy

- [ ] Tests passent (CI green)
- [ ] Backup DB effectué
- [ ] Backup fichiers uploads
- [ ] .env PROD à jour
- [ ] Migrations DB prêtes
- [ ] CHANGELOG mis à jour
- [ ] Version bumpée
- [ ] SSL certificats valides (>30 jours)
- [ ] Monitoring actif
- [ ] Rollback plan testé

---

## 🔙 Rollback Quick

```bash
# 1. Arrêter services
docker-compose down

# 2. Restaurer code
git checkout [previous-tag]

# 3. Restaurer DB
docker-compose exec -T db psql -U user dbname < backup.sql

# 4. Redémarrer
docker-compose up -d

# 5. Vérifier
curl -I https://domain.com/health
```

---

## 🔗 Voir Aussi

- [docker.md](docker.md) - Deploy avec Docker
- [database.md](database.md) - Migrations en prod
- Infrastructure: [VPS-OVH-SETUP.md](../VPS-OVH-SETUP.md)
- Agents: [Build-Deploy-Test](../../agents/Build-Deploy-Test/AGENT.md)
- Agents: [Security-Guardian](../../agents/Security-Guardian.md)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
