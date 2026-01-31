# Knowledge Library - Quick Start

> **10 minutes** pour configurer et utiliser la Knowledge Library RAG.

---

## Qu'est-ce que c'est ?

La **Knowledge Library** est un système RAG (Retrieval-Augmented Generation) qui permet à Claude de :
- 📚 Stocker tes connaissances domaine (coaching, business, technique)
- 🔍 Rechercher rapidement dans ta base de connaissances
- 🧠 Consulter automatiquement quand keywords détectés
- 📊 Organiser par catégories et tags

---

## Installation (2 min)

```bash
# 1. Structure déjà créée
ls .claude/knowledge/
# coaching/ business/ technical/ guides/ templates/

# 2. Scripts déjà installés
ls .claude/scripts/
# knowledge-ingest.py knowledge-search.py

# 3. Configuration OK
cat .claude/knowledge/config-v2.json
```

✅ **Déjà prêt à utiliser !**

---

## Utilisation Basique

### Ajouter un Document

```bash
# Option 1 : Depuis template
cp .claude/knowledge/templates/coaching-document.md ~/mes-docs/design-humain-projecteur.md
# Éditer le fichier, remplir metadata
vim ~/mes-docs/design-humain-projecteur.md

# Ingérer dans library
python .claude/scripts/knowledge-ingest.py \
  ~/mes-docs/design-humain-projecteur.md \
  --category coaching \
  --tags design-humain projecteur
```

**Output** :
```
✅ Ingested: .claude/knowledge/coaching/design-humain-projecteur.md
📊 Index updated: 1 documents
```

### Rechercher

```bash
# Recherche par query
python .claude/scripts/knowledge-search.py "projecteur"

# Filtrer par catégorie
python .claude/scripts/knowledge-search.py --category coaching

# Filtrer par tags
python .claude/scripts/knowledge-search.py --tags design-humain projecteur

# Statistiques
python .claude/scripts/knowledge-search.py --stats
```

**Output** :
```
📚 Found 1 document(s)

1. Design Humain - Projecteur 1/3
   Category: coaching
   Tags: design-humain, projecteur, coaching-ontologique
   File: .claude/knowledge/coaching/design-humain-projecteur.md
```

---

## Catégories

| Catégorie | Usage | Exemples |
|-----------|-------|----------|
| **coaching** | Frameworks, Design Humain, méthodologies | PCM, PNL, Ennéagramme, Projecteur |
| **business** | Business plan Shinkofa, stratégie, marketing | Personas, pricing, roadmap produit |
| **technical** | Architecture, patterns, décisions techniques | FastAPI, React, PostgreSQL, Docker |

---

## Workflow Typique

### 1. Créer Document (Coaching)

```bash
# Copier template
cp .claude/knowledge/templates/coaching-document.md ~/docs/framework-pcm.md

# Éditer metadata
---
title: "Process Communication Model (PCM)"
category: coaching
tags: [pcm, coaching, personnalité]
author: "Taibi Kahler + Jay notes"
created_at: "2026-01-29"
---

# Process Communication Model (PCM)

> Modèle des 6 types de personnalité

[... contenu ...]
```

### 2. Ingérer

```bash
python .claude/scripts/knowledge-ingest.py \
  ~/docs/framework-pcm.md \
  --category coaching
```

### 3. Utiliser avec Claude

Quand tu discutes avec Claude :

**Tu** : "Comment je peux adapter mon coaching pour un Projecteur ?"

**Claude** : *Consulte automatiquement knowledge library*
```
🔍 Searching knowledge: "projecteur coaching"
📖 Found: Design Humain - Projecteur 1/3
```

Claude répond en utilisant tes docs custom !

---

## Keywords Auto-Trigger

Claude consulte **automatiquement** la knowledge library quand il détecte :

**Coaching** :
- design humain, projecteur, generateur
- pcm, pnl, ennéagramme
- coaching ontologique, transcognitif

**Business** :
- shinkofa, business plan
- stratégie, personas, pricing

**Technical** :
- architecture, fastapi, react
- postgresql, docker, patterns

---

## Commandes Rapides

```bash
# Ajouter document coaching
python .claude/scripts/knowledge-ingest.py <file> --category coaching

# Ajouter document business
python .claude/scripts/knowledge-ingest.py <file> --category business --tags shinkofa

# Rechercher
python .claude/scripts/knowledge-search.py "query"

# Stats
python .claude/scripts/knowledge-search.py --stats
```

---

## Fichiers Clés

```
.claude/knowledge/
├── config-v2.json          # Configuration RAG
├── .index.json             # Index documents (auto-généré)
├── coaching/               # Documents coaching
├── business/               # Documents business
├── technical/              # Documents techniques
├── templates/              # Templates ingestion
│   ├── coaching-document.md
│   ├── business-document.md
│   └── technical-decision.md
└── guides/                 # Docs (ce fichier)
    ├── QUICKSTART.md
    └── INGESTION-GUIDE.md
```

---

## Troubleshooting

### "No documents found"

**Cause** : Index vide ou query trop spécifique.

**Solution** :
```bash
# Vérifier index
python .claude/scripts/knowledge-search.py --stats

# Vérifier fichiers
ls .claude/knowledge/coaching/
```

### "Missing required field"

**Cause** : Metadata incomplète dans frontmatter.

**Solution** : Vérifier que le fichier a :
```yaml
---
title: "Titre"
category: coaching
created_at: "2026-01-29"
tags: [tag1, tag2]
---
```

---

## Prochaines Étapes

1. ✅ **[FAIT]** Setup initial
2. 📝 **Ingérer 1er document** (test avec template)
3. 🔍 **Tester recherche**
4. 💬 **Utiliser avec Claude** (mention keywords)
5. 📚 **Peupler progressivement** (coaching, business, technical)

---

**Temps total** : 10 minutes ✅

**Guide complet** : `.claude/knowledge/guides/INGESTION-GUIDE.md`
