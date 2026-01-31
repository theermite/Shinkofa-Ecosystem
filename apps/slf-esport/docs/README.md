# 📚 Documentation SLF E-Sport Platform

This directory contains all project documentation organized by category.

## 📁 Directory Structure

```
docs/
├── guides/              # Project-specific guides (SLF E-Sport platform)
└── resources/           # Reusable resources (applicable to other projects)
```

---

## 📖 Guides (Project-Specific)

Documentation specific to the SLF E-Sport training platform.

### User & Testing
- **USER-GUIDE.md** - Complete user guide for players and coaches
- **GUIDE-TEST.md** - Testing procedures and scenarios
- **TROUBLESHOOTING.md** - Common issues and solutions

### Features
- **MEMORY_EXERCISES_README.md** - Brain training exercises documentation
- **HOK-MAPS-INTEGRATION.md** - Honor of Kings maps integration
- **BRAIN-TRAINING-INTEGRATION-SUMMARY.md** - Brain training feature summary
- **EXERCICES-COMPLETS-BRAIN-TRAINING.md** - Complete brain training exercises list
- **EMAIL-SYSTEM-SUMMARY.md** - Email notification system documentation
- **SCORING-SYSTEM-FIXED.md** - Scoring algorithm documentation

### Development
- **NEXT-STEPS.md** - Roadmap and next features to implement
- **DEVELOPMENT-PLAN.md** - Development planning and architecture decisions

---

## 🔧 Resources (Reusable)

General-purpose guides and resources applicable to any web application project.

### Infrastructure
- **GUIDE-DEPLOIEMENT-VPS.md** - Complete VPS deployment guide (Docker, Nginx, SSL)
  - Applicable to: FastAPI + React + PostgreSQL + Redis projects
  - Includes: Docker Compose, Nginx config, Let's Encrypt SSL, security hardening

### Email & DNS
- **DNS-CONFIGURATION-EMAIL.md** - DNS configuration for email delivery (SPF, DKIM, DMARC)
  - Applicable to: Any project requiring transactional emails

### Web Server
- **NGINX-CONFIG.md** - Nginx reverse proxy configuration examples
  - Applicable to: Any web app requiring reverse proxy, SSL termination

---

## 🗂️ Root Documentation

Key documents remain in the project root for quick access:

- **README.md** - Project overview and quick start
- **PROJECT-OVERVIEW.md** - Comprehensive technical documentation
- **CHANGELOG.md** - Version history
- **COPYRIGHT.md** - Copyright and legal notices

---

## 🔄 Maintenance

When adding new documentation:

1. **Project-specific guides** → `docs/guides/`
   - Features documentation
   - Testing procedures
   - Platform-specific workflows

2. **Reusable resources** → `docs/resources/`
   - Infrastructure setup guides
   - Configuration templates
   - General best practices

3. **Temporary notes** → Delete after resolution
   - Bug fix notes (FIX-*.md)
   - Deployment logs (DEPLOYMENT_LOG.md)
   - Cache clearing instructions (URGENT-*.md)

---

**Last updated:** 2026-01-03
**Project:** SLF E-Sport Training Platform
**Version:** 1.2.0
