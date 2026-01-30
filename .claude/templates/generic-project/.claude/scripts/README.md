# Scripts Claude Code

Scripts utilitaires pour la gestion du projet avec Claude Code.

---

## 📝 Scripts Disponibles

### rag-manager.py

**Description** : Gestion intelligente de la consultation documentation projet (RAG workflow).

**Usage** :
```bash
# Vérifier quelle doc consulter pour une action
python .claude/scripts/rag-manager.py check [action]

# Lire un document documentation
python .claude/scripts/rag-manager.py read [file] [keywords...]

# Rechercher dans docs + lessons learned
python .claude/scripts/rag-manager.py search [keywords...]

# Afficher statut documentation projet
python .claude/scripts/rag-manager.py status
```

**Exemples** :
```bash
# Avant de modifier l'architecture
python .claude/scripts/rag-manager.py check architecture
# → Suggère : ARCHITECTURE.md, CONTEXT.md

# Lire sections spécifiques
python .claude/scripts/rag-manager.py read ARCHITECTURE.md security deployment
# → Extrait sections sur sécurité et déploiement

# Chercher erreur connue
python .claude/scripts/rag-manager.py search "docker permission denied"
# → Cherche dans docs + lessons learned

# Vérifier état documentation
python .claude/scripts/rag-manager.py status
# → Score 75% (6/8 fichiers présents)
```

**Intégration Claude Code** :
- Appelé automatiquement via `/rag-status`
- Utilisé par agents pour consultation RAG
- Intégrable dans hooks pre-commit

---

## 🔗 Commandes Associées

| Commande | Description |
|----------|-------------|
| `/rag-status` | Statut documentation (wrapper rag-manager.py status) |
| `/init-rag` | Initialiser structure documentation |
| `/search-registry` | Recherche dans lessons learned globaux |

---

## 📦 Dépendances

**Python 3.8+** requis.

Aucune dépendance externe (stdlib uniquement).

---

## 🔧 Configuration

Le script détecte automatiquement :
- Racine projet (via `.claude/` directory)
- Chemin vers documentation (`.claude/docs/`)
- Chemin vers lessons learned (local ou global)

Aucune configuration manuelle nécessaire.

---

## 🚀 Intégration CI/CD

### Vérification Documentation Complète

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
          score=$(python .claude/scripts/rag-manager.py status | grep "Score" | grep -oP '\d+')
          if [ "$score" -lt 75 ]; then
            echo "❌ Documentation score too low: $score%"
            exit 1
          fi
          echo "✅ Documentation OK: $score%"
```

### Pre-Commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Vérifier doc à jour
python .claude/scripts/rag-manager.py status > /dev/null
if [ $? -ne 0 ]; then
  echo "⚠️ Documentation incomplète"
  echo "💡 Run: /init-rag"
  exit 1
fi
```

---

## 📚 Voir Aussi

- [Commande /rag-status](../../.claude/commands/rag-status.md)
- [Commande /init-rag](../../.claude/commands/init-rag.md)
- [RAG-CONTEXT.md](../../../../core/RAG-CONTEXT.md)

---

**Version** : 1.0
**Créé** : 2026-01-26
