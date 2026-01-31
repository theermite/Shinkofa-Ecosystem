# /search-registry

Recherche dans les registres modulaires sans charger tout le contenu.

## Usage

```bash
/search-registry "terme de recherche"
/search-registry "docker volume" --category lessons
/search-registry "migration" --all
```

## Description

Recherche intelligente dans tous les registres modulaires pour trouver des leçons, fonctions, ou patterns existants sans surcharger le contexte.

## Avantages

✅ **Pas de limite tokens** - Ne charge que les résultats pertinents
✅ **Rapide** - grep optimisé sur fichiers fragmentés
✅ **Ciblé** - Résultats avec contexte et localisation exacte
✅ **Smart** - Suggestions si aucun résultat exact

## Workflow

```
1. User demande : /search-registry "docker permissions"

2. Claude recherche dans :
   - Prompt-2026-Optimized/infrastructure/lessons/*.md
   - (Future: reference/, functions/, etc.)

3. Affiche résultats :
   📍 infrastructure/lessons/docker.md:106
   ### [DOCKER] [VOLUME] [PERMISSIONS] Upload fichiers échoue
   ...

4. Propose actions :
   - Lire fichier complet
   - Voir leçons similaires
   - Créer nouvelle leçon
```

## Implémentation

```bash
# Recherche dans lessons
grep -r -i -n "terme" Prompt-2026-Optimized/infrastructure/lessons/ \
  | head -20 \
  | while read line; do
      # Parse et formatte résultats
      echo "$line"
    done

# Si aucun résultat
echo "⚠️ Aucun résultat pour 'terme'"
echo "💡 Suggestions : [mots similaires]"
```

## Options

| Option | Description | Exemple |
|--------|-------------|---------|
| `--category` | Limite à une catégorie | `--category docker` |
| `--all` | Cherche partout (lessons + future registries) | `--all` |
| `--exact` | Correspondance exacte | `--exact "PermissionError"` |
| `--recent` | Seulement leçons récentes (30 jours) | `--recent` |

## Exemples

### Recherche Simple
```bash
/search-registry "docker"
```

**Résultat** :
```
🔍 Recherche : "docker"

📂 infrastructure/lessons/docker.md (3 résultats)
  - Ligne 106: [DOCKER] [VOLUME] [PERMISSIONS] Upload fichiers échoue
  - Ligne 145: [DOCKER] [VOLUME] Données perdues après rebuild
  - Ligne 171: [DOCKER] [NETWORK] Containers ne communiquent pas

💡 Actions :
  1. view infrastructure/lessons/docker.md
  2. /search-registry "docker volume" (affiner)
```

### Recherche Ciblée
```bash
/search-registry "migration" --category database
```

**Résultat** :
```
🔍 Recherche : "migration" dans database

📂 infrastructure/lessons/database.md (1 résultat)
  - Ligne 201: [DB] [MIGRATION] Migration Alembic échoue en prod

✅ 1 leçon trouvée
```

### Pas de Résultat
```bash
/search-registry "kubernetes"
```

**Résultat** :
```
⚠️ Aucun résultat pour "kubernetes"

💡 Voulez-vous :
  1. Documenter une nouvelle leçon sur ce sujet ?
  2. Rechercher dans la documentation externe ?
  3. Chercher un terme similaire : "docker", "deploy"
```

## Catégories Disponibles

| Catégorie | Fichier | Contenu |
|-----------|---------|---------|
| `lessons/docker` | docker.md | Containers, volumes, networks |
| `lessons/database` | database.md | Migrations, schemas |
| `lessons/auth` | auth.md | JWT, sessions, sécurité |
| `lessons/deploy` | deploy.md | SSL, CI/CD, production |
| `lessons/deps` | deps.md | Packages, breaking changes |
| `lessons/desktop` | desktop.md | Tkinter, Electron |
| `lessons/ai-llm` | ai-llm.md | Ollama, RAG, LLM |
| `lessons/frontend` | frontend.md | React, UI |
| `lessons/backend` | backend.md | API, serveurs |
| `lessons/performance` | performance.md | Optimisations |
| `lessons/config` | config.md | Configuration |

## Intégration avec Workflow

**AVANT de créer du code** :
```
1. /search-registry "fonction similaire"
2. Si trouvé → RÉUTILISER
3. Si pas trouvé → /check-duplicate pour confirmer
4. Créer nouveau code
```

**AVANT de résoudre un bug** :
```
1. /search-registry "type d'erreur"
2. Lire leçons similaires
3. Appliquer solutions éprouvées
```

## Voir Aussi

- `/check-duplicate` - Vérifier doublons avant création
- [README.md](../../Prompt-2026-Optimized/infrastructure/lessons/README.md) - Index complet

---

**Version** : 1.0
**Créé** : 2026-01-26
