# Knowledge Library - [Nom Projet]

> Base de connaissances personnalisée pour enrichir le contexte de Claude.

**Version** : 1.0
**Dernière mise à jour** : [DATE]

---

## 🎯 Objectif

La Knowledge Library permet de créer une **base de connaissances spécifique à ton domaine** que Claude consulte automatiquement avant chaque action.

**Cas d'usage** :
- 📚 **Coaching** : Frameworks, méthodologies, personas clients
- 🎯 **Business** : Vision/mission, business plan, positionnement
- 🏗️ **Projets** : Architecture, décisions, master plan
- 🧠 **Expertise** : Ton savoir unique, patterns, apprentissages

---

## 🏗️ Structure

```
.claude/knowledge/
├── README.md                    # Ce fichier
├── index.json                   # Index automatique (géré par système)
├── config.json                  # Configuration Knowledge Library
│
├── coaching/                    # Catégorie : Coaching
│   ├── frameworks/
│   │   ├── design-humain.md
│   │   ├── profil-projecteur.md
│   │   ├── neuroatypie-hpi.md
│   │   └── shinkofa-philosophie.md
│   ├── methodologies/
│   │   ├── sessions-structure.md
│   │   ├── questionnements.md
│   │   └── outils-pratiques.md
│   └── personas/
│       ├── multipotentiels.md
│       ├── entrepreneurs-conscients.md
│       └── leaders-authentiques.md
│
├── business/                    # Catégorie : Business
│   ├── voschinkoff/
│   │   ├── vision-mission.md
│   │   ├── business-model.md
│   │   ├── offres-services.md
│   │   ├── pricing-strategy.md
│   │   └── roadmap-2026.md
│   ├── master-plan/
│   │   ├── ecosystem-overview.md
│   │   ├── projects-dependencies.md
│   │   ├── timeline-phases.md
│   │   └── resource-allocation.md
│   └── marketing/
│       ├── positioning.md
│       ├── content-strategy.md
│       └── channels.md
│
└── technical/                   # Catégorie : Technique (projet-specific)
    ├── architecture/
    │   ├── system-design.md
    │   └── tech-decisions.md
    └── patterns/
        ├── coding-patterns.md
        └── best-practices.md
```

---

## 🚀 Quick Start

### 1. Initialiser la Knowledge Library

```bash
/knowledge init

# Ou manuellement
mkdir -p .claude/knowledge/{coaching,business,technical}
python .claude/scripts/knowledge-manager.py init
```

### 2. Ajouter des Documents

**Créer directement** :
```bash
# Créer un document
nano .claude/knowledge/coaching/frameworks/design-humain.md
```

**Ingérer documents existants** :
```bash
# Ingérer tous les .md d'un dossier
/knowledge ingest ~/Documents/Coaching/*.md --category coaching/frameworks

# Ingérer PDF
/knowledge ingest business-plan.pdf --category business/voschinkoff

# Ingérer dossier entier
/knowledge ingest ~/Voschinkoff-Docs/ --category business --recursive
```

### 3. Rechercher

```bash
# Recherche simple
/knowledge search "projecteur design humain"

# Recherche dans catégorie spécifique
/knowledge search "business model" --category business

# Recherche avec contexte
/knowledge search "coaching multipotentiels" --context 500
```

### 4. Consultation Automatique

Une fois configuré, **Claude consulte automatiquement** la Knowledge Library.

**Exemple** :
```
User: "Aide-moi à créer une offre coaching pour multipotentiels"

Claude (automatique):
1. Détecte keywords → "coaching", "multipotentiels"
2. Query Knowledge Library → coaching/personas/multipotentiels.md
3. Query Knowledge Library → coaching/frameworks/
4. Query Knowledge Library → business/voschinkoff/offres-services.md
5. Génère réponse enrichie de TON expertise
```

---

## 📋 Workflow Complet (5 Phases)

### Phase 1 : DISCOVER

Scan documents disponibles.

```bash
/knowledge discover ~/Documents/Coaching
# → Trouve 45 fichiers .md, 12 .pdf, 3 .docx
```

### Phase 2 : CONFIGURE

Choisir catégories et métadonnées.

```bash
/knowledge configure
# → Propose catégories (coaching, business, technical)
# → Demande tags, auteur, date
```

### Phase 3 : INGEST

Extraire texte, chunker, indexer.

```bash
/knowledge ingest ~/Documents/Coaching/*.md --category coaching
# → Extrait contenu
# → Crée chunks 500-1000 chars
# → Index dans .claude/knowledge/index.json
```

### Phase 4 : ENRICH

Tags automatiques, relations, embeddings.

```bash
/knowledge enrich
# → Génère tags auto (NLP)
# → Détecte relations entre docs
# → Crée embeddings (optionnel, nécessite API)
```

### Phase 5 : GENERATE

Claude consulte avant chaque action.

```
Automatique, rien à faire !
Claude utilise la Knowledge Library contextuellement.
```

---

## 🛠️ Commandes

### /knowledge init

Initialise structure Knowledge Library.

```bash
/knowledge init
# → Crée .claude/knowledge/
# → Crée config.json
# → Crée index.json vide
```

### /knowledge ingest

Ingère documents dans la base.

```bash
# Fichier unique
/knowledge ingest document.md --category coaching/frameworks

# Plusieurs fichiers
/knowledge ingest *.md --category business

# Dossier récursif
/knowledge ingest ~/Docs --category business --recursive

# Avec métadonnées
/knowledge ingest doc.md --category coaching --tags "HPI,projecteur" --author "Jay"
```

**Formats supportés** :
- ✅ Markdown (.md)
- ✅ PDF (.pdf) - extrait texte
- ✅ Word (.docx) - extrait texte
- ✅ Text (.txt)

### /knowledge search

Recherche dans la base.

```bash
# Recherche simple
/knowledge search "design humain"

# Avec filtres
/knowledge search "coaching" --category coaching --tags HPI

# Avec contexte étendu
/knowledge search "business model" --context 1000

# Top N résultats
/knowledge search "multipotentiels" --limit 5
```

### /knowledge stats

Affiche statistiques.

```bash
/knowledge stats

# Output:
📊 Knowledge Library Statistics

Documents: 45
Categories: 3 (coaching, business, technical)
Chunks: 1,234
Total Size: 2.3 MB
Last Updated: 2026-01-26

Top Categories:
  coaching: 28 docs
  business: 12 docs
  technical: 5 docs

Top Tags:
  HPI: 15 docs
  multipotentiels: 12 docs
  projecteur: 10 docs
```

### /knowledge update

Mettre à jour un document.

```bash
# Réindexer document modifié
/knowledge update coaching/frameworks/design-humain.md

# Réindexer catégorie entière
/knowledge update --category coaching

# Réindexer tout
/knowledge update --all
```

### /knowledge delete

Supprimer document.

```bash
# Supprimer document
/knowledge delete coaching/frameworks/old-doc.md

# Supprimer catégorie
/knowledge delete --category technical --confirm
```

---

## ⚙️ Configuration

### config.json

```json
{
  "version": "1.0",
  "chunk_size": 800,
  "chunk_overlap": 100,
  "categories": {
    "coaching": {
      "description": "Frameworks et méthodologies coaching",
      "enabled": true,
      "auto_tags": true
    },
    "business": {
      "description": "Business plan, stratégie, master plan",
      "enabled": true,
      "auto_tags": true
    },
    "technical": {
      "description": "Architecture et décisions techniques",
      "enabled": true,
      "auto_tags": false
    }
  },
  "auto_enrich": true,
  "embeddings": {
    "enabled": false,
    "provider": "openai",
    "model": "text-embedding-3-small"
  }
}
```

### Personnalisation

**Ajouter une catégorie** :
```bash
/knowledge add-category "marketing" "Stratégie marketing et contenu"
```

**Modifier chunk size** :
```json
// config.json
{
  "chunk_size": 1000,  // Plus grand = plus de contexte
  "chunk_overlap": 150
}
```

---

## 🔍 Consultation Automatique

### Déclencheurs

Claude consulte automatiquement la Knowledge Library quand :

| Déclencheur | Action Claude |
|-------------|---------------|
| Keywords détectés | Query docs pertinents |
| Catégorie mentionnée | Charger docs catégorie |
| Besoin contexte métier | Recherche dans business/ |
| Question expertise | Recherche dans coaching/ |
| Décision architecture | Recherche dans technical/ |

### Exemple Consultation

```
User: "Écris un post LinkedIn sur l'authenticité en business"

Claude (background):
1. Parse request → keywords: "authenticité", "business", "LinkedIn"
2. Query Knowledge Library:
   - coaching/frameworks/shinkofa-philosophie.md (authenticité)
   - business/voschinkoff/vision-mission.md (positionnement)
   - business/marketing/content-strategy.md (LinkedIn)
3. Charge contexte pertinent (3 docs, ~2400 tokens)
4. Génère post aligné avec TON message unique
5. [Répond à Jay avec post personnalisé]
```

### Contrôle Manuel

Forcer consultation :
```
User: "@knowledge coaching/frameworks Explique le profil Projecteur"
# Claude charge explicitement coaching/frameworks/
```

Désactiver temporairement :
```
User: "@no-knowledge Réponds avec connaissances générales"
```

---

## 📚 Best Practices

### Organisation Documents

✅ **À FAIRE** :
- Structure claire par catégories
- Noms fichiers descriptifs (`design-humain.md` pas `doc1.md`)
- Métadonnées dans frontmatter (YAML)
- Un concept = un fichier

❌ **À ÉVITER** :
- Fichiers trop gros (> 5000 lignes)
- Catégories trop granulaires
- Doublons de contenu
- Informations obsolètes non supprimées

### Frontmatter YAML

```markdown
---
title: "Design Humain - Profil Projecteur"
category: coaching/frameworks
tags: [design-humain, projecteur, HPI]
author: Jay
date: 2026-01-26
last_updated: 2026-01-26
status: active
---

# Contenu du document...
```

### Maintenance

```bash
# Hebdomadaire : Vérifier docs obsolètes
/knowledge check-outdated

# Mensuel : Réindexer tout
/knowledge update --all

# Trimestriel : Cleanup
/knowledge cleanup --remove-unused
```

---

## 🔗 Intégration

### Avec RAG Workflow

La Knowledge Library est consultée **EN PLUS** de `.claude/docs/` :

```
1. Consulter .claude/docs/ (contexte projet)
2. Consulter .claude/knowledge/ (expertise domaine)
3. Combiner les deux
4. Générer réponse enrichie
```

### Avec Agents

Les agents consultent automatiquement :
- **Code-Reviewer** → technical/patterns/
- **Project-Planner** → business/master-plan/
- **Doc-Generator** → technical/architecture/

---

## 🎯 Cas d'Usage Concrets

### 1. Coaching Client

**Contexte** : Session coaching avec client multipotentiel HPI.

**Sans Knowledge Library** :
```
Claude répond avec connaissances générales coaching
```

**Avec Knowledge Library** :
```
Claude consulte :
- coaching/frameworks/design-humain.md
- coaching/personas/multipotentiels.md
- coaching/methodologies/sessions-structure.md

→ Réponse alignée avec TON approche unique
```

### 2. Création Offre

**Contexte** : Créer nouvelle offre service Voschinkoff.

**Avec Knowledge Library** :
```
Claude consulte :
- business/voschinkoff/vision-mission.md
- business/voschinkoff/offres-services.md (existantes)
- coaching/personas/ (clients cibles)
- business/voschinkoff/pricing-strategy.md

→ Offre cohérente avec écosystème
```

### 3. Planification Projet

**Contexte** : Nouveau projet dans master plan.

**Avec Knowledge Library** :
```
Claude consulte :
- business/master-plan/ecosystem-overview.md
- business/master-plan/projects-dependencies.md
- technical/architecture/system-design.md

→ Plan aligné avec vision globale
```

---

## 📊 Métriques

### Efficacité Knowledge Library

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Temps recherche info** | -70% | Avant/après |
| **Pertinence réponses** | +50% | Subjectif |
| **Réutilisation patterns** | +80% | Tracking |
| **Cohérence outputs** | +60% | Review |

---

## 🔗 Voir Aussi

- [RAG-CONTEXT.md](../../../../core/RAG-CONTEXT.md) - Stratégies RAG
- [knowledge-manager.py](../scripts/knowledge-manager.py) - Script gestion
- `/knowledge` commands - Commandes disponibles

---

**Maintenu par** : [Équipe]
**Support** : knowledge@domain.com

---

## 💡 Tips

### Démarrage Rapide

Si tu ne sais pas par où commencer :

1. **Crée 3 documents minimum** :
   - `coaching/mon-approche.md` (ta philosophie)
   - `business/ma-vision.md` (vision/mission)
   - `business/mes-offres.md` (services actuels)

2. **Ingère-les** :
   ```bash
   /knowledge ingest .claude/knowledge/coaching/*.md
   /knowledge ingest .claude/knowledge/business/*.md
   ```

3. **Teste** :
   ```
   "Explique mon approche coaching unique"
   → Claude devrait citer mon-approche.md
   ```

### Enrichissement Continu

La Knowledge Library grandit avec toi :
- Après chaque session coaching → Documente learnings
- Après chaque décision business → Ajoute dans business/
- Après chaque projet → Archive patterns dans technical/

**La Knowledge Library devient ton cerveau externe**, accessible à Claude 24/7.
