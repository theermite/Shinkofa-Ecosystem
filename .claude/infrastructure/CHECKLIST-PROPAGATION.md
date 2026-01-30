# Checklist Propagation Méthodologie v4.0

> Checklist détaillée pour propager les améliorations vers un projet spécifique.

**Utiliser avec** : `PLAN-PROPAGATION-PROJETS.md` (vue d'ensemble)
**Script automatisation** : `.claude/scripts/propagate-to-project.sh`

---

## 📋 Checklist Complète

### 🎯 Projet : ___________________________

**Date** : ____ / ____ / ______
**Durée estimée** : 30-60 minutes
**Priorité** : [ ] Absolue [ ] Haute [ ] Moyenne [ ] Basse

---

## Phase 1 : Préparation (5 min)

### Backup & Branche

- [ ] Naviguer vers projet
  ```bash
  cd ~/projets/[NOM-PROJET]
  ```

- [ ] Vérifier statut git propre
  ```bash
  git status
  ```

- [ ] Commit changements uncommitted si nécessaire

- [ ] Créer feature branch
  ```bash
  git checkout -b feature/methodologie-v4
  ```

- [ ] **Résultat attendu** : Sur branche `feature/methodologie-v4`, working directory clean

---

## Phase 2 : Automatisation (10 min)

### Script Propagation

- [ ] Exécuter script propagation (dry-run first)
  ```bash
  ~/projets/Instruction-Claude-Code/Prompt-2026-Optimized/.claude/scripts/propagate-to-project.sh ~/projets/[NOM-PROJET] --dry-run
  ```

- [ ] Vérifier output dry-run (pas d'erreurs)

- [ ] Exécuter script réel
  ```bash
  ~/projets/Instruction-Claude-Code/Prompt-2026-Optimized/.claude/scripts/propagate-to-project.sh ~/projets/[NOM-PROJET]
  ```

- [ ] Vérifier structure créée
  ```bash
  tree .claude/
  ```

- [ ] **Résultat attendu** : Structure `.claude/` complète avec agents, commands, scripts, knowledge, docker, docs

**Ce que le script a fait** :
- ✅ Créé structure `.claude/`
- ✅ Copié 7 agents
- ✅ Copié 10+ commandes
- ✅ Copié scripts Python
- ✅ Copié configs Docker
- ✅ Copié templates documentation
- ✅ Initialisé Knowledge Library
- ✅ Copié CLAUDE.md template
- ✅ Git add automatique

---

## Phase 3 : Adaptation Manuelle (15 min)

### CLAUDE.md (CRITIQUE)

- [ ] Ouvrir `.claude/CLAUDE.md`

- [ ] Adapter section "Identité" si nécessaire

- [ ] **Adapter section "Comportement dans ce Projet"** :
  ```markdown
  ## ⚙️ Comportement dans ce Projet

  **[NOM-PROJET]** : [Description 1 phrase]

  **Stack** :
  - Frontend : [Framework + version]
  - Backend : [Framework + version]
  - Database : [DB + version]
  - Hosting : [Où hébergé]

  **Priorités** :
  1. [Priorité 1]
  2. [Priorité 2]
  3. [Priorité 3]

  **Architecture** :
  [Description brève architecture]
  ```

- [ ] Vérifier références fichiers (paths corrects)

- [ ] Ajouter contexte spécifique projet si applicable

- [ ] **Résultat attendu** : CLAUDE.md adapté au contexte projet

---

### Docker (si applicable)

- [ ] Ouvrir `.claude/docker/.env.example`

- [ ] **Adapter variables** au projet :
  - [ ] Database name
  - [ ] Service ports
  - [ ] API keys si nécessaire
  - [ ] Domain name

- [ ] Renommer `.env.example` → `.env` (local uniquement, pas commit)

- [ ] Si stack custom, adapter `docker-compose.yml`

- [ ] **Résultat attendu** : Docker configs adaptés au projet

---

## Phase 4 : Génération Documentation (10 min)

### Documentation Automatique

- [ ] Générer documentation complète
  ```bash
  /doc-generate
  ```

- [ ] **Attendre** : 3-5 minutes (selon taille projet)

- [ ] Vérifier fichiers générés :
  - [ ] `.claude/docs/API_REFERENCE.md`
  - [ ] `.claude/docs/DATABASE_SCHEMA.md`
  - [ ] `.claude/docs/ARCHITECTURE.md`
  - [ ] `.claude/docs/CODING_STANDARDS.md`
  - [ ] `.claude/docs/TESTING_GUIDE.md`
  - [ ] `.claude/docs/CONTEXT.md`
  - [ ] `.claude/docs/CHANGELOG.md`
  - [ ] `.claude/docs/KNOWN_ISSUES.md`

- [ ] Noter score qualité documentation : _____%

- [ ] **Résultat attendu** : 8 fichiers docs générés, score > 80%

---

### Vérification Qualité

- [ ] Vérifier documentation synchronisée
  ```bash
  /doc-check
  ```

- [ ] Noter problèmes identifiés : ________

- [ ] Si score < 80%, améliorer :
  - [ ] Ajouter docstrings manquants
  - [ ] Corriger exemples invalides
  - [ ] Relancer `/doc-update`

- [ ] **Résultat attendu** : Score qualité > 90% (idéal)

---

## Phase 5 : Review & Commit (10 min)

### Review Changements

- [ ] Vérifier fichiers ajoutés
  ```bash
  git status
  ```

- [ ] Review fichiers modifiés
  ```bash
  git diff .claude/
  ```

- [ ] Vérifier que tout est intentionnel

- [ ] Supprimer fichiers temporaires si créés

---

### Commit

- [ ] Commit avec message structuré
  ```bash
  git add .claude/

  git commit -m "feat: Integrate methodology v4.0 (Phase 1+2)

  - Add Project Planner Agent (planning projets structuré)
  - Add Documentation Generator Agent (docs auto-sync)
  - Add Knowledge Library System (expertise domaine)
  - Add Docker centralized config
  - Add standard docs structure (8 fichiers)
  - Add modular registries support
  - Add 10 new commands

  Phase 1 (Quick Wins):
  - Modular Registries (leçons fragmentées)
  - Structure docs/ standard
  - RAG workflow obligatoire
  - Docker centralisé

  Phase 2 (Advanced):
  - Knowledge Library (coaching, business Shinkofa)
  - Templates ultra-détaillés (4 projets)
  - Project Planner Agent (8 steps workflow)
  - Documentation Generator Agent (AST parsing)

  Generated documentation:
  - Score qualité: [XX]%
  - Endpoints documentés: [XX]/[XX]
  - Functions documentées: [XX]/[XX]

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  ```

- [ ] **Résultat attendu** : Commit créé avec message détaillé

---

### Push & PR

- [ ] Push feature branch
  ```bash
  git push origin feature/methodologie-v4
  ```

- [ ] Créer Pull Request (GitHub/GitLab)

- [ ] Titre PR : `feat: Integrate methodology v4.0 (Phase 1+2)`

- [ ] Description PR : Copier résumé du commit

- [ ] Assigner à reviewer (soi-même si solo)

- [ ] **Résultat attendu** : PR créée et prête pour review

---

## Phase 6 : Validation (5 min)

### Tests & Vérifications

- [ ] Si tests existent, les lancer
  ```bash
  npm test  # OU pytest
  ```

- [ ] Vérifier que tests passent

- [ ] Si Docker, vérifier que build fonctionne
  ```bash
  ./.claude/docker/dc.sh build
  ```

- [ ] Tester commandes nouvelles :
  - [ ] `/knowledge stats` (devrait montrer 0 docs)
  - [ ] `/doc-check` (devrait afficher score)
  - [ ] `/search-registry "test"` (devrait chercher)

- [ ] **Résultat attendu** : Tout fonctionne, pas de régression

---

### Merge (si approuvé)

- [ ] Review PR approuvée

- [ ] Merge PR vers main/develop

- [ ] Pull main localement
  ```bash
  git checkout main
  git pull origin main
  ```

- [ ] Supprimer feature branch locale
  ```bash
  git branch -d feature/methodologie-v4
  ```

- [ ] **Résultat attendu** : Méthodologie v4.0 intégrée dans main

---

## 📊 Post-Propagation

### Enrichissement (optionnel, post-propagation tous projets)

- [ ] Ingérer contenu coaching Shinkofa
  ```bash
  /knowledge ingest ~/Documents/Coaching/*.md --category coaching
  ```

- [ ] Ingérer business plan Shinkofa
  ```bash
  /knowledge ingest ~/Documents/Shinkofa/Business-Plan.pdf --category business
  ```

- [ ] Vérifier indexation
  ```bash
  /knowledge stats
  ```

- [ ] Tester recherche
  ```bash
  /knowledge search "design humain"
  ```

---

### Documentation Continue

- [ ] Configurer pre-commit hook (optionnel)
  ```bash
  # Copier hook template
  cp .claude/scripts/pre-commit-hook.sh .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  ```

- [ ] Tester workflow :
  ```bash
  # Modifier code
  # /doc-update (automatique si hook)
  # /pre-commit
  # git commit
  ```

---

## ✅ Critères de Succès

### Validation Technique

- [x] Structure `.claude/` complète (7 agents, 10 commands, scripts, knowledge, docker, docs)
- [x] Documentation générée (8 fichiers)
- [x] Score qualité docs > 80%
- [x] CLAUDE.md adapté contexte projet
- [x] Knowledge Library initialisée
- [x] Tests passent (si existants)
- [x] PR créée et merged

### Validation Fonctionnelle

- [x] Commandes fonctionnent :
  - `/doc-generate` → Génère docs
  - `/doc-update` → Update docs
  - `/doc-check` → Vérifie qualité
  - `/plan-project` → Génère plan
  - `/knowledge` → Fonctionne (même vide)
  - `/search-registry` → Recherche leçons

- [x] Docker fonctionne (si applicable)
- [x] Pas de régression (tests passent)

---

## 🚨 Troubleshooting

### Problème : Script propagation échoue

**Symptôme** : Erreurs lors exécution script

**Solutions** :
1. Vérifier permissions : `chmod +x propagate-to-project.sh`
2. Vérifier paths source corrects
3. Exécuter en mode dry-run pour debug
4. Copier manuellement si script bloqué

---

### Problème : /doc-generate échoue

**Symptôme** : Erreur "command not found" ou parsing errors

**Solutions** :
1. Vérifier que commande existe : `ls .claude/commands/doc-generate.md`
2. Vérifier syntaxe code (linting)
3. Essayer `/doc-generate --verbose` pour détails
4. Si persistant, copier templates manuellement

---

### Problème : Score qualité docs < 80%

**Symptôme** : Documentation incomplète

**Solutions** :
1. Ajouter docstrings/JSDoc manquants
2. Documenter endpoints dans code source
3. Corriger exemples code invalides
4. Relancer `/doc-update`
5. Accepter score initial si projet legacy (améliorer progressivement)

---

### Problème : Conflits avec configs existantes

**Symptôme** : Docker/docs déjà présents et différents

**Solutions** :
1. Backup configs existantes
2. Comparer manuellement (`diff`)
3. Merge intelligent (garder spécificités + ajouter nouveautés)
4. Documenter décisions dans CONTEXT.md

---

## 📝 Notes Session

**Projet** : _______________________________

**Durée réelle** : _______ minutes

**Problèmes rencontrés** :
-
-
-

**Adaptations nécessaires** :
-
-
-

**Score final documentation** : _______%

**Prochaines actions** :
-
-
-

**Leçons apprises** (ajouter dans Modular Registries) :
```bash
/search-registry "propagation" --category workflow
# Ajouter nouvelle leçon si applicable
```

---

## 🎯 Prochains Projets

Après validation de ce projet, propager vers :

1. [ ] _________________________________ (Priorité : ______)
2. [ ] _________________________________ (Priorité : ______)
3. [ ] _________________________________ (Priorité : ______)

**Planning** :
- Session 1 (2h) : Projets 1-2
- Session 2 (2h) : Projets 3-4
- Session 3 (2h) : Projets 5+

---

**Checklist Version** : 1.0
**Date création** : 2026-01-26
**Dernière mise à jour** : 2026-01-26
**Créé par** : Claude Code (Takumi)
