# /knowledge

Gère la Knowledge Library - ta base de connaissances personnalisée.

## Usage

```bash
/knowledge init
/knowledge ingest <file> --category <category>
/knowledge search <query>
/knowledge stats
```

## Description

La Knowledge Library permet de créer une **base de connaissances spécifique à ton domaine** que Claude consulte automatiquement.

**Cas d'usage** :
- 📚 **Coaching** : Frameworks, méthodologies, personas
- 🎯 **Business** : Vision/mission, business plan, stratégie
- 🏗️ **Projets** : Architecture, décisions, master plan
- 🧠 **Expertise** : Ton savoir unique, patterns

---

## Commandes

### /knowledge init

Initialise la structure Knowledge Library.

```bash
/knowledge init
```

**Crée** :
- `.claude/knowledge/` (répertoire principal)
- `coaching/`, `business/`, `technical/` (catégories par défaut)
- `config.json` (configuration)
- `index.json` (index documents)

---

### /knowledge ingest

Ingère documents dans la base.

```bash
# Fichier unique
/knowledge ingest document.md --category coaching/frameworks

# Plusieurs fichiers (glob)
/knowledge ingest ~/Docs/Coaching/*.md --category coaching

# Dossier récursif
/knowledge ingest ~/Voschinkoff-Docs/ --category business --recursive

# Avec métadonnées
/knowledge ingest doc.md --category coaching --tags "HPI,projecteur" --author "Jay"
```

**Formats supportés** :
- ✅ Markdown (.md)
- ✅ PDF (.pdf)
- ✅ Word (.docx)
- ✅ Text (.txt)

**Options** :
- `--category <cat>` : Catégorie (obligatoire)
- `--tags <tags>` : Tags comma-separated
- `--author <name>` : Auteur
- `--recursive` : Recherche récursive dans dossiers

---

### /knowledge search

Recherche dans la base de connaissances.

```bash
# Recherche simple
/knowledge search "design humain"

# Avec filtre catégorie
/knowledge search "coaching" --category coaching

# Avec limite résultats
/knowledge search "business model" --limit 10
```

**Options** :
- `--category <cat>` : Filtrer par catégorie
- `--limit N` : Nombre max résultats (défaut: 5)

**Output** :
```
🔍 Recherche: 'design humain'

📄 3 résultats trouvés

1. Design Humain - Profil Projecteur
   📁 coaching/frameworks
   📊 Score: 5
   📝 ...Le Design Humain révèle que le Projecteur...

2. Coaching Multipotentiels
   📁 coaching/personas
   📊 Score: 2
   📝 ...aligné avec leur Design Humain...
```

---

### /knowledge stats

Affiche statistiques Knowledge Library.

```bash
/knowledge stats
```

**Output** :
```
📊 Knowledge Library Statistics

Documents: 45
Chunks: 1,234
Total Size: 234,567 chars
Last Updated: 2026-01-26T15:30:00

📁 By Category:
   coaching: 28 docs
   business: 12 docs
   technical: 5 docs

🏷️ Top Tags:
   HPI: 15
   multipotentiels: 12
   projecteur: 10

⚙️ Configuration:
   Chunk Size: 800
   Overlap: 100
   Auto Enrich: true
```

---

### /knowledge discover

Découvre documents disponibles avant ingestion.

```bash
# Scanner dossier
/knowledge discover ~/Documents/Coaching

# Recherche récursive
/knowledge discover ~/Voschinkoff-Docs --recursive
```

**Output** :
```
🔍 Découverte documents dans: ~/Documents/Coaching

📄 45 documents trouvés

  markdown: 38 fichiers
    - design-humain.md
    - profil-projecteur.md
    ...

  pdf: 7 fichiers
    - business-plan.pdf
    ...

💡 Pour ingérer:
   /knowledge ingest ~/Documents/Coaching --category [category]
```

---

### /knowledge enrich

Enrichit documents avec tags automatiques.

```bash
/knowledge enrich
```

Génère tags automatiquement pour docs sans tags via analyse NLP simple.

---

### /knowledge update

Met à jour un document modifié.

```bash
# Document spécifique
/knowledge update coaching/frameworks/design-humain.md

# Catégorie entière
/knowledge update --category coaching

# Tout
/knowledge update --all
```

---

### /knowledge delete

Supprime document ou catégorie.

```bash
# Document
/knowledge delete coaching/old-doc.md

# Catégorie (avec confirmation)
/knowledge delete --category technical --confirm
```

---

## Workflow Complet

### 1. Initialisation

```bash
/knowledge init
```

### 2. Ajouter Documents

**Option A : Créer directement**
```bash
# Créer fichier dans structure
nano .claude/knowledge/coaching/frameworks/mon-approche.md

# Ingérer
/knowledge ingest .claude/knowledge/coaching/frameworks/mon-approche.md \
  --category coaching/frameworks
```

**Option B : Ingérer existants**
```bash
# Ingérer docs coaching
/knowledge ingest ~/Documents/Coaching/*.md --category coaching --recursive

# Ingérer business plan
/knowledge ingest ~/Voschinkoff/business-plan.pdf --category business/voschinkoff
```

### 3. Enrichir (optionnel)

```bash
/knowledge enrich
```

### 4. Vérifier

```bash
/knowledge stats
```

### 5. Utiliser

Claude consulte automatiquement ! Test :
```
User: "Explique mon approche coaching unique"
→ Claude cherche automatiquement dans coaching/
```

---

## Structure Recommandée

```
.claude/knowledge/
├── coaching/
│   ├── frameworks/           # Cadres conceptuels
│   │   ├── design-humain.md
│   │   ├── profil-projecteur.md
│   │   └── shinkofa-philosophie.md
│   ├── methodologies/        # Méthodes pratiques
│   │   ├── sessions-structure.md
│   │   └── questionnements.md
│   └── personas/             # Clients types
│       ├── multipotentiels.md
│       └── entrepreneurs-conscients.md
│
├── business/
│   ├── voschinkoff/          # Business plan principal
│   │   ├── vision-mission.md
│   │   ├── business-model.md
│   │   ├── offres-services.md
│   │   └── roadmap-2026.md
│   ├── master-plan/          # Plan global projets
│   │   ├── ecosystem-overview.md
│   │   ├── projects-dependencies.md
│   │   └── timeline-phases.md
│   └── marketing/
│       ├── positioning.md
│       └── content-strategy.md
│
└── technical/                # Technique projet-specific
    ├── architecture/
    └── patterns/
```

---

## Consultation Automatique

**Claude consulte automatiquement** quand :

| Trigger | Action Claude |
|---------|---------------|
| Keywords coaching | Query `coaching/` |
| Keywords business | Query `business/` |
| Mention Voschinkoff | Query `business/voschinkoff/` |
| Question expertise | Search dans toute la base |
| Décision architecture | Query `technical/` |

### Exemple

```
User: "Écris un post LinkedIn sur l'authenticité en business"

Claude (background):
1. Parse: "authenticité", "business", "LinkedIn"
2. Query Knowledge Library:
   → coaching/frameworks/shinkofa-philosophie.md (authenticité)
   → business/voschinkoff/vision-mission.md (positionnement)
   → business/marketing/content-strategy.md (LinkedIn)
3. Génère post aligné avec TON message unique
```

---

## Frontmatter Recommandé

Pour documents Markdown, ajouter frontmatter YAML :

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

Métadonnées automatiquement extraites lors de l'ingestion.

---

## Best Practices

### ✅ À FAIRE

- Structure claire par catégories
- Noms fichiers descriptifs
- Un concept = un fichier
- Frontmatter avec métadonnées
- Mise à jour régulière

### ❌ À ÉVITER

- Fichiers trop gros (> 5000 lignes)
- Catégories trop granulaires
- Doublons de contenu
- Informations obsolètes non supprimées

---

## Cas d'Usage

### 1. Coaching Client

**Contexte** : Session avec client multipotentiel HPI.

**Sans Knowledge Library** :
Claude répond avec connaissances générales.

**Avec Knowledge Library** :
```
User: "Approche pour accompagner multipotentiel HPI projecteur ?"

Claude:
→ Consulte coaching/personas/multipotentiels.md
→ Consulte coaching/frameworks/profil-projecteur.md
→ Consulte coaching/frameworks/design-humain.md
→ Répond avec TON approche unique
```

### 2. Création Offre

**Contexte** : Nouvelle offre service Voschinkoff.

```
User: "Aide-moi à créer offre coaching entrepreneurs conscients"

Claude:
→ Consulte business/voschinkoff/offres-services.md (existantes)
→ Consulte business/voschinkoff/vision-mission.md (positionnement)
→ Consulte coaching/personas/entrepreneurs-conscients.md (cible)
→ Génère offre cohérente avec écosystème
```

### 3. Planification Projet

**Contexte** : Nouveau projet master plan.

```
User: "Planifier nouveau projet formation en ligne"

Claude:
→ Consulte business/master-plan/ecosystem-overview.md
→ Consulte business/master-plan/projects-dependencies.md
→ Consulte business/master-plan/timeline-phases.md
→ Plan aligné avec vision globale
```

---

## Configuration

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
      "description": "Business plan, stratégie",
      "enabled": true,
      "auto_tags": true
    }
  },
  "auto_enrich": true,
  "embeddings": {
    "enabled": false
  }
}
```

### Personnalisation

**Chunk size** : Plus grand = plus de contexte, mais moins précis.
- Défaut : 800 chars
- Small docs : 500-600
- Large docs : 1000-1200

**Auto enrich** : Génération automatique tags.
- `true` : Tags auto lors ingestion
- `false` : Tags manuels uniquement

---

## Intégration

### Avec RAG Workflow

Knowledge Library consultée **EN PLUS** de `.claude/docs/` :

```
1. .claude/docs/ → Contexte projet technique
2. .claude/knowledge/ → Expertise domaine
3. Combiner les deux
4. Générer réponse enrichie
```

### Avec Agents

Agents consultent automatiquement :
- **Code-Reviewer** → `technical/patterns/`
- **Project-Planner** → `business/master-plan/`
- **Doc-Generator** → `technical/architecture/`

---

## Troubleshooting

### "Knowledge Library not found"

**Solution** :
```bash
/knowledge init
```

### "No results found"

**Causes** :
- Documents pas ingérés
- Query trop spécifique
- Mauvaise catégorie

**Solutions** :
```bash
# Vérifier stats
/knowledge stats

# Ingérer documents
/knowledge ingest <path> --category <cat>

# Recherche plus large
/knowledge search "keyword" --limit 20
```

### Erreur extraction PDF/DOCX

**Cause** : Dépendances manquantes

**Solution** :
```bash
# Pour PDF
pip install PyPDF2

# Pour DOCX
pip install python-docx
```

---

## Voir Aussi

- [knowledge/README.md](../../Prompt-2026-Optimized/templates/generic-project/.claude/knowledge/README.md)
- [knowledge-manager.py](../../Prompt-2026-Optimized/templates/generic-project/.claude/scripts/knowledge-manager.py)
- [RAG-CONTEXT.md](../../Prompt-2026-Optimized/core/RAG-CONTEXT.md)

---

**Version** : 1.0
**Créé** : 2026-01-26
**Impact** : CRITIQUE - Base de connaissances personnalisée

---

## 💡 Quick Start

Si tu ne sais pas par où commencer :

**3 documents minimum** :
1. `coaching/mon-approche.md` → Ta philosophie coaching
2. `business/ma-vision.md` → Vision/mission Voschinkoff
3. `business/mes-offres.md` → Services actuels

```bash
/knowledge init
# Créer les 3 fichiers dans .claude/knowledge/
/knowledge ingest .claude/knowledge/coaching/*.md --category coaching
/knowledge ingest .claude/knowledge/business/*.md --category business
/knowledge stats
```

**Test** :
```
"Explique mon approche coaching unique"
→ Claude devrait citer mon-approche.md
```

**La Knowledge Library devient ton cerveau externe**, accessible à Claude 24/7. 🧠
