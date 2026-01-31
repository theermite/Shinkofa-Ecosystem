# Guide Ingestion - Knowledge Library

> Tout savoir sur l'ingestion de contenu dans la Knowledge Library.

---

## 🎯 Vue d'Ensemble

**Ingestion** = Processus de conversion documents externes → base connaissances structurée et recherchable.

**Formats supportés** :
- ✅ Markdown (.md)
- ✅ PDF (.pdf)
- ✅ Word (.docx)
- ✅ Text (.txt)
- 🔄 YAML (.yaml) - Métadata seulement
- ⚠️ Images - OCR si nécessaire (optionnel)

---

## 📋 Workflows Ingestion

### Workflow 1 : Fichier Unique

```bash
/knowledge ingest path/to/document.md --category coaching

# Avec options
/knowledge ingest document.pdf \
  --category business \
  --tags "strategy,2026" \
  --author "Jay"
```

---

### Workflow 2 : Batch (Dossier)

```bash
# Ingérer tous .md d'un dossier
/knowledge ingest ~/Documents/Coaching/*.md --category coaching

# Récursif (tous sous-dossiers)
/knowledge ingest ~/Documents/Coaching/ --category coaching --recursive

# Filtre par pattern
/knowledge ingest ~/Docs/*.pdf --category business --pattern "*business*"
```

---

### Workflow 3 : Ingestion Interactive

```bash
/knowledge ingest-interactive

# → Prompt questions :
# 1. Sélectionner fichiers
# 2. Choisir catégorie
# 3. Ajouter tags (suggestions auto)
# 4. Confirmer metadata
# 5. Ingérer
```

---

## 🔧 Extraction Automatique

### Markdown (.md)

**Extraction** :
- **Frontmatter YAML** : Metadata structurées
- **H1** : Titre (si frontmatter absent)
- **Contenu** : Chunking 800 chars + overlap 100

**Exemple** :

```markdown
---
title: "Mon Titre"
tags: [tag1, tag2]
---

# Mon Titre

Contenu ici...
```

**Résultat** :
```json
{
  "title": "Mon Titre",
  "tags": ["tag1", "tag2"],
  "content_chunks": ["Chunk 1...", "Chunk 2..."],
  "metadata_source": "frontmatter"
}
```

---

### PDF (.pdf)

**Extraction** :
- **Texte** : PyPDF2 ou pdfplumber
- **Titre** : Premier heading ou filename
- **Tags** : Keywords fréquents (NLP)
- **Metadata PDF** : Auteur, date création

**Limitations** :
- PDFs scannés nécessitent OCR (optionnel)
- Mise en page complexe peut casser chunking

**Amélioration OCR** :
```bash
/knowledge ingest document-scan.pdf --ocr
# Nécessite : tesseract-ocr installé
```

---

### Word (.docx)

**Extraction** :
- **Texte** : python-docx
- **Titre** : Premier heading ou propriété document
- **Metadata** : Auteur, date modif (propriétés Word)

---

### Text (.txt)

**Extraction basique** :
- **Titre** : Première ligne ou filename
- **Pas de metadata** (sauf si format spécial)
- **Chunking standard**

---

## 🏷️ Metadata Enrichie

### Auto-Extraction

**Activée par défaut** :

```json
// config.json
{
  "metadata": {
    "auto_extract": {
      "title": true,      // Extrait H1 ou filename
      "tags": true,       // NLP keywords fréquents
      "date": true        // Date fichier ou frontmatter
    }
  }
}
```

**Tags Auto (NLP)** :

Algorithme détecte keywords fréquents :
- Minimum fréquence : 3 occurrences
- Filtre stop words (le, la, de, etc.)
- Max tags auto : 10

**Exemple** :

Document parle 12 fois de "projecteur", 8 fois de "énergie", 5 fois de "burnout".

**Tags auto générés** : `["projecteur", "énergie", "burnout"]`

---

### Metadata Manuelles

**Override frontmatter ou CLI** :

```bash
# CLI tags override auto
/knowledge ingest doc.md --tags "custom,manual,tags"

# CLI author override frontmatter
/knowledge ingest doc.md --author "Autre Auteur"
```

**Priorité metadata** :
1. CLI arguments (highest)
2. Frontmatter YAML
3. Auto-extraction
4. Defaults (lowest)

---

## ✅ Validation Pré-Ingestion

### Checklist Automatique

Avant ingestion, système vérifie :

- [ ] Fichier existe et lisible
- [ ] Format supporté
- [ ] Catégorie valide (coaching, business, technical)
- [ ] Frontmatter YAML syntaxiquement correct (si .md)
- [ ] Pas de doublon (même path)
- [ ] Taille fichier < 50 MB

**Si erreur** : Message clair + suggestions fix.

---

### Validation Manuelle (Optionnelle)

```bash
# Dry-run : Voir ce qui sera ingéré SANS ingérer
/knowledge ingest doc.md --category coaching --dry-run

# Output :
# Title: "Mon Document"
# Category: coaching
# Tags: ["tag1", "tag2"]
# Chunks: 5
# Size: 2.3 KB
#
# [Confirm ingestion? Y/n]
```

---

## 🔄 Réingestion (Updates)

### Fichier Modifié

**Détection auto changements** :

```bash
# Modifier document existant
nano .claude/knowledge/coaching/mon-approche.md

# Réingérer
/knowledge ingest coaching/mon-approche.md --category coaching

# → Détecte changement → Crée version 1.1 → Update index
```

**Versioning** :

```json
{
  "id": "coaching/mon-approche",
  "versions": [
    {
      "version": "1.0",
      "date": "2026-01-29",
      "hash": "abc123"
    },
    {
      "version": "1.1",
      "date": "2026-01-30",
      "hash": "def456"
    }
  ],
  "current_version": "1.1"
}
```

---

### Batch Update

```bash
# Réingérer catégorie entière
/knowledge update --category coaching

# Réingérer tout
/knowledge update --all

# Avec cleanup (supprime documents supprimés)
/knowledge update --all --cleanup
```

---

## 🎨 Templates Ingestion

### Utiliser Templates

```bash
# Copier template
cp .claude/knowledge/templates/coaching-document.md coaching/nouveau-framework.md

# Éditer (remplir frontmatter + contenu)
nano coaching/nouveau-framework.md

# Ingérer
/knowledge ingest coaching/nouveau-framework.md --category coaching
```

**Avantage** : Frontmatter déjà structuré, pas d'erreur metadata.

---

## 📊 Post-Ingestion

### Index Update

**Automatique après ingestion** :

```json
// index.json (extrait)
{
  "documents": [
    {
      "id": "coaching/mon-approche",
      "title": "Mon Approche Coaching",
      "category": "coaching",
      "tags": ["approche", "philosophie"],
      "path": "coaching/mon-approche.md",
      "date": "2026-01-29",
      "version": "1.0",
      "word_count": 450,
      "chunks": 2
    }
  ]
}
```

---

### Vérification

```bash
# Stats post-ingestion
/knowledge stats

# Rechercher document ingéré
/knowledge search "titre document"

# Lister documents catégorie
/knowledge list --category coaching
```

---

## ⚠️ Erreurs Courantes

### Erreur 1 : "Invalid category"

**Cause** : Catégorie n'existe pas dans config.

**Fix** :
```bash
# Vérifier catégories valides
cat .claude/knowledge/config.json | grep categories

# Utiliser catégorie existante
/knowledge ingest doc.md --category coaching  # OK
```

---

### Erreur 2 : "Invalid YAML frontmatter"

**Cause** : Syntaxe YAML incorrecte dans frontmatter.

**Fix** :

```markdown
---
title: "Titre Sans Quotes Probablement OK"
title: "Titre: Avec Colons Nécessite Quotes"  # ✅
tags: [tag1, tag2]  # ✅
tags: tag1, tag2    # ❌ Manque []
---
```

**Valider YAML** :
```bash
python -c "import yaml; yaml.safe_load(open('doc.md').read().split('---')[1])"
```

---

### Erreur 3 : "File too large"

**Cause** : Fichier > 50 MB.

**Fix** :
```bash
# Découper fichier
split -b 10M huge-doc.md doc-part-

# Ingérer parties séparément
/knowledge ingest doc-part-aa --category business
/knowledge ingest doc-part-ab --category business
```

---

### Erreur 4 : "Duplicate document ID"

**Cause** : Document avec même ID déjà ingéré.

**Fix** :
```bash
# Option 1 : Update (réingestion)
/knowledge ingest doc.md --category coaching --force

# Option 2 : Renommer nouveau document
mv doc.md doc-v2.md
/knowledge ingest doc-v2.md --category coaching
```

---

## 🚀 Best Practices

### Préparation Documents

✅ **À faire avant ingestion** :
- Nettoyer formatage (pas de caractères spéciaux bizarres)
- Structurer avec headings clairs (H1, H2, H3)
- Ajouter frontmatter YAML si .md
- Vérifier nom fichier descriptif

❌ **À éviter** :
- Noms fichiers génériques (doc1.md, untitled.pdf)
- Fichiers énormes (>5 MB si possible, découper)
- Contenu obsolète (purge régulière)

---

### Batch Ingestion

**Stratégie progressive** :

```bash
# Phase 1 : Documents critiques (manuelle)
/knowledge ingest coaching/approche.md --category coaching
/knowledge ingest business/vision.md --category business

# Phase 2 : Batch par catégorie
/knowledge ingest ~/Docs/Coaching/*.md --category coaching

# Phase 3 : Tout le reste
/knowledge ingest ~/Docs/ --recursive
```

---

### Maintenance Ingestion

**Hebdomadaire** :
```bash
# Réingérer documents modifiés
/knowledge update --modified-since 7d
```

**Mensuel** :
```bash
# Réindexer tout
/knowledge update --all
```

**Trimestriel** :
```bash
# Cleanup + réindexation complète
/knowledge update --all --cleanup --reindex
```

---

## 📚 Ressources

- [README.md](../README.md) - Documentation générale
- [templates/](../templates/) - Templates document
- [QUICKSTART.md](QUICKSTART.md) - Démarrage rapide

---

**Guide Ingestion v1.0**
*Ingérer. Indexer. Interroger.* 📥
