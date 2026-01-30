# /rag-status

Affiche l'état de la documentation du projet actuel et vérifie la complétude du système RAG.

## Usage

```bash
/rag-status
```

## Description

Vérifie et affiche :
- ✅ Fichiers documentation présents dans `.claude/docs/`
- ❌ Fichiers documentation manquants
- 📊 Score de complétude (0-100%)
- 📖 Nombre de lessons learned disponibles
- 💡 Recommandations pour améliorer la doc

## Pourquoi C'est Critique

Sans documentation structurée :
- ❌ Claude n'a pas de contexte projet
- ❌ Patterns documentés perdus
- ❌ Duplication de code/décisions
- ❌ RAG workflow inefficace

Avec documentation complète :
- ✅ Claude comprend architecture
- ✅ Patterns réutilisables
- ✅ Décisions documentées (ADR)
- ✅ Consultation RAG efficace

## Output Attendu

```
📊 Statut Documentation Projet

📁 Répertoire: /path/to/project/.claude/docs/

✅ Présents (6/8):
   ✅ ARCHITECTURE.md (12,450 bytes)
   ✅ API_REFERENCE.md (18,230 bytes)
   ✅ DATABASE_SCHEMA.md (9,870 bytes)
   ✅ CODING_STANDARDS.md (15,340 bytes)
   ✅ TESTING_GUIDE.md (14,120 bytes)
   ✅ CONTEXT.md (11,890 bytes)

❌ Manquants (2/8):
   ❌ CHANGELOG.md
   ❌ KNOWN_ISSUES.md

💡 Utilise: /init-rag pour initialiser

📖 Lessons Learned: 12 fichiers dans infrastructure/lessons

📊 Score Documentation: 75%
✅ Documentation bonne, quelques fichiers manquants
```

## Implémentation

### Méthode 1 : Script Python (Recommandé)

```bash
python .claude/scripts/rag-manager.py status
```

### Méthode 2 : Vérification Manuelle

```bash
# Lister fichiers présents
ls .claude/docs/

# Vérifier chaque fichier standard
for file in ARCHITECTURE.md API_REFERENCE.md DATABASE_SCHEMA.md \
            CODING_STANDARDS.md TESTING_GUIDE.md CONTEXT.md \
            CHANGELOG.md KNOWN_ISSUES.md; do
  if [ -f ".claude/docs/$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file"
  fi
done
```

## Quand Utiliser

### ✅ Utilise /rag-status

- Début de session sur nouveau projet
- Après clonage d'un repo
- Avant de commencer une feature majeure
- Pour vérifier état documentation

### 🔄 Fréquence Recommandée

- **Nouveau projet** : Immédiatement après clonage
- **Projet existant** : Hebdomadaire
- **Avant release** : Systématique

## Workflow Standard

```
1. Ouvre projet
   ↓
2. /rag-status
   ↓
3. SI score < 50% → /init-rag
   ↓
4. SI score 50-75% → Compléter fichiers manquants
   ↓
5. SI score > 75% → Continuer développement
```

## Intégration avec Autres Commandes

| Commande | Relation |
|----------|----------|
| `/init-rag` | Crée structure documentation manquante |
| `/search-registry` | Recherche dans lessons learned |
| `/check-duplicate` | Vérifie si pattern existe déjà |
| `/pre-commit` | Valide doc à jour avant commit |

## Score Documentation

| Score | Statut | Action |
|-------|--------|--------|
| **100%** | 🎉 Parfait | Maintenir à jour |
| **75-99%** | ✅ Bon | Compléter fichiers manquants |
| **50-74%** | ⚠️ Moyen | Initialiser + compléter |
| **< 50%** | ❌ Insuffisant | /init-rag immédiatement |

## Fichiers Vérifiés

| Fichier | Obligatoire | Description |
|---------|-------------|-------------|
| `ARCHITECTURE.md` | ✅ CRITIQUE | Architecture système, stack, déploiement |
| `API_REFERENCE.md` | ✅ CRITIQUE | Documentation API complète |
| `DATABASE_SCHEMA.md` | ✅ CRITIQUE | Schéma DB, tables, relations |
| `CODING_STANDARDS.md` | ✅ CRITIQUE | Standards code, conventions |
| `TESTING_GUIDE.md` | ✅ IMPORTANT | Guide tests, patterns |
| `CONTEXT.md` | ✅ IMPORTANT | Contexte métier, business rules |
| `CHANGELOG.md` | 🟡 Recommandé | Historique versions |
| `KNOWN_ISSUES.md` | 🟡 Recommandé | Bugs connus, workarounds |

## Exemples

### Exemple 1 : Projet Nouveau (Score 0%)

```
/rag-status

📊 Statut Documentation Projet
❌ Manquants (8/8)
📊 Score Documentation: 0%
❌ Documentation insuffisante, initialisation recommandée

💡 Action: /init-rag
```

### Exemple 2 : Projet Partiellement Documenté

```
/rag-status

✅ Présents (5/8)
❌ Manquants (3/8):
   ❌ TESTING_GUIDE.md
   ❌ CHANGELOG.md
   ❌ KNOWN_ISSUES.md

📊 Score: 62%
⚠️ Documentation incomplète, à compléter

💡 Priorité:
   1. Créer TESTING_GUIDE.md
   2. Initialiser CHANGELOG.md
   3. Documenter bugs dans KNOWN_ISSUES.md
```

### Exemple 3 : Projet Bien Documenté

```
/rag-status

✅ Présents (8/8)
📖 Lessons Learned: 12 fichiers
📊 Score: 100%
🎉 Documentation complète!

💡 Maintenir à jour:
   - CHANGELOG.md à chaque release
   - KNOWN_ISSUES.md quand bugs découverts
   - ARCHITECTURE.md si changements majeurs
```

## Avantages

✅ **Visibilité** : État doc en un coup d'œil
✅ **Actionnable** : Recommandations concrètes
✅ **Préventif** : Détecte lacunes documentation
✅ **Standardisé** : Même structure tous projets

## Intégration CI/CD

Ajouter vérification dans pipeline :

```yaml
# .github/workflows/docs-check.yml
name: Documentation Check

on: [push, pull_request]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check documentation completeness
        run: |
          python .claude/scripts/rag-manager.py status
          # Fail si score < 75%
          score=$(python .claude/scripts/rag-manager.py status | grep "Score" | grep -oP '\d+')
          if [ "$score" -lt 75 ]; then
            echo "❌ Documentation score too low: $score%"
            exit 1
          fi
```

## Troubleshooting

### Erreur : "Répertoire .claude/docs/ non trouvé"

**Solution** :
```bash
/init-rag
```

### Erreur : "Lessons Learned non trouvé"

**Cause** : Repository Instruction-Claude-Code pas cloné ou lien cassé

**Solution** :
```bash
# Vérifier chemin vers Instruction-Claude-Code
echo $INSTRUCTION_CLAUDE_CODE_PATH

# Ou créer lessons local
mkdir -p .claude/lessons
```

### Score 100% mais contenu obsolète

**Rappel** : Le score mesure la PRÉSENCE, pas la QUALITÉ

**Action** :
- Review manuelle des fichiers
- Mise à jour contenu obsolète
- Commit changements

## Voir Aussi

- `/init-rag` - Initialiser structure documentation
- `/search-registry` - Rechercher dans lessons learned
- `rag-manager.py` - Script Python sous-jacent
- [RAG-CONTEXT.md](../../Prompt-2026-Optimized/core/RAG-CONTEXT.md)

---

**Version** : 1.0
**Créé** : 2026-01-26
**Impact** : CRITIQUE - Vérification état documentation projet
