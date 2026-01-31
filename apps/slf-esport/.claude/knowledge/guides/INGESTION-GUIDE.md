# Knowledge Library - Guide Ingestion Complet

> **Guide détaillé** pour ingérer et organiser tes connaissances.

---

## Structure Metadata (Frontmatter)

Chaque document doit commencer par un bloc YAML frontmatter :

```yaml
---
title: "Titre Complet du Document"
category: coaching|business|technical
tags: [tag1, tag2, tag3]
author: "Nom Auteur ou Source"
created_at: "YYYY-MM-DD"
version: "1.0"
sources:
  - "URL ou référence source 1"
  - "Livre, formation, etc."
related_docs:
  - "Autre document relié"
---
```

### Champs Requis

| Champ | Description | Exemple |
|-------|-------------|---------|
| `title` | Titre complet | "Process Communication Model (PCM)" |
| `category` | Catégorie (coaching/business/technical) | "coaching" |
| `created_at` | Date création YYYY-MM-DD | "2026-01-29" |
| `tags` | Liste tags (3-5 recommandé) | [pcm, coaching, personnalité] |

### Champs Optionnels

| Champ | Description |
|-------|-------------|
| `author` | Auteur ou source |
| `version` | Version document (1.0, 1.1, etc.) |
| `sources` | Références externes (URLs, livres) |
| `related_docs` | Autres docs liés dans library |

---

## Catégories

### 1. Coaching

**Usage** : Frameworks coaching, Design Humain, méthodologies, outils

**Tags recommandés** :
- `design-humain`, `projecteur`, `generateur`, `manifesteur`
- `pcm`, `pnl`, `ennéagramme`, `mbti`
- `coaching-ontologique`, `coaching-transcognitif`, `coaching-somatique`
- `bushido`, `ninjutsu`, `jedi`, `accords-toltèques`

**Exemple** :
```yaml
---
title: "Design Humain - Projecteur 1/3"
category: coaching
tags: [design-humain, projecteur, investigateur-martyr]
author: "Ra Uru Hu + Jay notes"
created_at: "2026-01-29"
sources:
  - "https://www.jovianarchive.com/"
  - "Livre: The Definitive Book of Human Design"
---
```

### 2. Business

**Usage** : Business plan Shinkofa, stratégie, marketing, finance

**Tags recommandés** :
- `shinkofa`, `business-plan`, `stratégie`, `roadmap`
- `personas`, `pricing`, `marketing`, `acquisition`
- `communauté`, `inclusivité`, `neurodivergence`
- `mrr`, `ltv`, `cac`, `churn`

**Exemple** :
```yaml
---
title: "Shinkofa - Business Plan 2026-2028"
category: business
tags: [shinkofa, business-plan, écosystème, coaching-tech]
author: "Jay The Ermite"
created_at: "2026-01-29"
version: "2.0"
---
```

### 3. Technical

**Usage** : Architecture, décisions techniques, patterns, stack

**Tags recommandés** :
- `architecture`, `patterns`, `best-practices`
- `fastapi`, `react`, `nextjs`, `postgresql`, `docker`
- `auth`, `security`, `performance`, `scalability`
- `adr` (Architecture Decision Record)

**Exemple** :
```yaml
---
title: "ADR-001: FastAPI + React Architecture"
category: technical
tags: [architecture, fastapi, react, postgresql, adr]
author: "Jay + Claude"
created_at: "2026-01-29"
related_docs:
  - "Shinkofa Platform Technical Stack"
---
```

---

## Workflow Ingestion

### Méthode 1 : Depuis Template (Recommandé)

```bash
# 1. Copier template approprié
cp .claude/knowledge/templates/coaching-document.md ~/docs/mon-document.md

# 2. Éditer avec ton éditeur préféré
vim ~/docs/mon-document.md
# Remplir metadata + contenu

# 3. Ingérer
python .claude/scripts/knowledge-ingest.py \
  ~/docs/mon-document.md \
  --category coaching \
  --tags tag1 tag2
```

### Méthode 2 : Document Existant

Si tu as déjà un document markdown :

```bash
# 1. Ajouter frontmatter au début
cat > /tmp/header.md <<'EOF'
---
title: "Titre du Document"
category: business
tags: [tag1, tag2]
created_at: "2026-01-29"
---

EOF

# 2. Combiner avec document existant
cat /tmp/header.md ~/docs/existing-doc.md > ~/docs/new-doc.md

# 3. Ingérer
python .claude/scripts/knowledge-ingest.py \
  ~/docs/new-doc.md \
  --category business
```

### Méthode 3 : Batch Ingestion

Ingérer plusieurs documents d'un coup :

```bash
# Tous les docs d'un dossier
python .claude/scripts/knowledge-ingest.py \
  ~/docs/coaching/*.md \
  --category coaching \
  --tags formation-2024

# Spécifiques
python .claude/scripts/knowledge-ingest.py \
  ~/docs/pcm.md \
  ~/docs/pnl.md \
  ~/docs/ennéagramme.md \
  --category coaching
```

---

## Conventions Nommage

### Fichiers

**Format** : `kebab-case-descriptif.md`

✅ **Bon** :
- `design-humain-projecteur.md`
- `shinkofa-business-plan-2026.md`
- `adr-001-fastapi-architecture.md`

❌ **Éviter** :
- `DesignHumain.md` (PascalCase)
- `design_humain.md` (snake_case)
- `doc1.md` (non-descriptif)

### Tags

**Format** : `kebab-case`, lowercase

✅ **Bon** :
- `design-humain`, `coaching-ontologique`, `business-plan`

❌ **Éviter** :
- `Design Humain` (espaces)
- `Coaching_Ontologique` (underscore)
- `BP` (acronymes non-explicites)

**Nombre** : 3-7 tags recommandés par document

---

## Organisation Contenu

### Structure Recommandée

```markdown
---
[frontmatter]
---

# Titre Principal

> **Résumé 1-ligne** : Objectif ou essence du document

---

## Contexte

[Pourquoi ce document existe, contexte d'utilisation]

---

## Concepts Clés

### Concept 1

[Explication]

### Concept 2

[Explication]

---

## Application Pratique

[Comment utiliser dans Shinkofa/projets]

---

## Ressources

- [Liens, livres, formations]

---

## Notes Personnelles

[Insights Jay, apprentissages, réflexions]
```

### Sections Spéciales

**Pour Coaching** :
```markdown
## Design Humain - Projecteur 1/3

**Implications** :
- ✅ [Aspect aligné]
- ⚠️ [Point d'attention]
- 💡 [Recommendation]
```

**Pour Business** :
```markdown
## Valeurs Shinkofa (Alignement)

✅ **Authenticité** : [Comment aligné]
✅ **Inclusivité** : [Comment sert neurodivergence]
✅ **Accessibilité** : [Comment accessible tous]
```

**Pour Technical** :
```markdown
## Décision

**✅ CHOIX RETENU** : [Option]

**Justification** : [Pourquoi]

**Trade-offs** : [Compromis assumés]
```

---

## Index & Recherche

### Index Automatique

L'index `.claude/knowledge/.index.json` est **auto-généré** à chaque ingestion.

**Structure** :
```json
{
  "documents": [
    {
      "title": "Document Title",
      "category": "coaching",
      "tags": ["tag1", "tag2"],
      "file": ".claude/knowledge/coaching/document-title.md",
      "created_at": "2026-01-29",
      "indexed_at": "2026-01-29T14:30:00"
    }
  ],
  "updated_at": "2026-01-29T14:30:00"
}
```

### Recherche

```bash
# Query simple
python .claude/scripts/knowledge-search.py "projecteur"

# Multi-critères
python .claude/scripts/knowledge-search.py "coaching" \
  --category coaching \
  --tags design-humain

# Verbose (détails complets)
python .claude/scripts/knowledge-search.py "shinkofa" --verbose

# Limiter résultats
python .claude/scripts/knowledge-search.py "api" --max-results 5
```

---

## Maintenance

### Mettre à Jour un Document

```bash
# 1. Trouver le fichier
python .claude/scripts/knowledge-search.py "titre document"

# 2. Éditer
vim .claude/knowledge/coaching/document-titre.md

# 3. Re-ingérer (écrase ancien)
python .claude/scripts/knowledge-ingest.py \
  .claude/knowledge/coaching/document-titre.md \
  --category coaching
# Répondre "yes" à "Overwrite?"
```

### Supprimer un Document

```bash
# 1. Supprimer fichier
rm .claude/knowledge/coaching/document-obsolete.md

# 2. Re-générer index
# (L'index se mettra à jour au prochain ingest)
```

### Backup

```bash
# Backup manuel
cp -r .claude/knowledge/ ~/backups/knowledge-$(date +%Y%m%d)/

# Versionner avec Git
git add .claude/knowledge/
git commit -m "docs(knowledge): add PCM framework"
```

---

## Intégration Claude

### Auto-Trigger Keywords

Claude consulte automatiquement quand détecte :

**Coaching** :
```
"comment adapter coaching pour projecteur ?"
→ Recherche: design-humain, projecteur
```

**Business** :
```
"quelle stratégie pricing Shinkofa ?"
→ Recherche: shinkofa, pricing, business-plan
```

**Technical** :
```
"pourquoi on a choisi FastAPI ?"
→ Recherche: fastapi, architecture, adr
```

### Manuel

Tu peux aussi demander explicitement :

```
"consulte knowledge library sur Design Humain Projecteur"
"recherche dans business plan Shinkofa"
"ADR sur choix FastAPI"
```

---

## Exemples Complets

### Exemple 1 : Coaching

**Fichier** : `pcm-framework.md`

```markdown
---
title: "Process Communication Model (PCM)"
category: coaching
tags: [pcm, personnalité, communication, coaching]
author: "Taibi Kahler + Jay notes formation 2025"
created_at: "2026-01-29"
version: "1.0"
sources:
  - "Formation PCM certifiante janvier 2025"
  - "https://www.process-communication.fr/"
related_docs:
  - "Ennéagramme - 9 Types"
  - "MBTI - 16 Personnalités"
---

# Process Communication Model (PCM)

> **Modèle des 6 types de personnalité** pour communication adaptée

---

## Contexte

PCM identifie 6 types de personnalité avec drivers spécifiques.
Utilisé dans coaching Shinkofa pour adapter communication.

---

## Les 6 Types

### 1. Empathique

**Caractéristiques** :
- Sensible, chaleureux, compassionnel
- Besoin : Être reconnu en tant que personne

**Driver** : "Fais plaisir"

**Communication** : Langage des sentiments

### 2. Travaillomane

[...]

---

## Application Shinkofa

Pour Jay (Projecteur 1/3 + probablement Travaillomane/Rebelle) :
- ✅ Respecter besoin structure (Travaillomane)
- ✅ Laisser place créativité (Rebelle)
- ⚠️ Éviter surcharge (Projecteur fatigue)

---
```

### Exemple 2 : Business

**Fichier** : `personas-shinkofa-2026.md`

```markdown
---
title: "Personas Cibles Shinkofa 2026"
category: business
tags: [shinkofa, personas, marché-cible, neurodivergence]
author: "Jay The Ermite"
created_at: "2026-01-29"
version: "1.0"
---

# Personas Cibles Shinkofa 2026

> **3 personas prioritaires** pour écosystème holistique

---

## Persona 1 : "Alex - L'Entrepreneur HPI Débordé"

**Démographie** :
- 30-45 ans
- Entrepreneur, freelance
- HPI/multipotentiel

**Besoins** :
- Structure sans rigidité
- Coaching adapté neuroatypie
- Outils tech pour automatiser

**Pain Points** :
- 😢 Surinvestissement mental
- 😢 Difficulté prioriser
- 😢 Isolement (pas compris)

**Solution Shinkofa** :
- ✨ Coaching ontologique + Design Humain
- ✨ Outils productivité (widgets brain-training)
- ✨ Communauté neurodivergents

[...]

---
```

---

**Guide complet** ✅
**Prêt à peupler ta knowledge library** 📚
