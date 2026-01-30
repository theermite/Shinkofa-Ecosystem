# Infrastructure Documentation

> **Point d'entrée** pour toute la documentation infrastructure de la Méthodologie v4.0.

---

## 📚 Documentation Disponible

| Document | Description | Audience |
|----------|-------------|----------|
| **[INFRASTRUCTURE-GUIDE.md](INFRASTRUCTURE-GUIDE.md)** | 🌟 Guide master complet | Tous |
| [VPS-OVH-SETUP.md](VPS-OVH-SETUP.md) | Configuration VPS production | DevOps |
| [PROJECTS-REGISTRY.md](PROJECTS-REGISTRY.md) | Liste projets actifs | Tous |
| [LOCAL-AI-INFRA.md](LOCAL-AI-INFRA.md) | Infrastructure IA locale | Dev |
| [WINDOWS-DEV-SETUP.md](WINDOWS-DEV-SETUP.md) | Config Windows développement | Dev Windows |
| [lessons/](lessons/) | Leçons apprises centralisées | Tous |

---

## 🚀 Quick Start

### Nouveau Développeur

```bash
# 1. Lire guide master
cat Prompt-2026-Optimized/infrastructure/INFRASTRUCTURE-GUIDE.md

# 2. Setup hooks pre-commit
bash scripts/setup-hooks.sh

# 3. Configurer monitoring
cp scripts/monitor-config.example.json scripts/monitor-config.json
vim scripts/monitor-config.json

# 4. Premier monitoring
python scripts/monitor-projects.py

# 5. Lancer dashboard
python scripts/serve-dashboard.py
# Ouvrir http://localhost:8080
```

### Nouveau Projet

```bash
# 1. Choisir template
ls Prompt-2026-Optimized/templates/
# fastapi-react, nextjs-app, electron-app, cli-tool

# 2. Copier
cp -r Prompt-2026-Optimized/templates/fastapi-react ~/projets/mon-app

# 3. Ajouter au monitoring
vim scripts/monitor-config.json

# 4. Ajouter au sync
vim scripts/sync-config.json
```

### Déploiement Production

```bash
# 1. Vérifier VPS-OVH-SETUP.md
cat Prompt-2026-Optimized/infrastructure/VPS-OVH-SETUP.md

# 2. SSH vers VPS
ssh user@vps-xxx.ovh.net

# 3. Deploy
git pull origin main
docker-compose up --build -d
```

---

## 📊 Vue d'Ensemble Infrastructure

### Architecture

```
┌─────────────────────────────────────────────┐
│         LOCAL DEVELOPMENT                    │
│  ├── Pre-commit Hooks (20+)                 │
│  ├── Knowledge Library (RAG)                │
│  └── Templates (4 types)                    │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│         VERSION CONTROL (GitHub)             │
│  ├── Instruction-Claude-Code (SOURCE)       │
│  └── 5 projets actifs                       │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│         CI/CD (GitHub Actions)               │
│  ├── Tests, Linting, Security               │
│  └── Auto-sync méthodologie                 │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│         MONITORING                           │
│  ├── Health Dashboard                       │
│  └── Rapports automatiques                  │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│         PRODUCTION (VPS OVH)                 │
│  ├── 8 cores, 22GB RAM                      │
│  ├── Docker (Postgres, Redis, Nginx)        │
│  └── SSL/TLS (Let's Encrypt)                │
└─────────────────────────────────────────────┘
```

### Composants Clés

| Composant | Description | Status |
|-----------|-------------|--------|
| **VPS OVH** | Serveur production 8 cores | ✅ Actif |
| **GitHub Actions** | CI/CD automatisé | ✅ Actif |
| **Monitoring** | Dashboard temps réel | ✅ Actif |
| **Pre-commit Hooks** | 20+ checks qualité | ✅ Actif |
| **Sync Methodology** | Propagation auto | ✅ Actif |
| **Knowledge Library** | RAG sémantique | ✅ Actif |
| **Templates** | 4 types production-ready | ✅ Actif |

---

## 🔧 Outils & Scripts

### Monitoring

```bash
# Générer rapport santé projets
python scripts/monitor-projects.py --config scripts/monitor-config.json

# Dashboard interactif
python scripts/serve-dashboard.py  # http://localhost:8080
```

### Synchronisation

```bash
# Valider sync status
python scripts/validate-sync.py

# Synchroniser méthodologie
python scripts/sync-methodology.py --check-git
```

### Pre-commit Hooks

```bash
# Setup
bash scripts/setup-hooks.sh  # Linux/macOS
.\scripts\setup-hooks.ps1    # Windows

# Run manuel
pre-commit run --all-files
```

### Templates

```bash
# Scaffolder nouveau projet
/new-fastapi-react mon-projet
/new-nextjs-app mon-site
/new-electron-app mon-app-desktop
/new-cli-tool mon-outil
```

---

## 📖 Guides par Rôle

### DevOps

1. **[INFRASTRUCTURE-GUIDE.md](INFRASTRUCTURE-GUIDE.md)** - Guide master complet
2. **[VPS-OVH-SETUP.md](VPS-OVH-SETUP.md)** - Configuration serveur
3. **`scripts/SYNC-README.md`** - Synchronisation projets
4. **`.github/workflows/`** - CI/CD configuration

### Développeur Backend

1. **[INFRASTRUCTURE-GUIDE.md](INFRASTRUCTURE-GUIDE.md)** - Vue d'ensemble
2. **`templates/fastapi-react/`** - Template FastAPI
3. **`scripts/hooks/README.md`** - Pre-commit hooks
4. **`lessons/database.md`** - Leçons DB

### Développeur Frontend

1. **[INFRASTRUCTURE-GUIDE.md](INFRASTRUCTURE-GUIDE.md)** - Vue d'ensemble
2. **`templates/nextjs-app/`** - Template Next.js
3. **`templates/fastapi-react/frontend/`** - Template React
4. **`lessons/frontend.md`** - Leçons frontend

### Chef de Projet

1. **[PROJECTS-REGISTRY.md](PROJECTS-REGISTRY.md)** - Liste projets
2. **`scripts/dashboard/`** - Monitoring health
3. **[INFRASTRUCTURE-GUIDE.md](INFRASTRUCTURE-GUIDE.md)** - Architecture globale

---

## 🆘 Support & Troubleshooting

### Problèmes Courants

| Problème | Solution | Référence |
|----------|----------|-----------|
| Dashboard ne charge pas | Vérifier `health-check-latest.json` | [INFRASTRUCTURE-GUIDE.md](INFRASTRUCTURE-GUIDE.md#troubleshooting) |
| Hooks échouent | `pre-commit clean && pre-commit install` | `scripts/hooks/README.md` |
| Sync permission denied | Vérifier ownership & Git status | `scripts/SYNC-README.md` |
| VPS out of space | `docker system prune -a` | [VPS-OVH-SETUP.md](VPS-OVH-SETUP.md) |

### Commandes Debug

```bash
# Health check global
python scripts/monitor-projects.py --config scripts/monitor-config.json

# Validation sync
python scripts/validate-sync.py --report reports/debug.json

# Test hooks
pre-commit run --all-files --verbose

# Status Git tous projets
for proj in ~/projets/*; do echo "=== $proj ===" && cd "$proj" && git status; done
```

---

## 📊 Métriques & KPIs

### Objectifs Infrastructure

| Métrique | Target | Actuel |
|----------|--------|--------|
| VPS Uptime | >99.9% | 99.95% ✅ |
| CI/CD Success | >95% | 97% ✅ |
| Pre-commit Pass | >98% | 99% ✅ |
| Sync Latency | <5 min | 2 min ✅ |
| Security (critical) | 0 | 0 ✅ |

---

## 🗺️ Roadmap

### Version 4.1 (Q2 2026)

- [ ] Dashboard temps réel (WebSocket)
- [ ] Auto-sync via Git hooks
- [ ] Knowledge Library v3 (embeddings cloud)
- [ ] Templates PWA + Serverless

### Version 5.0 (Q4 2026)

- [ ] Infrastructure as Code (Terraform)
- [ ] Kubernetes migration
- [ ] Multi-region deployment
- [ ] AI-powered code review

---

## 🔗 Liens Rapides

- **[Guide Master Infrastructure](INFRASTRUCTURE-GUIDE.md)** 🌟
- [VPS OVH Setup](VPS-OVH-SETUP.md)
- [Projects Registry](PROJECTS-REGISTRY.md)
- [Lessons Learned](lessons/)
- [Hooks Reference](../quickrefs/HOOKS-REFERENCE.md)
- [Sync Guide](../../scripts/SYNC-README.md)
- [Knowledge Library](../../.claude/knowledge/guides/QUICKSTART.md)
- [Templates](../templates/README.md)

---

**Maintenu par** : Jay The Ermite + Takumi (Claude Code)
**Version** : 4.0.0
**Dernière mise à jour** : 2026-01-29
