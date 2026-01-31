# Deployment Checklists Détaillées

**Contexte d'usage** : Consulter ce fichier AVANT déploiement VPS ou o2Switch.

---

## 🚀 VPS (FastAPI/Node.js/Docker)

### Pré-Déploiement
- [ ] Tests E2E pass (end-to-end complets, pas juste unitaires)
- [ ] Load testing (API testée avec charge simulée - optional mais recommandé)
- [ ] Environment variables (`.env` production configuré, PAS .env.example)
- [ ] Secrets rotation (API keys production ≠ dev)
- [ ] Database backup (backup complet DB avant déploiement)
- [ ] Rollback plan documenté (script rollback prêt, temps < 5 min)

### Infrastructure
- [ ] HTTPS/SSL configuré (Certbot Let's Encrypt + auto-renew activé)
- [ ] Firewall configuré (`ufw enable`, ports 80/443/SSH custom ouverts)
- [ ] Nginx reverse proxy (config testée `nginx -t`)
- [ ] Systemd service (service créé, `enabled`, démarre au boot)
- [ ] Logs rotation (`logrotate` configuré, éviter saturation disque)
- [ ] Health check endpoint (`/health` ou `/status` retourne 200 OK)
- [ ] Monitoring (Uptime Robot ou Sentry configuré - optional)

### Post-Déploiement
- [ ] Smoke tests (tester endpoints critiques manuellement)
- [ ] Logs check (vérifier logs dernières 5 min, zéro erreurs critiques)
- [ ] Performance baseline (temps réponse < 200ms endpoints critiques)
- [ ] Backup post-déploiement (backup DB après déploiement réussi)

---

## 🌐 o2Switch (Sites Statiques)

### Pré-Déploiement
- [ ] Build production (`npm run build` réussi, dossier `dist/` ou `build/` généré)
- [ ] Assets optimisés (images compressées TinyPNG/Squoosh)
- [ ] Cache-busting vérifié (hashes dans noms fichiers `index-[hash].js`)
- [ ] No .env secrets (zéro secrets dans build, utiliser variables env build-time)
- [ ] Bundle size check (total < 1MB, optimal < 500KB)
- [ ] Lighthouse audit (score ≥ 90 Performance, Accessibility, SEO)

### Infrastructure
- [ ] `.htaccess` configuré :
  - Redirections HTTP → HTTPS
  - Cache headers (images: 1 an, HTML: 1 jour)
  - Gzip compression activée
- [ ] Analytics configuré (Google Analytics ou Plausible si applicable)
- [ ] `sitemap.xml` (généré et soumis Google Search Console)
- [ ] `robots.txt` (configuré approprié)

### Post-Déploiement
- [ ] Test multi-browsers (Chrome, Firefox, Safari mobile + desktop)
- [ ] Test responsive (breakpoints sm/md/lg/xl fonctionnent)
- [ ] Backup site précédent (archive .zip du site remplacé)

### Rollback Plan
- [ ] FTP backup accessible (archive précédente téléchargeable < 2 min)
- [ ] Restore testé (procédure restore testée au moins 1 fois)

---

## 🔧 Commands Slash Disponibles

- `/deployment-check vps` : Vérifie checklist VPS
- `/deployment-check o2switch` : Vérifie checklist o2Switch

---

**Retour vers** : `CLAUDE.md` pour workflow principal
