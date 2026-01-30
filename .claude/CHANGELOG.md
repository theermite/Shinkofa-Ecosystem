# Changelog

Toutes les modifications notables de la méthodologie Claude Code pour Jay The Ermite seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Unreleased]

### À venir
- Intégration Knowledge Library System (5-phase process)
- RAG v5.0+ optimisations (query preprocessing, caching, context aggregation)
- Système déploiement 1-commande (deploy.sh/ps1)
- Hooks Git automatiques (8 hooks)
- Templates projets enrichis (cli-tool, electron-app complets)

---

## [4.1.0] - 2026-01-27

### Added
- **Vibe Coding Professionnel** : Standards production pour code Jay
  - Checklist qualité obligatoire (sécurité, robustesse, maintenabilité, performance, accessibilité)
  - Jay communique en langage naturel, Takumi implémente avec standards production
  - Vs Replit/etc : Jamais "quick & dirty", toujours production-ready
- **Standards UI/UX** : Interfaces morphiques et desktop
  - **PWA Web** : Design System avec tokens, thèmes morphiques (light/dark/contraste élevé)
  - **Desktop** : Qt6/PySide6 obligatoire (JAMAIS tkinter)
  - Architecture composants réutilisables (Atomic Design)
  - Morphing rules : Transitions fluides, préférence système respectée
- **Cache Busting (PWA)** : Solutions efficaces pour navigateurs
  - Hash filenames (production standard)
  - Service Worker (contrôle total PWA)
  - Query strings (simple, fonctionne)
  - HTTP Headers (pas fiable seul)
  - Implémentation Vite avec exemples Service Worker
- **Infrastructure Windows** : Configuration SSH complète
  - `infrastructure/WINDOWS-DEV-SETUP.md` créé
  - SSH agent configuration (OpenSSH, Pageant, 1Password)
  - Troubleshooting détaillé (Git Bash, PowerShell, permissions)
  - Solutions tests connexion SSH
- **Skill /check-ssh** : Diagnostic complet connexion SSH
  - Détection environnement (Git Bash, PowerShell, WSL, Linux/Mac)
  - Vérification clés SSH, agent, configuration
  - Tests connexion réelle avec logs détaillés
  - Suggestions solutions selon erreurs détectées

### Changed
- **.claude/CLAUDE.md** : Version 4.1.0 avec Vibe Coding, UI/UX standards, Cache Busting
- **Profil Jay** : Correction neurodivergence (⚠️ Pas TDAH, énergie cyclique)
- **UI/UX Philosophy** : Qt6/PySide6 documenté comme standard desktop (tkinter banni)

### Links
- Commit: `d6cfe89` - feat(instructions): Add Vibe Coding standards & SSH config (v4.1.0)

---

## [4.0.0] - 2026-01-25 - MAJOR RELEASE

### Added - BREAKING CHANGES
- **Lessons Learned Modulaires** : Fragmentation par catégorie
  - **Structure** : `infrastructure/lessons/` avec 12 catégories
    - `docker.md`, `database.md`, `auth.md`, `deploy.md`, `deps.md`, `desktop.md`
    - `ai-llm.md`, `frontend.md`, `backend.md`, `performance.md`, `config.md`, `git.md`
  - **Index** : `lessons/README.md` avec navigation et tags
  - **Tags searchable** : `[DOCKER]`, `[DB]`, `[AUTH]`, `[DEPLOY]`, `[DEPS]`, etc.
  - **Solution tokens** : Évite fichier monolithique > 25K tokens
  - **Commandes** : `/search-registry`, `/check-duplicate` préparées
- **Shinkofa Ecosystem Master Plan** : Structure centralisée complète
  - **7 fichiers maîtres** : MASTER-PLAN, BUSINESS-PLAN, ROADMAP, ECOSYSTEM-ARCHITECTURE, RESOURCE-PLANNING, KPIS-TRACKING, README
  - **Templates 0.1.0** : Structure workflow remplissage guidé
  - **Philosophie** : Vision 2026-2028, personas, services, architecture, budget, KPIs
  - **Locations** : `infrastructure/shinkofa-ecosystem-master-plan/`
- **Propagation Tracking** : Suivi propagation méthodologie v4 à tous projets
  - `infrastructure/PROPAGATION-TRACKING.md` : État propagation par projet
  - `infrastructure/CHECKLIST-PROPAGATION.md` : Checklist détaillée 13 étapes
  - **Priorités** : shinkofa-platform (HAUTE), Hibiki-Dictate (HAUTE), Ermite-Game-AI (HAUTE)
- **Méthodologie v4.0 Usage Guide** : Documentation utilisation complète
  - Cas d'usage par situation (nouveau projet, bug, feature, refactor, deploy)
  - Commandes par besoin (25 situations documentées)
  - Quick start 5 minutes
  - Liens rapides vers tous fichiers clés

### Changed
- **Projects Registry** : Enrichi avec Social-Content-Master et domaines
  - Ajout Social-Content-Master (éditeur vidéo Next.js + FFmpeg)
  - Architecture domaines Shinkofa (app, alpha, studio, lslf)
  - Statuts mis à jour (8 actifs, 4 pause, 7 archives)
- **Lessons-Learned.md** : Archivé (monolithique)
  - **Ancien** : 1 fichier 10K+ tokens
  - **Nouveau** : 12 fichiers modulaires ~1K chacun
  - **Archive** : `_archive/Lessons-Learned-monolithic-2026-01-25.md`

### Deprecated
- **Lessons-Learned.md monolithique** : Remplacé par `infrastructure/lessons/` modulaire

### Links
- Commit: `c14bf93` - docs: Add v4.0 methodology propagation tracking
- Commit: `db9d76e` - feat(shinkofa): Add centralized ecosystem master plan structure
- Commit: `feed155` - docs: Add comprehensive methodology v4.0 usage guide
- Commit: `2606283` - docs(registry): Add Social-Content-Master & domain architecture

---

## [3.0.0] - 2025-12-15 - MAJOR RELEASE

### Added - BREAKING CHANGES
- **Claude 4.x Optimizations** : Adaptation comportement Claude Opus 4.0+
  - **Extended Thinking** : +39% performance tâches raisonnement (AIME 2025)
  - **Parallel Tool Calling** : Maximisation efficacité appels outils
  - **Interleaved Thinking** : Réflexion post-tool résultats
  - **Multi-Context Window** : Sessions longues avec state management
  - **Literal Instructions** : Claude 4.x suit instructions littéralement
  - **Règles d'écriture 4.x** : Explicite, contexte, exemples, raisonnement, format
- **7 Agents Spécialisés Core** : Automatisation tâches critiques
  - **Context-Guardian** : Tracking environnement, énergie, session
  - **Build-Deploy-Test** : Cycle PRÉ→EXEC→POST complet
  - **Code-Reviewer** : Review factuel avant commit (FAITS pas opinions)
  - **Debug-Investigator** : Debug méthodique avec preuves
  - **Refactor-Safe** : Refactoring petits pas (max 3 fichiers/commit)
  - **Security-Guardian** : Scan OWASP avant deploy PROD
  - **Project-Bootstrap** : Nouveau projet structuré
- **9 Agents Spécialisés Domaines** : Couverture verticale
  - **Project-Planner** : Planification structurée projets
  - **Documentation-Generator** : Auto-génération docs
  - **Ai-Ml-Agent** : Ollama, LangChain, RAG
  - **Codebase-Explorer** : Exploration architecture
  - **Dependency-Auditor** : Versions, CVEs, breaking changes
  - **Desktop-App-Agent** : Electron, CustomTkinter
  - **Electron-Agent** : Spécifique Electron IPC
  - **Frontend-Auditor** : Performance, accessibilité
- **Skills System** : Points d'entrée commandes
  - `/context`, `/debug`, `/deploy`, `/pre-commit`, `/test`
  - Architecture Skills vs Agents clarifiée
  - Archivage anciennes versions (Code-Review, Debug-Expert, Deployment, Refactoring-Planner)
- **Session State System** : `.claude/session-state.md` par projet
  - Environnement actuel (PROD/ALPHA/LOCAL)
  - Branche Git active
  - Niveau énergie Jay (1-10)
  - Type session (Normal / Laboratoire / Basse énergie)
  - Dernière action + Next steps
- **Conventions.md** : Standards techniques complets
  - Nommage fichiers (Title-Kebab-Case.md)
  - Commits Git (Conventional Commits)
  - Branches Git (type/description)
  - Code style par langage (Python PEP8, TypeScript, CSS BEM)
  - Tests (test_*.py, *.test.tsx)
  - Langue (Français docs, Anglais code)
  - Accessibilité WCAG AAA (contraste 7:1, focus, ARIA)

### Changed
- **Architecture documentaire** : Réorganisation complète
  - **core/** : Profil-Jay, Workflow, Agent-Behavior, RAG-Context, Conventions
  - **agents/** : 16 agents (7 core + 9 spécialisés) + AGENT-HANDOFF.md
  - **skills/** : 8 actifs + 4 archivés
  - **templates/** : 5 types projets
  - **checklists/** : Session-Start, Pre-Commit, Pre-Deploy, Session-End
  - **quickrefs/** : 19 références (dev 8, philosophies 5, coaching 4)
  - **infrastructure/** : VPS, local AI, projects registry, Knowledge Hub
  - **branding/** : Chartes Shinkofa v2.0 + The Ermite v0.3
- **Gestion contexte RAG** : 5 niveaux priorité + seuils automatiques
  - **Priorité 1** : Core (toujours chargé, ~8KB)
  - **Priorité 1.5** : Agents (auto-chargés si déclencheur)
  - **Priorité 2** : Projet (.claude/CLAUDE.md, session-state)
  - **Priorité 3** : Contextuel (on-demand: Lessons-Learned, skills, Knowledge Hub)
  - **Priorité 4** : Technique (on-demand: quickrefs, infra)
  - **Priorité 5** : Code projet (lazy, un par un)
  - **Seuils** : <40% OK, 40-60% attention, 60-75% `/compact`, >75% critique
- **Stratégie modèles** : Économie crédits Claude
  - **Haiku** : Exploration, recherche (via subagent)
  - **Sonnet** : Dev standard (par défaut)
  - **Opus** : Décisions critiques, architecture
  - **Métriques** : Haiku 10-20%, Sonnet 70-80%, Opus 5-10%
- **Workflow AUDIT→PLAN→CODE→BILAN** : Checkpoints obligatoires
  - Phase AUDIT : 5-10 min, comprendre contexte
  - Phase PLAN : 10-20 min, proposer 2-3 options + trade-offs
  - Checkpoint "Valides-tu ?" OBLIGATOIRE avant CODE
  - Phase CODE : Implémentation incrémentale + agents
  - Phase BILAN : 5 min, résumé + next steps

### Links
- Commit: `e0bbae3` - feat(instructions): Major v3.0 update with Claude 4.x optimization
- Commit: `cbc55b0` - feat(agents): Add 7 specialized agents with skills and session-state system
- Commit: `78d00bc` - docs(core): Add Conventions.md to core files + commands reference

---

## [2.0.0] - 2025-10-20

### Added
- **Prompt-2026-Optimized** : Structure complète méthodologie
  - Réorganisation architecture documentaire claire
  - Séparation core/agents/skills/templates/checklists/quickrefs/infrastructure
- **Knowledge Hub** : Gestion base connaissances
  - Structure domaines (coaching, business, technical)
  - Workflow ingestion documents
  - Commandes `/knowledge init/ingest/search/stats`
- **Lessons Learned** : Centralisation erreurs et leçons
  - Capture systématique erreurs significatives
  - Tags searchable par catégorie
  - Template structure (Contexte, Erreur, Solution, Prévention)
- **Session Management** : Gestion sessions structurée
  - Utilities scripts (compact, resume, archive)
  - Session state tracking
- **Model Strategy** : Optimisation crédits Claude
  - Documentation stratégie Haiku/Sonnet/Opus
  - Workflow escalade selon complexité

### Changed
- **CLAUDE.md** : Version 1.8 avec optimisation tokens (-60%)
- **Structure registries** : Préparation modular registries

### Links
- Commit: `9930462` - feat(instructions): Add Prompt-2026-Optimized structure v2.0
- Commit: `5ac2238` - feat(knowledge): Add Knowledge Hub, Lessons Learned & utilities

---

## [1.8.0] - 2025-09-15

### Added
- **Docker Best Practices** : Section dédiée bonnes pratiques Docker
  - Multi-stage builds
  - Layer caching optimization
  - Health checks
  - Secrets management
- **Update Script** : `Update-Claude-Instructions.sh`
  - Synchronisation instructions entre projets
  - Validation format Markdown
  - Backup automatique avant update

### Changed
- **CLAUDE.md** : Optimisation tokens (version 1.8)
  - Réduction 60% taille (structure compacte)
  - Clarté améliorée sections critiques
  - Exemples concrets ajoutés

### Links
- Commit: `a93db03` - feat(instructions): Optimize CLAUDE.md v1.8 - 60% token reduction
- Commit: `2d9476a` - feat(instructions): Add Docker Best Practices section (v1.8)
- Commit: `16447b3` - feat(tools): Add Update-Claude-Instructions.sh script

---

## [1.0.0] - 2025-07-01 - INITIAL RELEASE

### Added - Fondation Initiale
- **Profil Jay** : Documentation complète Design Humain
  - Projecteur Splénique 1/3
  - HPI, Multipotentiel, Hypersensible
  - Besoins critiques (structure, invitation, validation, authenticité)
  - Patterns travail (rythme, fatigue, motivation)
- **Identité TAKUMI** : Assistant développeur senior
  - Rôle expert fullstack (TypeScript, Python, Docker, IA)
  - Valeurs Shinkofa (authenticité, inclusivité, accessibilité)
  - Principes communication (invitation, précision, bienveillance, honnêteté)
- **Workflow Standard** : AUDIT→PLAN→CODE→BILAN
  - Phase AUDIT (comprendre contexte)
  - Phase PLAN (proposer options + trade-offs)
  - Phase CODE (implémentation incrémentale)
  - Phase BILAN (résumé + next steps)
- **Infrastructure** : Documentation complète
  - VPS OVH (8 cores, 22GB RAM, configuration ports/SSL)
  - O2Switch (sites statiques, backups)
  - Local AI (Ermite-Game RTX 3060, Dell-Ermite)
- **Projets Registry** : Tracking projets actifs
  - Shinkofa (shinkofa-platform, SLF-Esport, Shizen-Koshin-MVP)
  - The Ermite (toolbox-theermite, Hibiki-Dictate, Ermite-Podcaster)
  - Statuts, hébergement, stack technique
- **Templates** : Premiers templates projets
  - CLAUDE-PROJECT.md (baseline universel)
  - CLAUDE-Fullstack.md (Next.js + FastAPI + DB)
  - CLAUDE-Desktop.md (Electron/CustomTkinter)

### Initial Features
- Configuration Claude Code structurée
- Documentation complète méthodologie Jay/TAKUMI
- Standards techniques (Git, Docker, tests)
- Philosophie Shinkofa intégrée
- Respect profil neurodivergent Jay

---

## Types de Changements

- **Added** : Nouvelles fonctionnalités
- **Changed** : Modifications fonctionnalités existantes
- **Deprecated** : Fonctionnalités bientôt supprimées
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections bugs
- **Security** : Corrections vulnérabilités

---

## Liens Versions

- [4.1.0]: https://github.com/theermite/Instruction-Claude-Code/commit/d6cfe89
- [4.0.0]: https://github.com/theermite/Instruction-Claude-Code/commit/c14bf93
- [3.0.0]: https://github.com/theermite/Instruction-Claude-Code/commit/e0bbae3
- [2.0.0]: https://github.com/theermite/Instruction-Claude-Code/commit/9930462
- [1.8.0]: https://github.com/theermite/Instruction-Claude-Code/commit/a93db03
- [1.0.0]: https://github.com/theermite/Instruction-Claude-Code/commit/47ccc91

---

**Méthodologie Claude Code pour Jay The Ermite**
**Philosophie Shinkofa** : Authenticité, Inclusivité, Accessibilité Universelle
**Respect Design Humain** : Projecteur Splénique 1/3, HPI, Hypersensible

*"Shinkofa : Regarder en arrière pour aller de l'avant"*
