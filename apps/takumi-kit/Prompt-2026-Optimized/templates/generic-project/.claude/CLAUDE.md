# CLAUDE.md - [Nom Projet]

> Instructions spécifiques Claude Code pour ce projet.

---

## 🎯 À Propos de ce Projet

**Nom** : [Nom Projet]
**Type** : [Web App / API / CLI / Desktop / Library]
**Stack** : [Stack technique principale]
**Status** : [En développement / Production / Maintenance]

---

## 📚 Documentation & Knowledge (OBLIGATOIRE)

**RÈGLE CRITIQUE** : TOUJOURS consulter la documentation ET la Knowledge Library avant toute action.

### Documentation Projet (.claude/docs/)

Documentation technique du projet actuel.

### Structure Documentation

```
.claude/docs/
├── ARCHITECTURE.md       # ⭐ Architecture, stack, déploiement
├── API_REFERENCE.md      # ⭐ Documentation API complète
├── DATABASE_SCHEMA.md    # ⭐ Schéma DB, tables, relations
├── CODING_STANDARDS.md   # ⭐ Standards code, conventions
├── TESTING_GUIDE.md      # Tests patterns, frameworks
├── CONTEXT.md            # Contexte métier, business rules
├── CHANGELOG.md          # Historique versions
└── KNOWN_ISSUES.md       # Bugs connus, workarounds
```

### Workflow RAG Obligatoire

```
AVANT toute action significative :

1. Identifier action (API, DB, architecture, etc.)
   ↓
2. Consulter fichiers pertinents :
   - Architecture/design → ARCHITECTURE.md + CONTEXT.md
   - API changes → API_REFERENCE.md
   - DB changes → DATABASE_SCHEMA.md
   - Code → CODING_STANDARDS.md
   - Tests → TESTING_GUIDE.md
   - Bug fix → KNOWN_ISSUES.md
   ↓
3. Vérifier lessons learned :
   /search-registry "keywords"
   ↓
4. Appliquer patterns documentés
   ↓
5. Implémenter
   ↓
6. SI nouveau pattern → Documenter
```

### Commandes Documentation

```bash
/rag-status          # Vérifier état documentation
/init-rag            # Initialiser structure doc (si manquante)
/search-registry     # Chercher dans lessons learned
/check-duplicate     # Vérifier si pattern existe déjà
```

**SI documentation manquante** :
```
⚠️ "Documentation projet manquante ou incomplète.
   Score actuel : XX%

   Veux-tu que j'initialise la structure avec /init-rag ?"
```

---

### Knowledge Library (.claude/knowledge/)

**Base de connaissances personnalisée** - ton expertise unique.

```
.claude/knowledge/
├── coaching/          # Frameworks, méthodologies, personas
├── business/          # Vision, business plan, master plan
└── technical/         # Architecture, patterns, décisions
```

**Cas d'usage** :
- 📚 **Coaching** : Design Humain, approche unique, personas clients
- 🎯 **Business** : Voschinkoff (vision, offres, roadmap), master plan
- 🏗️ **Technique** : Architecture, patterns, ADR

**Commandes Knowledge** :
```bash
/knowledge init              # Initialiser structure
/knowledge ingest <file>     # Ingérer documents
  --category <cat>
/knowledge search <query>    # Rechercher dans base
/knowledge stats             # Statistiques
```

**Consultation automatique** :
Claude consulte la Knowledge Library quand keywords détectés (coaching, business, voschinkoff, etc.).

**Exemple** :
```
User: "Écris un post sur l'authenticité en business"
Claude:
  → Consulte knowledge/coaching/frameworks/shinkofa.md
  → Consulte knowledge/business/voschinkoff/vision.md
  → Génère post aligné avec TON message unique
```

**Quick Start** :
1. `/knowledge init`
2. Créer 3 docs minimum :
   - `knowledge/coaching/mon-approche.md`
   - `knowledge/business/ma-vision.md`
   - `knowledge/business/mes-offres.md`
3. `/knowledge ingest knowledge/**/*.md --category [cat]`

**Voir** : [knowledge/README.md](knowledge/README.md)

---

## 🔄 Workflow Standard

```
1. AUDIT   → Lis docs pertinents + code existant
2. PLAN    → Propose 2-3 options + trade-offs
3. ATTENDS → Validation Jay OBLIGATOIRE
4. CODE    → Petits commits, tests, agents
5. BILAN   → Résume changements, next steps
```

**Checkpoint obligatoire** : "Valides-tu ce plan ?" avant toute implémentation.

---

## 🤖 Agents Disponibles

| Agent | Déclencheur | Commande |
|-------|-------------|----------|
| **Context-Guardian** | Début session | Automatique |
| **Code-Reviewer** | Avant commit | `/pre-commit` |
| **Build-Deploy-Test** | Build/deploy/test | `/deploy` |
| **Debug-Investigator** | Bug/erreur | `/debug` |
| **Refactor-Safe** | Refactor > 3 fichiers | Automatique |
| **Security-Guardian** | Deploy PROD | Automatique |

### Règles Agents

```
⚠️ AVANT commit  → /pre-commit (Code-Reviewer)
⚠️ AVANT build   → Build-Deploy-Test Agent
⚠️ AVANT deploy  → Vérif env + Security-Guardian (si PROD)
⚠️ SI refactor   → Refactor-Safe (max 3 fichiers/commit)
```

---

## 📍 Session State

**Vérifier `.claude/session-state.md` AVANT toute action PROD/ALPHA** :

```markdown
## Environnement Actuel
| Target | PROD / ALPHA / LOCAL |
| Branche | main / develop / feature/* |
| Projet | [nom] |
```

**SI absent** : Demander clarification environnement avant de continuer.

---

## 🎨 Standards Projet

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | [voir CODING_STANDARDS.md] | `user_name` / `userName` |
| Fonctions | [voir CODING_STANDARDS.md] | `get_user()` / `getUser()` |
| Classes | PascalCase | `UserService` |
| Fichiers | [voir CODING_STANDARDS.md] | `user_service.py` |

### Commits (Conventional Commits)

```
type(scope): description

Types : feat, fix, docs, style, refactor, test, chore
Exemples :
  feat(auth): add JWT refresh token support
  fix(api): handle null response from service
  docs(readme): update installation instructions
```

### Branches

```
main                # Production
develop             # Development
feature/name        # Nouvelles features
fix/bug-name        # Bug fixes
```

---

## 🏗️ Architecture Rapide

**Stack** :
- **Frontend** : [Framework] (voir ARCHITECTURE.md)
- **Backend** : [Framework] (voir ARCHITECTURE.md)
- **Database** : [DB] (voir DATABASE_SCHEMA.md)
- **Cache** : [Redis/etc] (voir ARCHITECTURE.md)

**Voir ARCHITECTURE.md pour détails complets.**

---

## 🧪 Tests

**Framework** : [Jest / pytest / etc]

**Commandes** :
```bash
[npm test / pytest]               # Tous les tests
[npm run test:unit]               # Tests unitaires
[npm run test:integration]        # Tests intégration
[npm run test:e2e]                # Tests E2E
```

**Coverage minimum** : 80%

**Voir TESTING_GUIDE.md pour patterns complets.**

---

## 🐳 Docker

**Configuration centralisée** : `.claude/docker/`

### Quick Start

```bash
# Copier variables d'environnement
cp .claude/docker/.env.example .claude/docker/.env

# Éditer .env
nano .claude/docker/.env

# Démarrer en mode développement
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.dev.yml up -d

# Voir logs
docker-compose -f .claude/docker/docker-compose.yml logs -f
```

### Structure Docker

```
.claude/docker/
├── docker-compose.yml           # Base (app, db, redis)
├── docker-compose.dev.yml       # Override dev (hot-reload, ports exposés)
├── docker-compose.prod.yml      # Override prod (nginx, SSL, optimisé)
├── Dockerfile                   # Multi-stage (dev + prod)
├── .env.example                 # Template variables
├── nginx/                       # Config nginx (prod)
│   ├── nginx.conf
│   └── conf.d/app.conf
└── README.md                    # Documentation complète
```

### Environnements

**Développement** :
- Hot-reload code
- Ports exposés (accès direct DB, Redis)
- Services debug (pgAdmin, Mailhog)

**Production** :
- Code dans image (pas de mount)
- Nginx reverse proxy + SSL
- Rate limiting
- Backup automatisé

### Commandes Essentielles

```bash
# Aliases (ajouter dans ~/.bashrc)
alias dc='docker-compose -f .claude/docker/docker-compose.yml'
alias dcdev='docker-compose -f .claude/docker/docker-compose.yml -f .claude/docker/docker-compose.dev.yml'

# Usage
dcdev up -d              # Start dev
dcdev logs -f app        # Logs
dcdev exec app bash      # Shell dans container
dcdev down               # Stop
```

**Voir `.claude/docker/README.md` pour documentation complète.**

---

## 🚀 Build & Deploy

### Local Development

```bash
# Installation
[npm install / pip install -r requirements.txt]

# Run dev server
[npm run dev / python main.py]

# Build
[npm run build / docker build -t app .]
```

### Déploiement

**⚠️ AVANT deploy** :
1. Vérifier `.claude/session-state.md`
2. Lancer `/pre-commit`
3. Lancer `/deploy` (cycle complet)
4. SI PROD → Security-Guardian automatique

**Voir ARCHITECTURE.md section Déploiement.**

---

## 📝 Commandes Utiles

### Documentation

```bash
/rag-status          # État documentation projet
/init-rag            # Initialiser structure doc
/search-registry     # Chercher patterns/lessons
```

### Développement

```bash
/check-duplicate     # Vérifier si fonction/pattern existe
/pre-commit          # Review avant commit
/debug               # Investigation bug méthodique
```

### Déploiement

```bash
/deploy              # Cycle deploy complet
/context             # Voir/modifier état session
```

---

## 🔗 Fichiers Importants

| Fichier | Contenu |
|---------|---------|
| `.claude/docs/ARCHITECTURE.md` | Architecture complète système |
| `.claude/docs/API_REFERENCE.md` | Documentation API |
| `.claude/docs/DATABASE_SCHEMA.md` | Schéma DB |
| `.claude/docs/CODING_STANDARDS.md` | Standards code |
| `.claude/docs/CONTEXT.md` | Contexte métier, business rules |
| `.claude/session-state.md` | État session actuelle |
| `README.md` | Setup projet, getting started |

---

## ⚠️ Règles Absolues

1. **TOUJOURS** lire documentation pertinente AVANT d'agir
2. **JAMAIS** commit sans `/pre-commit`
3. **JAMAIS** deploy PROD sans vérification env
4. **JAMAIS** dire "ça devrait marcher" → PROUVER
5. **TOUJOURS** proposer options, JAMAIS imposer
6. **TOUJOURS** documenter nouvelles décisions

---

## 🎯 Spécificités Projet

### [Section Spécifique 1]

[Ajouter spécificités uniques à ce projet]

### [Section Spécifique 2]

[Ajouter règles business spécifiques]

---

## 🔧 Environnement

**Local** : [Description setup local]
**Staging** : [URL/description]
**Production** : [URL/description]

---

## 👥 Équipe

**Responsable** : [Nom]
**Contact** : [Email/Slack]

---

## 📊 Métriques Projet

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Coverage tests | >80% | [valeur] |
| Performance API | <200ms | [valeur] |
| Uptime | 99.9% | [valeur] |

---

**Version** : 1.0
**Dernière MAJ** : [DATE]
**Maintenu par** : [Équipe]

---

## 💡 Note pour Claude

Ce fichier est ta source de vérité pour ce projet spécifique.

**Hiérarchie instructions** :
1. Ce fichier (CLAUDE.md) - Spécifique projet
2. Documentation `.claude/docs/` - Contexte détaillé
3. Instructions globales Instruction-Claude-Code - Méthodologie

En cas de conflit : Les instructions plus spécifiques (1) prévalent sur les générales (3).

**Rappel RAG** : Consulte TOUJOURS `.claude/docs/` avant d'agir. Cette documentation contient le contexte critique du projet.
