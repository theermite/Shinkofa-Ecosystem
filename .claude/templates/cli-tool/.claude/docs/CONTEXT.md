# Context - [Nom CLI Tool]

> Contexte business, use cases, et décisions projet.

**Dernière mise à jour** : [DATE]
**Propriétaire** : Product Owner / Tech Lead

---

## 🎯 Vision & Objectifs

### Vision Produit
**Mission** : [Description courte de la raison d'être du CLI tool]

**Exemple** :
> Simplifier les déploiements multi-environnements pour développeurs, avec une interface unifiée remplaçant 5 scripts Bash fragiles.

### Objectifs Business

| Objectif | Métrique | Cible | Deadline |
|----------|----------|-------|----------|
| Adoption interne | % équipes utilisant CLI | 80% | Q2 2026 |
| Réduction temps deploy | Minutes par deploy | -50% vs scripts | Q1 2026 |
| Réduction erreurs | % deployments réussis | >95% | Q3 2026 |
| DX Satisfaction | NPS interne | >8/10 | Q2 2026 |

---

## 👥 Utilisateurs & Personas

### Persona 1 : Développeur Backend
- **Rôle** : Dev Python/Node.js déployant apps
- **Besoins** :
  - Déploiement simple (`mycli deploy --env production`)
  - Rollback rapide si problème
  - Logs accessibles
- **Pain points** :
  - Scripts Bash cryptiques
  - Pas de feedback visuel
  - Déploiements lents (attente CI/CD)
- **Tech savviness** : ⭐⭐⭐⭐⚪ (4/5)

### Persona 2 : DevOps Engineer
- **Rôle** : Gestion infrastructure, CI/CD
- **Besoins** :
  - Automation possible (scripts)
  - Logs structurés (JSON output)
  - Configuration centralisée
- **Pain points** :
  - Pas d'audit trail
  - Config dispersée (env vars, scripts)
- **Tech savviness** : ⭐⭐⭐⭐⭐ (5/5)

---

## 🏗️ Use Cases

### Use Case 1 : Déploiement Application

**Actor** : Développeur
**Goal** : Déployer app en production

**Flow** :
1. Dev run `mycli deploy --env production`
2. CLI vérifie config (API key, env exists)
3. CLI run tests (optionnel, `--skip-tests` pour override)
4. CLI build application
5. CLI push image vers registry
6. CLI update service (Kubernetes/VPS)
7. CLI affiche URL déployée + version

**Success Criteria** :
- Déploiement < 3 minutes
- Feedback visuel (progress bars)
- Rollback possible si échec

---

### Use Case 2 : Gestion Base de Données

**Actor** : Développeur
**Goal** : Migrer DB production

**Flow** :
1. Dev run `mycli db migrate --env production`
2. CLI vérifie migrations pending
3. CLI backup DB automatique
4. CLI run migrations
5. CLI affiche résumé (migrations appliquées)

**Success Criteria** :
- Backup auto avant migrations
- Rollback possible (`--rollback` flag)
- Confirmation requise pour PROD

---

### Use Case 3 : Consultation Logs

**Actor** : DevOps Engineer
**Goal** : Debugging production issue

**Flow** :
1. Engineer run `mycli logs --env production --follow`
2. CLI stream logs realtime
3. Engineer filter par level (`--level ERROR`)
4. Engineer save logs (`> output.log`)

---

## 🔒 Contraintes Techniques

### Performance
- **Startup time** : < 500ms (CLI doit être réactif)
- **Déploiement** : < 5 minutes (timeout)
- **Network timeout** : 30s par défaut (configurable)

### Sécurité
- ✅ API keys stockées dans config file (`~/.mycli/config.yaml`)
- ✅ Permissions config file : 600 (read/write owner only)
- ✅ Pas de secrets dans CLI history (pas d'args `--api-key`)
- ✅ HTTPS only pour API calls

### Compatibilité
- **OS** : Linux, macOS, Windows
- **Python** : 3.11+ (si Python CLI)
- **Node.js** : 18+ (si TypeScript CLI)

---

## 🚫 Hors Scope (v1)

- ❌ GUI (graphical interface) → CLI only
- ❌ Multi-tenant (un config par machine) → v2
- ❌ Plugins system (extensibilité externe) → v2
- ❌ Cloud-hosted config (config local only) → v2

**Raison** : Focus v1 sur **core workflow** (deploy, db, logs).

---

## 📈 Métriques Suivi

### Techniques
- CLI install count (PyPI/npm downloads)
- Command usage frequency (telemetry optionnel)
- Error rate par command
- Average execution time

### Business
- NPS interne (survey trimestriel)
- % équipes adoptant CLI
- Réduction temps moyen deploy

---

## 🤝 Stakeholders

| Rôle | Personne | Contact | Responsabilités |
|------|----------|---------|-----------------|
| Product Owner | [Nom] | [Email] | Vision, priorités |
| Tech Lead | [Nom] | [Email] | Architecture, décisions tech |
| DevOps Lead | [Nom] | [Email] | Infrastructure, requirements |

---

## 🗓️ Roadmap

### Q1 2026
- ✅ MVP (deploy, db migrate, logs)
- ✅ Distribution PyPI/npm
- ✅ Documentation complète

### Q2 2026
- [ ] Rollback automatique (detect failure)
- [ ] Plugins system
- [ ] Multi-tenant config

### Q3 2026
- [ ] Cloud-hosted config (synchronisation multi-machines)
- [ ] Telemetry opt-in (analytics usage)

---

## 💡 Décisions Clés

### Pourquoi CLI vs GUI ?
**Décision** : CLI
**Raison** : Target users = developers + DevOps (CLI natives), automation-friendly
**Alternative** : GUI (Electron app) = overkill, moins scriptable

### Pourquoi Python Click vs Typer ?
**Décision** : Click
**Raison** : Maturité, large adoption, stable
**Alternative** : Typer (moderne, type hints), mais moins mature

### Pourquoi Config YAML vs TOML ?
**Décision** : YAML
**Raison** : Human-readable, comments support, widespread
**Alternative** : TOML (spec stricte), JSON (pas de comments)

---

**Version** : 1.0 | **Maintenu par** : Product Team
