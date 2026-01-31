# /init-rag

Initialise la structure documentation complète pour le projet actuel, en copiant les templates standards.

## Usage

```bash
/init-rag
/init-rag --force  # Écrase fichiers existants
```

## Description

Crée les 8 fichiers documentation standard dans `.claude/docs/` :

1. **ARCHITECTURE.md** - Architecture système, stack, déploiement
2. **API_REFERENCE.md** - Documentation API complète
3. **DATABASE_SCHEMA.md** - Schéma DB, tables, relations
4. **CODING_STANDARDS.md** - Standards code, conventions
5. **TESTING_GUIDE.md** - Guide tests, patterns
6. **CONTEXT.md** - Contexte métier, business rules
7. **CHANGELOG.md** - Historique versions
8. **KNOWN_ISSUES.md** - Bugs connus, workarounds

## Pourquoi C'est Critique

**Sans structure doc** :
- ❌ Contexte projet perdu entre sessions
- ❌ Décisions architecture non documentées
- ❌ Patterns réinventés à chaque fois
- ❌ RAG workflow inefficace

**Avec structure doc** :
- ✅ Claude comprend contexte projet
- ✅ Architecture documentée (ADR)
- ✅ Patterns réutilisables
- ✅ Onboarding rapide nouveaux devs
- ✅ RAG workflow optimal

## Workflow d'Initialisation

```
1. User: /init-rag
   ↓
2. Claude vérifie .claude/docs/ existe
   ↓
3. SI existe → Liste fichiers présents/manquants
   ↓
4. Claude copie templates manquants
   ↓
5. Claude personnalise placeholders [Nom Projet]
   ↓
6. Claude affiche résumé + prochaines étapes
```

## Output Attendu

```
🚀 Initialisation Structure Documentation

📁 Création répertoire: .claude/docs/

📝 Copie templates depuis: templates/generic-project/.claude/docs/

✅ ARCHITECTURE.md créé (12.5 KB)
✅ API_REFERENCE.md créé (18.2 KB)
✅ DATABASE_SCHEMA.md créé (9.8 KB)
✅ CODING_STANDARDS.md créé (15.3 KB)
✅ TESTING_GUIDE.md créé (14.1 KB)
✅ CONTEXT.md créé (11.9 KB)
✅ CHANGELOG.md créé (8.4 KB)
✅ KNOWN_ISSUES.md créé (10.2 KB)

🎉 Structure documentation initialisée !

📊 Score Documentation: 100% (8/8 fichiers)

🔧 Prochaines Étapes:

1. Remplacer [Nom Projet] par le nom réel du projet
2. Remplir sections TODO dans chaque fichier
3. Documenter architecture actuelle dans ARCHITECTURE.md
4. Ajouter endpoints existants dans API_REFERENCE.md
5. Documenter schéma DB dans DATABASE_SCHEMA.md

💡 Utilise /rag-status pour vérifier l'état
```

## Implémentation

### Méthode 1 : Via Claude Code (Recommandé)

```markdown
Claude détecte /init-rag et exécute :

1. Vérifie projet a .claude/ directory
2. Crée .claude/docs/ si manquant
3. Copie templates depuis templates/generic-project/.claude/docs/
4. Remplace placeholders (si info disponible)
5. Affiche résumé
```

### Méthode 2 : Script Manuel

```bash
#!/bin/bash
# init-rag.sh

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
DOCS_DIR="$PROJECT_ROOT/.claude/docs"
TEMPLATES_DIR="path/to/Instruction-Claude-Code/Prompt-2026-Optimized/templates/generic-project/.claude/docs"

# Créer répertoire
mkdir -p "$DOCS_DIR"

# Copier templates
for file in ARCHITECTURE.md API_REFERENCE.md DATABASE_SCHEMA.md \
            CODING_STANDARDS.md TESTING_GUIDE.md CONTEXT.md \
            CHANGELOG.md KNOWN_ISSUES.md; do
  if [ ! -f "$DOCS_DIR/$file" ]; then
    cp "$TEMPLATES_DIR/$file" "$DOCS_DIR/$file"
    echo "✅ $file créé"
  else
    echo "⏭️ $file existe déjà (skip)"
  fi
done

echo "🎉 Structure documentation initialisée !"
```

## Quand Utiliser

### ✅ Utilise /init-rag

- **Nouveau projet** : Immédiatement après création
- **Projet existant sans doc** : Score < 50% sur /rag-status
- **Migration vers cette méthodologie** : Première fois
- **Projet cloné** : Si .claude/docs/ manquant

### ❌ N'utilise PAS /init-rag

- **Doc déjà complète** : Score > 75% sur /rag-status
- **Personnalisation en cours** : Risque d'écraser travail

## Options

### --force (Écrasement)

```bash
/init-rag --force
```

**Comportement** :
- Écrase fichiers existants
- ⚠️ ATTENTION : Perte de contenu personnalisé
- Utilise uniquement si doc corrompue

**Workflow sécurisé avec --force** :
```
1. Backup documentation existante
   cp -r .claude/docs .claude/docs.backup

2. Forcer réinitialisation
   /init-rag --force

3. Merger changements manuellement
   diff -r .claude/docs .claude/docs.backup
```

### --project-name (Personnalisation)

```bash
/init-rag --project-name "My Awesome App"
```

**Comportement** :
- Remplace `[Nom Projet]` par "My Awesome App"
- Remplace `[DATE]` par date actuelle
- Remplace `[VERSION]` par version Git si disponible

## Structure Créée

```
.claude/
├── docs/
│   ├── ARCHITECTURE.md       # Architecture système
│   ├── API_REFERENCE.md      # Documentation API
│   ├── DATABASE_SCHEMA.md    # Schéma DB
│   ├── CODING_STANDARDS.md   # Standards code
│   ├── TESTING_GUIDE.md      # Guide tests
│   ├── CONTEXT.md            # Contexte métier
│   ├── CHANGELOG.md          # Historique versions
│   └── KNOWN_ISSUES.md       # Bugs connus
└── scripts/
    └── rag-manager.py        # Script gestion RAG
```

## Personnalisation Post-Init

### Checklist Obligatoire

Après `/init-rag`, compléter :

- [ ] **ARCHITECTURE.md**
  - [ ] Remplacer `[Nom Projet]`
  - [ ] Remplir stack technique actuelle
  - [ ] Documenter composants existants
  - [ ] Ajouter diagramme architecture réelle

- [ ] **API_REFERENCE.md**
  - [ ] Ajouter endpoints existants
  - [ ] Documenter authentification actuelle
  - [ ] Compléter exemples requests/responses

- [ ] **DATABASE_SCHEMA.md**
  - [ ] Documenter tables existantes
  - [ ] Ajouter relations réelles
  - [ ] Lister indexes actuels

- [ ] **CODING_STANDARDS.md**
  - [ ] Adapter aux langages du projet
  - [ ] Ajouter conventions spécifiques équipe

- [ ] **CONTEXT.md**
  - [ ] Documenter business rules réelles
  - [ ] Ajouter contraintes projet
  - [ ] Définir personas utilisateurs

- [ ] **CHANGELOG.md**
  - [ ] Ajouter versions existantes
  - [ ] Documenter features actuelles

## Intégration Git

Après initialisation, commit la structure :

```bash
git add .claude/docs/
git commit -m "docs: Initialize RAG documentation structure

- Add 8 standard documentation files
- Enable RAG workflow for project
- Setup knowledge base for Claude Code

Generated via /init-rag command"
```

## Exemples

### Exemple 1 : Nouveau Projet

```
User: /init-rag

Claude:
🚀 Initialisation Structure Documentation

✅ 8 fichiers créés dans .claude/docs/
📊 Score Documentation: 100%

🔧 Prochaines étapes:
1. Remplacer placeholders
2. Documenter architecture
3. Commit structure: git add .claude/docs/
```

### Exemple 2 : Projet Partiellement Documenté

```
User: /init-rag

Claude:
📁 .claude/docs/ existe déjà

✅ Présents (3/8):
   ARCHITECTURE.md
   API_REFERENCE.md
   CODING_STANDARDS.md

📝 Création fichiers manquants (5/8):
   ✅ DATABASE_SCHEMA.md créé
   ✅ TESTING_GUIDE.md créé
   ✅ CONTEXT.md créé
   ✅ CHANGELOG.md créé
   ✅ KNOWN_ISSUES.md créé

📊 Score: 37% → 100%
🎉 Documentation maintenant complète !
```

### Exemple 3 : Réinitialisation Forcée

```
User: /init-rag --force

Claude:
⚠️ ATTENTION : --force va écraser fichiers existants

Fichiers qui seront écrasés:
   - ARCHITECTURE.md (modifié il y a 2 jours)
   - API_REFERENCE.md (modifié il y a 1 semaine)

💡 Backup recommandé:
   cp -r .claude/docs .claude/docs.backup

Confirmes-tu la réinitialisation forcée ? (y/N)
```

## Avantages

✅ **Standardisation** : Structure identique tous projets
✅ **Rapidité** : 8 fichiers en 1 commande
✅ **Templates complets** : Exemples et guides inclus
✅ **RAG-ready** : Structure optimisée pour consultation
✅ **Onboarding** : Nouveaux devs trouvent info rapidement

## Maintenance Post-Init

### Mise à Jour Régulière

| Fichier | Fréquence | Déclencheur |
|---------|-----------|-------------|
| `ARCHITECTURE.md` | Mensuel | Changement architecture |
| `API_REFERENCE.md` | Par endpoint | Ajout/modif API |
| `DATABASE_SCHEMA.md` | Par migration | Changement DB |
| `CODING_STANDARDS.md` | Trimestriel | Évolution conventions |
| `TESTING_GUIDE.md` | Trimestriel | Nouveaux patterns tests |
| `CONTEXT.md` | Mensuel | Évolution business rules |
| `CHANGELOG.md` | Par release | Chaque version |
| `KNOWN_ISSUES.md` | Par bug | Bug découvert |

### Vérification Périodique

```bash
# Hebdomadaire
/rag-status

# Si score < 90%
# Identifier fichiers obsolètes
# Mettre à jour contenu
```

## Troubleshooting

### Erreur : "Templates non trouvés"

**Cause** : Chemin templates incorrect

**Solution** :
```bash
# Vérifier chemin vers Instruction-Claude-Code
echo $INSTRUCTION_CLAUDE_CODE_PATH

# Ou définir manuellement
export TEMPLATES_PATH="path/to/templates"
```

### Erreur : "Permission denied"

**Cause** : Pas de permissions écriture

**Solution** :
```bash
# Vérifier permissions
ls -la .claude/

# Corriger si nécessaire
chmod -R u+w .claude/
```

### Fichiers créés mais vides

**Cause** : Erreur copie templates

**Solution** :
```bash
# Vérifier templates source
ls -lh path/to/templates/generic-project/.claude/docs/

# Recopier manuellement si nécessaire
```

## Intégration CI/CD

Vérifier doc initialisée dans pipeline :

```yaml
# .github/workflows/docs-init-check.yml
name: Documentation Init Check

on: [push]

jobs:
  check-docs-init:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check documentation initialized
        run: |
          if [ ! -d ".claude/docs" ]; then
            echo "❌ Documentation not initialized"
            echo "💡 Run: /init-rag"
            exit 1
          fi

          # Vérifier score
          score=$(python .claude/scripts/rag-manager.py status | grep "Score" | grep -oP '\d+')
          if [ "$score" -lt 75 ]; then
            echo "❌ Documentation incomplete: $score%"
            exit 1
          fi

          echo "✅ Documentation OK: $score%"
```

## Voir Aussi

- `/rag-status` - Vérifier état documentation
- `/search-registry` - Rechercher dans docs
- [Templates Source](../../Prompt-2026-Optimized/templates/generic-project/.claude/docs/)
- [RAG-CONTEXT.md](../../Prompt-2026-Optimized/core/RAG-CONTEXT.md)

---

**Version** : 1.0
**Créé** : 2026-01-26
**Impact** : CRITIQUE - Initialisation structure documentation projet
