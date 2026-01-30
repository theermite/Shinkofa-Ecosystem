# Quick Start - Knowledge Library

> Démarrer avec la Knowledge Library en 10 minutes.

---

## 📋 Checklist Rapide

```
□ 1. Initialiser structure (2 min)
□ 2. Créer 3 documents essentiels (5 min)
□ 3. Ingérer contenu (1 min)
□ 4. Tester recherche (1 min)
□ 5. Valider consultation auto (1 min)
```

**Total : 10 minutes** ⏱️

---

## Étape 1 : Initialiser (2 min)

```bash
# Via skill Claude Code
/knowledge init

# Résultat :
# .claude/knowledge/
# ├── config.json
# ├── index.json
# ├── coaching/README.md
# ├── business/README.md
# └── technical/README.md
```

**Vérification** :
```bash
ls -la .claude/knowledge/
# → Doit afficher 3 dossiers + config.json + index.json
```

---

## Étape 2 : Créer Documents Essentiels (5 min)

### Document 1 : Ton Approche Coaching (2 min)

```bash
nano .claude/knowledge/coaching/mon-approche.md
```

**Contenu minimal** :

```markdown
---
title: "Mon Approche Coaching Unique"
category: coaching
tags: [approche, philosophie, méthode]
author: Jay
date: 2026-01-29
---

# Mon Approche Coaching

## Ma Philosophie

[Décris en 2-3 paragraphes ton approche unique]

## Mes Outils Principaux

- Design Humain (focus Projecteurs)
- Neurodivergence (TDAH, HPI, HSP)
- Philosophie Shinkofa (Authenticité, Harmonie, Croissance, Service, Présence)

## Mon Client Idéal

[Décris ton persona client principal]

## Ce Qui Me Différencie

[Ton unique value proposition]
```

---

### Document 2 : Ta Vision Business (2 min)

```bash
nano .claude/knowledge/business/ma-vision.md
```

**Contenu minimal** :

```markdown
---
title: "Vision & Mission"
category: business
tags: [vision, mission, values]
author: Jay
date: 2026-01-29
---

# Vision & Mission

## Vision

[Où veux-tu être dans 5 ans?]

## Mission

[Quel impact veux-tu créer?]

## Valeurs

1. Authenticité
2. Inclusivité
3. Accessibilité

## Positionnement

[Comment tu te positionnes sur le marché?]
```

---

### Document 3 : Tes Offres (1 min)

```bash
nano .claude/knowledge/business/mes-offres.md
```

**Contenu minimal** :

```markdown
---
title: "Offres Services Actuelles"
category: business
tags: [offres, services, pricing]
author: Jay
date: 2026-01-29
---

# Mes Offres

## Offre 1 : [Nom]

- **Description** : [1-2 phrases]
- **Cible** : [Qui?]
- **Durée** : [Combien?]
- **Prix** : [€€€]

## Offre 2 : [Nom]

[Même format]

## Offre 3 : [Nom]

[Même format]
```

---

## Étape 3 : Ingérer Contenu (1 min)

```bash
# Ingérer tous les documents créés
/knowledge ingest .claude/knowledge/coaching/mon-approche.md --category coaching
/knowledge ingest .claude/knowledge/business/ma-vision.md --category business
/knowledge ingest .claude/knowledge/business/mes-offres.md --category business

# Ou en batch
/knowledge ingest .claude/knowledge/**/*.md
```

**Vérification** :
```bash
/knowledge stats

# Output attendu :
# Total Documents: 3
# Coaching: 1
# Business: 2
```

---

## Étape 4 : Tester Recherche (1 min)

```bash
# Test 1 : Recherche approche coaching
/knowledge search "approche coaching"

# → Devrait retourner : mon-approche.md

# Test 2 : Recherche offres
/knowledge search "offres services"

# → Devrait retourner : mes-offres.md

# Test 3 : Recherche vision
/knowledge search "vision mission"

# → Devrait retourner : ma-vision.md
```

**Si ça ne fonctionne pas** :
```bash
# Réindexer
/knowledge reindex

# Retry search
```

---

## Étape 5 : Valider Consultation Auto (1 min)

**Test consultation automatique** :

Pose cette question à Claude :

```
"Explique mon approche coaching unique"
```

**Résultat attendu** :

Claude devrait :
1. Consulter `.claude/knowledge/coaching/mon-approche.md`
2. Citer le contenu de TON document
3. Répondre avec TA philosophie (pas connaissances générales)

**Exemple réponse** :
```
"Selon ton approche coaching documentée, tu utilises principalement le Design Humain (focus Projecteurs), la neurodivergence, et la philosophie Shinkofa. Ton client idéal est [...]"
```

✅ **Si Claude cite ton contenu = Knowledge Library fonctionne !**

---

## 🎉 Bravo !

**Tu as maintenant** :
- ✅ Knowledge Library initialisée
- ✅ 3 documents essentiels créés
- ✅ Contenu indexé et recherchable
- ✅ Consultation automatique fonctionnelle

---

## 🚀 Prochaines Étapes

### Court Terme (Cette Semaine)

1. **Enrichir Coaching** :
   ```bash
   # Ajouter frameworks détaillés
   cp templates/coaching-document.md coaching/design-humain-projecteur.md
   # Éditer + ingérer
   ```

2. **Enrichir Business** :
   ```bash
   # Ajouter stratégie détaillée
   cp templates/business-document.md business/strategie-2026.md
   # Éditer + ingérer
   ```

3. **Ajouter Décisions Techniques** (si applicable) :
   ```bash
   cp templates/technical-decision.md technical/adr-001-stack-choice.md
   # Éditer + ingérer
   ```

### Moyen Terme (Ce Mois)

- Ingérer documents existants (formations, notes, business plans)
- Créer sous-catégories (coaching/neurodivergence/, business/shinkofa/)
- Ajouter relations entre documents

### Long Terme (Ce Trimestre)

- Activer embeddings (recherche sémantique avancée)
- Créer graphe connaissances (relations documents)
- Automatiser sync entre projets

---

## 📚 Ressources

- [README.md](../README.md) - Documentation complète
- [templates/](../templates/) - Templates document par catégorie
- [config-v2.json](../config-v2.json) - Configuration avancée

---

## ⚠️ Troubleshooting

### "Search ne retourne rien"

```bash
# Réindexer
/knowledge reindex

# Vérifier index
cat .claude/knowledge/index.json
```

### "Claude ne consulte pas automatiquement"

**Vérifier** :
- Keywords dans ta question matchent contenu documents
- Catégorie dans path correcte (coaching/, business/, technical/)
- Frontmatter YAML correct dans documents

**Forcer consultation** :
```
"@knowledge coaching Explique mon approche"
```

### "Ingestion échoue"

**Vérifier** :
- Frontmatter YAML valide (pas d'erreur syntaxe)
- Fichier encodé UTF-8
- Catégorie existe (coaching, business, technical)

---

**Quick Start Guide v1.0**
*10 minutes pour démarrer. Toute une vie pour maîtriser.* 🧠
