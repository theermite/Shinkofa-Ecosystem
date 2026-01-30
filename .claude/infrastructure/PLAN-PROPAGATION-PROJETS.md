# Plan de Propagation - Méthodologie Améliorée

> Guide pour propager les améliorations Phase 1 + Phase 2 vers tous les projets Jay The Ermite.

**Date création** : 2026-01-26
**Source** : Instruction-Claude-Code (dépôt central)
**Statut** : Prêt pour exécution

---

## 🎯 Objectif

Propager les améliorations méthodologiques vers tous les projets actifs par ordre de priorité, en adaptant au contexte de chaque projet.

**Améliorations à propager** :
- ✅ Modular Registries (leçons fragmentées)
- ✅ Structure docs/ standard (8 fichiers)
- ✅ RAG workflow obligatoire
- ✅ Docker centralisé `.claude/docker/`
- ✅ Knowledge Library System
- ✅ Templates production-ready
- ✅ Project Planner Agent
- ✅ Documentation Generator Agent
- ✅ 10 nouvelles commandes

---

## 📋 Ordre de Priorité

### Niveau 1 : Priorité ABSOLUE (Cette semaine)

**1. Shinkofa-Platform**
- Plateforme principale voie Shinkofa
- Importance stratégique maximale
- Template recommandé : `nextjs-app` (SEO crucial)

**2. SLF-Esport**
- Projet actif avec développement continu
- Template recommandé : `fastapi-react` ou `nextjs-app`

### Niveau 2 : Priorité HAUTE (Cette semaine)

**3. Hibiki-Dictate**
- Outil de dictée/transcription
- Template recommandé : Adapter existant ou `cli-tool`

**4. Social-Content-Master**
- Gestion contenu social media
- Template recommandé : Adapter existant

### Niveau 3 : Priorité MOYENNE (Semaine prochaine)

**5. Ermite-Game** (local AI)
**6. Dell-Ermite** (local AI)
**7. Claude-Agents-Dev**
**8. Python-Tools**

### Niveau 4 : Priorité BASSE (Quand disponible)

**9. Autres projets** du Projects-Registry

---

## 📦 Checklist Propagation Universelle

Pour CHAQUE projet, suivre cette checklist :

### Étape 1 : Préparation (5 min)

- [ ] Ouvrir projet dans Claude Code
- [ ] Créer branche `feature/methodologie-v4`
- [ ] Faire backup (commit) état actuel si changements uncommitted

```bash
cd ~/projets/[NOM-PROJET]
git checkout -b feature/methodologie-v4
git status  # Vérifier clean
```

### Étape 2 : Structure .claude/ (10 min)

- [ ] Créer/Compléter structure `.claude/`

```bash
mkdir -p .claude/{agents,commands,scripts,knowledge,docker,docs}
```

- [ ] Copier agents depuis dépôt central

```bash
# Depuis Instruction-Claude-Code
cp -r Prompt-2026-Optimized/agents/Project-Planner .claude/agents/
cp -r Prompt-2026-Optimized/agents/Documentation-Generator .claude/agents/

# Agents existants (si pas déjà présents)
cp -r Prompt-2026-Optimized/agents/Context-Guardian .claude/agents/
cp -r Prompt-2026-Optimized/agents/Build-Deploy-Test .claude/agents/
cp -r Prompt-2026-Optimized/agents/Code-Reviewer .claude/agents/
cp -r Prompt-2026-Optimized/agents/Debug-Investigator .claude/agents/
cp -r Prompt-2026-Optimized/agents/Refactor-Safe .claude/agents/
```

- [ ] Copier commandes

```bash
cp Instruction-Claude-Code/Prompt-2026-Optimized/.claude/commands/*.md .claude/commands/
```

- [ ] Copier scripts

```bash
cp Instruction-Claude-Code/Prompt-2026-Optimized/.claude/scripts/*.py .claude/scripts/
```

### Étape 3 : Docker Centralisé (5 min)

- [ ] Copier configuration Docker

```bash
cp -r Instruction-Claude-Code/Prompt-2026-Optimized/.claude/docker .claude/
```

- [ ] Adapter `.env.example` au projet
- [ ] Adapter `docker-compose.yml` si stack spécifique

### Étape 4 : Documentation Standard (10 min)

- [ ] Créer structure docs/ si absente

```bash
mkdir -p .claude/docs
```

- [ ] Copier templates documentation

```bash
cp Instruction-Claude-Code/Prompt-2026-Optimized/templates/generic-project/.claude/docs/*.md .claude/docs/
```

- [ ] **GÉNÉRER** documentation projet

```bash
/doc-generate
```

Cela va scanner le code et générer automatiquement :
- API_REFERENCE.md
- DATABASE_SCHEMA.md
- ARCHITECTURE.md
- CODING_STANDARDS.md
- TESTING_GUIDE.md
- CONTEXT.md
- CHANGELOG.md
- KNOWN_ISSUES.md

### Étape 5 : Knowledge Library (5 min)

- [ ] Initialiser Knowledge Library

```bash
/knowledge init
```

- [ ] Structure créée automatiquement :
```
.claude/knowledge/
├── config.json
├── index.json
├── coaching/
├── business/
└── technical/
```

**Note** : Le contenu coaching/business Shinkofa sera ingéré APRÈS propagation vers tous projets (session dédiée).

### Étape 6 : CLAUDE.md Adapté (10 min)

- [ ] Copier CLAUDE.md template

```bash
cp Instruction-Claude-Code/.claude/CLAUDE.md .claude/
```

- [ ] **ADAPTER** sections spécifiques projet :
  - Remplacer `Instruction-Claude-Code` par nom projet
  - Adapter section "Comportement dans ce projet"
  - Ajouter contexte spécifique (stack, architecture, priorités)

**Exemple adaptation** :
```markdown
## ⚙️ Comportement dans ce Projet

**Shinkofa-Platform** : Plateforme principale voie Shinkofa

**Stack** :
- Frontend : Next.js 14 (App Router)
- Backend : API Routes Next.js
- Database : PostgreSQL + Prisma
- Hosting : Vercel

**Priorités** :
1. SEO optimal (SSR/SSG)
2. Accessibilité universelle (WCAG 2.1 AA+)
3. Performance (Core Web Vitals)
4. Design Shinkofa (authenticité, inclusivité)
```

### Étape 7 : Commit & Vérification (5 min)

- [ ] Commit changements structure

```bash
git add .claude/
git commit -m "feat: Integrate methodology v4.0 (Phase 1+2)

- Add Project Planner Agent
- Add Documentation Generator Agent
- Add Knowledge Library System
- Add Docker centralized config
- Add standard docs structure
- Add modular registries support
- Add 10 new commands

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

- [ ] Vérifier documentation générée

```bash
/doc-check
# Score devrait être > 80%
```

- [ ] Push branche

```bash
git push origin feature/methodologie-v4
```

---

## 🎯 Plans Spécifiques par Projet

### 1. Shinkofa-Platform

**Contexte** :
- Plateforme principale voie Shinkofa
- SEO crucial
- Accessibilité universelle (WCAG 2.1 AA+)
- Design authentique Shinkofa

**Template recommandé** : `nextjs-app` (si refonte) OU adapter existant

**Actions spécifiques** :
1. Checklist universelle (ci-dessus)
2. Générer docs complète (`/doc-generate`)
3. Planifier prochaine feature majeure avec `/plan-project`
4. Ingérer business plan Shinkofa dans Knowledge Library

```bash
/knowledge ingest ~/Documents/Shinkofa/*.md --category business
/knowledge ingest ~/Documents/Shinkofa/Business-Plan.pdf --category business
```

5. Vérifier architecture documentée (`ARCHITECTURE.md`)
6. Setup CI/CD avec doc-check

**Durée estimée** : 1 heure

---

### 2. SLF-Esport

**Contexte** :
- Plateforme esport
- Développement actif
- Stack à identifier

**Template recommandé** : Identifier stack actuelle puis adapter ou appliquer template

**Actions spécifiques** :
1. Checklist universelle
2. Identifier stack actuelle
3. Si compatible, appliquer template `fastapi-react` ou `nextjs-app`
4. Générer docs (`/doc-generate`)
5. Vérifier couverture tests (`TESTING_GUIDE.md`)

**Durée estimée** : 45 minutes

---

### 3. Hibiki-Dictate

**Contexte** :
- Outil dictée/transcription
- Potentiellement Electron ou CLI

**Template recommandé** : `electron-app` (si desktop) ou `cli-tool` (si CLI)

**Actions spécifiques** :
1. Checklist universelle
2. Identifier architecture (desktop vs CLI vs web)
3. Appliquer template approprié si refonte souhaitée
4. Générer docs
5. Documenter workflow transcription

**Durée estimée** : 30 minutes

---

### 4. Social-Content-Master

**Contexte** :
- Gestion contenu social media
- Automatisation

**Template recommandé** : Adapter existant ou `cli-tool`

**Actions spécifiques** :
1. Checklist universelle
2. Générer docs
3. Documenter APIs sociales utilisées (`API_REFERENCE.md`)
4. Setup pre-commit hooks

**Durée estimée** : 30 minutes

---

### 5-8. Projets Niveau 3 (AI local, dev tools)

**Actions standardisées** :
1. Checklist universelle (5-10 min par projet)
2. Pas de refonte nécessaire
3. Focus : Documentation + Knowledge Library

**Durée estimée** : 20 minutes chacun

---

### 9+. Autres Projets (Niveau 4)

**Actions minimales** :
1. Copier structure `.claude/` basique
2. Générer docs si projet actif
3. Skip si projet archivé/inactif

**Durée estimée** : 10 minutes chacun

---

## ⏱️ Estimations Temps Total

| Niveau | Projets | Temps/Projet | Total |
|--------|---------|--------------|-------|
| Niveau 1 | 2 | 45-60 min | 2h |
| Niveau 2 | 2 | 30 min | 1h |
| Niveau 3 | 4 | 20 min | 1h20 |
| Niveau 4 | ~10 | 10 min | 1h40 |

**Total estimé** : ~6 heures
**Répartition recommandée** : 2-3 sessions de 2h sur 2-3 jours

---

## 🔧 Script Automatisation (Bonus)

Voir `scripts/propagate-to-project.sh` pour automatisation partielle.

**Usage** :
```bash
./scripts/propagate-to-project.sh ~/projets/Shinkofa-Platform
```

Le script :
1. Copie structure `.claude/`
2. Initialise Knowledge Library
3. Setup Docker
4. Génère documentation
5. Commit changements

**Nécessite toujours** : Adaptation manuelle CLAUDE.md + Review

---

## ✅ Critères de Succès

### Par Projet

- [x] Structure `.claude/` complète (agents, commands, scripts, knowledge, docker, docs)
- [x] Documentation générée (`/doc-generate`)
- [x] Score qualité docs > 80% (`/doc-check`)
- [x] CLAUDE.md adapté au contexte projet
- [x] Knowledge Library initialisée
- [x] Commit feature branch
- [x] Tests passent (si existants)

### Global

- [x] 4 projets prioritaires (Niveau 1+2) propagés semaine 1
- [x] 4 projets niveau 3 propagés semaine 2
- [x] Documentation homogène tous projets
- [x] Knowledge Library enrichie (coaching + business Shinkofa)

---

## 🚨 Points d'Attention

### Conflits Potentiels

**Si `.claude/` existe déjà** :
- Merge intelligemment (ne pas écraser configs spécifiques)
- Backup avant propagation

**Si Docker déjà configuré** :
- Comparer configs
- Migrer vers centralisé progressivement
- Garder configs spécifiques en overrides

**Si docs déjà existantes** :
- `/doc-update` au lieu de `/doc-generate`
- Préserver sections manuelles importantes

### Adaptations Nécessaires

**Stack non standard** :
- Templates sont guides, pas obligations
- Adapter structure aux besoins réels
- Documenter décisions dans `CONTEXT.md`

**Projets legacy** :
- Propagation minimale (structure + docs)
- Pas de refonte si non critique
- Focus Knowledge Library + leçons

---

## 📊 Tracking Propagation

### Session 1 (2h) : Priorités Absolues

- [ ] Shinkofa-Platform (1h)
- [ ] SLF-Esport (45min)
- [ ] Test validation (15min)

### Session 2 (2h) : Priorités Hautes

- [ ] Hibiki-Dictate (30min)
- [ ] Social-Content-Master (30min)
- [ ] Ermite-Game (20min)
- [ ] Dell-Ermite (20min)
- [ ] Buffer / documentation (20min)

### Session 3 (2h) : Nettoyage & Enrichissement

- [ ] Claude-Agents-Dev (20min)
- [ ] Python-Tools (20min)
- [ ] Projets niveau 4 batch (1h)
- [ ] Enrichir Knowledge Library (20min)

---

## 🎓 Post-Propagation

### Immédiat

**Ingérer contenu Shinkofa** :
```bash
# Dans Instruction-Claude-Code
cd Prompt-2026-Optimized/templates/generic-project/.claude/knowledge

# Ingérer coaching
/knowledge ingest ~/Documents/Coaching/*.md --category coaching

# Ingérer business plan Shinkofa
/knowledge ingest ~/Documents/Shinkofa/Business-Plan.pdf --category business
/knowledge ingest ~/Documents/Shinkofa/Strategy.md --category business
```

**Partager Knowledge Library** :
La Knowledge Library est dans le template `generic-project`. Après ingestion, copier vers projets :
```bash
# Copier index enrichi vers projets
for project in Shinkofa-Platform SLF-Esport ...; do
  cp -r .claude/knowledge ~/projets/$project/.claude/
done
```

### Court Terme

**Tester commandes** :
```bash
# Planifier feature
/plan-project "Description feature majeure"

# Générer docs
/doc-generate

# Rechercher leçons
/search-registry "stripe webhook"

# Consulter expertise
/knowledge search "design humain projecteur"
```

**Setup hooks** :
```bash
# Pre-commit automatique
./claude/docker/setup-hooks.sh
```

---

## 📖 Ressources

**Documentation** :
- `RAPPORT-INTEGRATION-EXOMONDO-COMPLETE.md` - Vue d'ensemble complète
- `templates/README.md` - Comparaison templates
- `.claude/commands/*.md` - Documentation commandes
- `agents/*/AGENT.md` - Spécifications agents

**Scripts** :
- `scripts/propagate-to-project.sh` - Automatisation propagation
- `scripts/knowledge-manager.py` - Gestion Knowledge Library
- `scripts/rag-manager.py` - Gestion RAG

---

## 🎯 Prochaine Étape

**COMMENCER PAR** : Shinkofa-Platform (priorité absolue)

```bash
cd ~/projets/Shinkofa-Platform
git checkout -b feature/methodologie-v4

# Suivre checklist universelle (Étapes 1-7)
# Durée : ~1h

# Puis commit + push + créer PR
```

**Questions / Blocages** : Documenter dans session Claude Code

---

**Créé par** : Claude Code (Takumi)
**Date** : 2026-01-26
**Version** : 1.0
**Statut** : ✅ Prêt pour exécution
