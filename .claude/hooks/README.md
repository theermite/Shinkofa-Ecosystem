# Hooks Git & Claude Code

> Automatisation workflow avec hooks Git et Claude Code

---

## 📂 Hooks Disponibles

| Hook | Type | Platform | Purpose |
|------|------|----------|---------|
| **rag-first-reminder.sh** | user-prompt-submit | Linux/Mac | Rappel consultation RAG avant exploration code |
| **rag-first-reminder.ps1** | user-prompt-submit | Windows | Rappel consultation RAG (version PowerShell) |
| **settings.json** | Config | All | Configuration hooks existants |

---

## 🔧 Installation

### Option A : Installation Globale (Recommandé)

**Applique hooks à TOUS les projets Claude Code**

#### Linux/Mac

```bash
# 1. Créer dossier hooks global
mkdir -p ~/.claude/hooks

# 2. Copier hooks
cp Prompt-2026-Optimized/hooks/rag-first-reminder.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/rag-first-reminder.sh

# 3. Éditer ~/.claude/settings.json
nano ~/.claude/settings.json
```

Ajouter :
```json
{
  "hooks": {
    "user-prompt-submit": [
      {
        "command": "bash ~/.claude/hooks/rag-first-reminder.sh \"$PROMPT\""
      }
    ]
  }
}
```

#### Windows

```powershell
# 1. Créer dossier hooks global
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\hooks"

# 2. Copier hook
Copy-Item "Prompt-2026-Optimized\hooks\rag-first-reminder.ps1" "$env:USERPROFILE\.claude\hooks\"

# 3. Éditer %USERPROFILE%\.claude\settings.json
notepad "$env:USERPROFILE\.claude\settings.json"
```

Ajouter :
```json
{
  "hooks": {
    "user-prompt-submit": [
      {
        "command": "powershell -ExecutionPolicy Bypass -File \"%USERPROFILE%\\.claude\\hooks\\rag-first-reminder.ps1\" -Prompt \"$PROMPT\""
      }
    ]
  }
}
```

---

### Option B : Installation Par Projet

**Applique hooks à UN SEUL projet spécifique**

```bash
# Dans le projet
cd /chemin/vers/projet

# Copier hooks
mkdir -p .claude/hooks
cp ~/Instruction-Claude-Code/Prompt-2026-Optimized/hooks/rag-first-reminder.{sh,ps1} .claude/hooks/

# Éditer .claude/settings.json (projet)
```

Config identique à Option A, mais chemin relatif :
```json
{
  "hooks": {
    "user-prompt-submit": [
      {
        "command": "bash .claude/hooks/rag-first-reminder.sh \"$PROMPT\""
      }
    ]
  }
}
```

---

## 🎯 Usage

### Hook RAG-First Reminder

**Déclenchement automatique** quand prompt contient keywords code :
- Actions : `ajoute`, `créer`, `modifier`, `fix`, `implémenter`
- Recherche : `où`, `comment`, `trouve`
- Éléments : `classe`, `fonction`, `api`, `database`, `test`

**Affichage** :
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  RAPPEL: Consulter le RAG en premier!                   │
├─────────────────────────────────────────────────────────────┤
│  Avant d'explorer le code, utilise:                         │
│                                                              │
│    /rag "ta requête..."                                     │
│    /search-registry "keywords"                              │
│    /check-duplicate "nom_fonction"                          │
│                                                              │
│  Pour ignorer ce rappel: ajoute "sans rag" à ta demande    │
└─────────────────────────────────────────────────────────────┘

📚 Philosophie Shinkofa: Consulter la sagesse avant créer
```

**Bypass hook** :
```
User: "Ajoute fonction email sans rag"
→ Hook détecte "sans rag" et ne s'affiche PAS
```

**Exemples** :

✅ **Hook S'AFFICHE** :
```
"Ajoute une fonction pour envoyer des emails"
"Où est définie la classe User ?"
"Comment fonctionne l'auth JWT ?"
"Créer un endpoint API pour les tags"
```

❌ **Hook NE S'AFFICHE PAS** :
```
"git status"
"git commit -m 'fix'"
"/rag query pertinente"  (déjà en train d'utiliser RAG)
"Ajoute fonction sans rag"  (bypass explicite)
```

---

## 🔍 Vérification Installation

### Test Hook Fonctionnel

**Linux/Mac** :
```bash
# Test direct hook
echo "Ajoute une fonction test" | bash ~/.claude/hooks/rag-first-reminder.sh

# Devrait afficher le rappel RAG
```

**Windows** :
```powershell
# Test direct hook
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.claude\hooks\rag-first-reminder.ps1" -Prompt "Ajoute une fonction test"

# Devrait afficher le rappel RAG
```

### Vérifier Config Claude Code

```bash
# Voir config actuelle
cat ~/.claude/settings.json

# Ou dans projet
cat .claude/settings.json
```

Vérifier présence section `"hooks"`.

---

## 🛠️ Troubleshooting

### Hook Ne S'Affiche Pas

**Check 1 : Hook exécutable ?**
```bash
# Linux/Mac
ls -la ~/.claude/hooks/rag-first-reminder.sh
# Devrait avoir 'x' (exécutable)

# Si non
chmod +x ~/.claude/hooks/rag-first-reminder.sh
```

**Check 2 : Config correcte ?**
```bash
# Valider JSON
cat ~/.claude/settings.json | jq .

# Erreur ? Fix syntax
```

**Check 3 : Chemin correct ?**
```bash
# Vérifier chemin dans settings.json correspond au fichier réel
ls -la $(cat ~/.claude/settings.json | jq -r '.hooks."user-prompt-submit"[0].command' | cut -d' ' -f2)
```

### Hook S'Affiche Trop Souvent

Ajouter keywords skip dans hook :
```bash
# Éditer hook
nano ~/.claude/hooks/rag-first-reminder.sh

# Ajouter dans SKIP_KEYWORDS
SKIP_KEYWORDS=(
    # ... existants
    "mon_keyword_custom"
)
```

### Windows Execution Policy

Si erreur PowerShell :
```powershell
# Vérifier policy actuelle
Get-ExecutionPolicy -Scope CurrentUser

# Si "Restricted", changer
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# Confirmer
Get-ExecutionPolicy -Scope CurrentUser
# Devrait afficher "RemoteSigned"
```

---

## 📚 Référence Hooks Claude Code

### Types Hooks Disponibles

| Hook Type | Quand | Usage |
|-----------|-------|-------|
| `user-prompt-submit` | Avant traitement prompt utilisateur | Validation, rappels |
| `tool-call` | Avant exécution tool | Logging, validation |
| `tool-result` | Après résultat tool | Post-processing |

**Source** : [Documentation Claude Code](https://docs.anthropic.com/claude/docs/claude-code-hooks)

### Format Config

```json
{
  "hooks": {
    "<hook-type>": [
      {
        "command": "<bash/powershell command>",
        "description": "Optional description"
      }
    ]
  }
}
```

### Variables Disponibles

| Variable | Contenu | Disponible dans |
|----------|---------|-----------------|
| `$PROMPT` | Prompt utilisateur | `user-prompt-submit` |
| `$TOOL` | Nom tool appelé | `tool-call` |
| `$ARGS` | Arguments tool | `tool-call` |
| `$RESULT` | Résultat tool | `tool-result` |

---

## 🎯 Hooks Futurs (Roadmap)

**Phase 2 (Q1 2026)** :
- `pre-commit-security.sh` — Scan sécurité avant commit
- `pre-commit-validator.sh` — Validation code (linting, tests)
- `post-write-rag-updater.sh` — Re-indexe RAG après modif docs

**Phase 3 (Q2 2026)** :
- `post-commit.sh` — Log activité, update registries
- `auto-commit-suggester.sh` — Suggère message commit intelligent

---

## 💡 Tips

**Pour Jay** :
- ✅ Installe hooks globalement (Option A) pour tous projets
- ✅ Test hook après installation (`echo "test" | bash hook.sh`)
- ✅ Si rappel agaçant, ajoute "sans rag" à tes requêtes

**Pour TAKUMI** :
- ✅ Respecte rappel hook (consulte RAG avant exploration)
- ✅ Si hook manquant, suggère installation à Jay
- ✅ Documente nouveaux hooks créés dans ce README

---

**Version** : 1.0.0
**Date** : 2026-01-28
**Philosophie** : Shinkofa — Automatiser la sagesse, préserver l'apprentissage
