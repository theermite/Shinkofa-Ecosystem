# /deployment-check

Lance la checklist de vérification pré-déploiement selon le type d'environnement.

## Description

Cette commande exécute une checklist complète de vérifications avant déploiement production, adaptée au type d'hébergement (VPS ou o2Switch).

## Usage

```bash
/deployment-check <vps|o2switch>
```

**Arguments** :
- `vps` : Checklist pour VPS (FastAPI, Node.js, Docker, nginx, systemd)
- `o2switch` : Checklist pour sites statiques (React build, assets, .htaccess)

## Comportement

### Mode VPS (FastAPI/Node.js/Docker)

#### **Pré-Déploiement**
- [ ] **Tests E2E pass** : Exécute tests end-to-end complets
  - Python : `pytest tests/e2e/`
  - JS/TS : `npm run test:e2e` (Playwright/Cypress)
- [ ] **Load testing** (optional) : Test charge simulée
  - Tool : `locust` ou `k6`
  - Target : 100 req/s pendant 1 min
- [ ] **Environment variables** : Vérifie `.env` production configuré
  - Check all required vars present
  - No `.env.example` values (placeholders)
- [ ] **Secrets rotation** : API keys production ≠ dev
- [ ] **Database backup** : Backup complet DB avant déploiement
  - PostgreSQL : `pg_dump` + compression gzip
  - Stockage off-site (S3, Backblaze)
- [ ] **Rollback plan documenté** : Script rollback prêt, temps estimé < 5 min

#### **Infrastructure**
- [ ] **HTTPS/SSL configuré** : Certbot Let's Encrypt installé
  - Test : `certbot certificates`
  - Auto-renew : `systemctl status certbot.timer`
- [ ] **Firewall configuré** : `ufw status`
  - Ports ouverts : 80 (HTTP), 443 (HTTPS), SSH (custom port)
  - Ports bloqués : 3000, 5000, 8000 (dev ports)
- [ ] **Nginx reverse proxy** : Configuration testée
  - Test : `nginx -t`
  - Reload : `systemctl reload nginx`
- [ ] **Systemd service** : Service créé et enabled
  - Check : `systemctl status app-name.service`
  - Enabled : `systemctl is-enabled app-name`
- [ ] **Logs rotation** : `logrotate` configuré
  - Config : `/etc/logrotate.d/app-name`
  - Test : `logrotate -d /etc/logrotate.d/app-name`
- [ ] **Health check endpoint** : `/health` ou `/status` retourne 200 OK
  - Test : `curl https://domain.com/health`
- [ ] **Monitoring** (optional) : Uptime Robot ou Sentry configuré

#### **Post-Déploiement**
- [ ] **Smoke tests** : Tester endpoints critiques manuellement
  - GET /api/users (liste)
  - POST /api/users (création)
  - Authentication flow
- [ ] **Logs check** : Vérifier logs dernières 5 min
  - Command : `journalctl -u app-name --since "5 minutes ago"`
  - Zéro erreurs critiques
- [ ] **Performance baseline** : Temps réponse < 200ms endpoints critiques
  - Tool : `curl -w "@curl-format.txt" -o /dev/null -s https://domain.com/api/endpoint`
- [ ] **Backup post-déploiement** : Backup DB après déploiement réussi

---

### Mode o2Switch (Sites Statiques)

#### **Pré-Déploiement**
- [ ] **Build production** : `npm run build` réussi
  - Vérifier dossier `dist/` ou `build/` généré
  - No build errors/warnings critiques
- [ ] **Assets optimisés** : Images compressées
  - Tool : TinyPNG, Squoosh, ImageOptim
  - Format : WebP avec fallback PNG/JPG
- [ ] **Cache-busting vérifié** : Hashes dans noms fichiers
  - Exemple : `index-a3f2b1c9.js` (pas `index.js`)
  - Vite/Webpack : Auto-généré
- [ ] **No .env secrets** : Zéro secrets dans build
  - Check : Grep build/ pour "API_KEY", "SECRET", "PASSWORD"
  - Utiliser variables env build-time uniquement
- [ ] **Bundle size check** : Total < 1MB (optimal < 500KB)
  - Tool : `webpack-bundle-analyzer` ou `vite-bundle-visualizer`
- [ ] **Lighthouse audit** : Score ≥ 90
  - Performance : ≥ 90
  - Accessibility : ≥ 90
  - Best Practices : ≥ 90
  - SEO : ≥ 90

#### **Infrastructure**
- [ ] **.htaccess configuré** :
  ```apache
  # HTTP → HTTPS redirect
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

  # Cache headers
  <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 1 day"
  </IfModule>

  # Gzip compression
  <IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
  </IfModule>
  ```
- [ ] **Analytics configuré** : Google Analytics ou Plausible (si applicable)
- [ ] **Sitemap.xml** : Généré et soumis Google Search Console
- [ ] **Robots.txt** : Configuré approprié
  ```
  User-agent: *
  Allow: /
  Sitemap: https://domain.com/sitemap.xml
  ```

#### **Post-Déploiement**
- [ ] **Test multi-browsers** : Chrome, Firefox, Safari (mobile + desktop)
  - BrowserStack ou manuel
- [ ] **Test responsive** : Breakpoints sm/md/lg/xl fonctionnent
  - Chrome DevTools responsive mode
- [ ] **Backup site précédent** : Archive .zip du site remplacé
  - Nom : `backup-YYYY-MM-DD-HH-MM.zip`

#### **Rollback Plan**
- [ ] **FTP backup accessible** : Archive précédente téléchargeable < 2 min
- [ ] **Restore testé** : Procédure restore testée au moins 1 fois

---

## Exemple Output (VPS)

```
🚀 Deployment Check - VPS - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 PRÉ-DÉPLOIEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tests E2E pass (25 tests, 0 failed)
⚠️  Load testing skipped (optional)
✅ Environment variables configured (.env production OK)
✅ Secrets rotation verified (production keys ≠ dev)
✅ Database backup created (backup-2026-01-03-15-45.sql.gz)
✅ Rollback plan documented (scripts/rollback.sh)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ INFRASTRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ HTTPS/SSL configured (Let's Encrypt, expires 2026-04-03)
✅ Firewall configured (ufw active, ports 80/443/2222 open)
✅ Nginx reverse proxy (config test passed)
✅ Systemd service (app-name.service active & enabled)
✅ Logs rotation configured (/var/log/app-name/*.log)
✅ Health check endpoint (https://domain.com/health → 200 OK)
✅ Monitoring configured (Uptime Robot pings every 5 min)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed  : 13/14 checks
⚠️  Warnings: 1 (Load testing skipped)
❌ Failed  : 0

✅ READY TO DEPLOY

📝 Next Steps:
1. Deploy: ssh user@server "cd /var/www/app && git pull && systemctl restart app-name"
2. Smoke tests: Test critical endpoints manually
3. Monitor logs: journalctl -u app-name -f
```

## Post-Check Actions

Si tous checks passent, la commande propose :

```bash
# VPS Deployment Commands
ssh user@vps-ip << 'EOF'
  cd /var/www/app-name
  git pull origin main
  source venv/bin/activate
  pip install -r requirements.txt
  alembic upgrade head
  systemctl restart app-name
EOF

# Verify deployment
curl https://domain.com/health
journalctl -u app-name --since "1 minute ago"
```

```bash
# o2Switch Deployment Commands
# 1. Upload build/ to FTP
# 2. Verify .htaccess in place
# 3. Test site: https://domain.com
```

## Quand Utiliser

- **Avant CHAQUE déploiement production**
- **Après changements majeurs** (breaking changes, migration DB)
- **En CI/CD** (GitHub Actions pre-deploy step)
- **Avant handoff client** (validation finale)

## Configuration

Fichier `.deployment-config.yaml` (optionnel) :

```yaml
vps:
  health_endpoint: /api/health
  required_env_vars:
    - DATABASE_URL
    - SECRET_KEY
    - SMTP_PASSWORD
  smoke_tests:
    - GET /api/users
    - POST /api/auth/login

o2switch:
  lighthouse_thresholds:
    performance: 90
    accessibility: 95
    seo: 90
  max_bundle_size_mb: 1.0
```

## Notes

- **Dry-run mode** : `--dry-run` flag pour simulation sans déploiement réel
- **Verbose** : `--verbose` pour logs détaillés chaque check
- **Skip optional** : `--skip-optional` pour ignorer checks optionnels (load testing, monitoring)
