# QuickRef: Commandes Claude Code

> Guide complet des commandes et raccourcis Claude Code CLI.

---

## Commandes Slash (/)

### Session & Navigation

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/help` | Affiche l'aide et les commandes disponibles | `/help` |
| `/clear` | Efface l'historique de conversation | `/clear` |
| `/compact` | Résume la conversation pour économiser le contexte | `/compact` |
| `/status` | Affiche l'état actuel (tokens, fichiers, etc.) | `/status` |
| `/quit` ou `/exit` | Quitte Claude Code | `/quit` |

### Gestion de Contexte

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/add <fichier>` | Ajoute un fichier au contexte | `/add src/main.ts` |
| `/add <dossier>` | Ajoute un dossier au contexte | `/add src/components/` |
| `/remove <fichier>` | Retire un fichier du contexte | `/remove src/old.ts` |
| `/files` | Liste les fichiers actuellement en contexte | `/files` |

### Modes de Travail

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/plan` | Entre en mode planification (lecture seule) | `/plan` |
| `/code` | Retourne en mode implémentation | `/code` |
| `/review` | Mode revue de code | `/review` |

### Git & Versioning

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/commit` | Crée un commit avec message généré | `/commit` |
| `/diff` | Affiche les changements non commités | `/diff` |
| `/git <cmd>` | Exécute une commande git | `/git status` |

### Outils & Debug

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/run <cmd>` | Exécute une commande shell | `/run npm test` |
| `/terminal` | Ouvre un terminal interactif | `/terminal` |
| `/doctor` | Diagnostique les problèmes de configuration | `/doctor` |

---

## Raccourcis Clavier

### Navigation

| Raccourci | Action |
|-----------|--------|
| `Ctrl+C` | Annule l'opération en cours |
| `Ctrl+D` | Quitte Claude Code |
| `↑` / `↓` | Navigue dans l'historique des commandes |
| `Tab` | Auto-complétion |
| `Ctrl+L` | Efface l'écran (garde conversation) |

### Édition

| Raccourci | Action |
|-----------|--------|
| `Ctrl+A` | Début de ligne |
| `Ctrl+E` | Fin de ligne |
| `Ctrl+W` | Supprime mot précédent |
| `Ctrl+U` | Supprime jusqu'au début de ligne |

---

## Paramètres de Lancement

```bash
# Lancer dans un dossier spécifique
claude --cwd /path/to/project

# Mode verbose (debug)
claude --verbose

# Avec un modèle spécifique
claude --model claude-3-opus

# Sans historique précédent
claude --no-history

# Avec un fichier de config custom
claude --config ./my-config.json
```

---

## Configuration (.claude/)

### Structure Recommandée
```
projet/
└── .claude/
    ├── CLAUDE.md         # Instructions projet (obligatoire)
    ├── settings.json     # Config locale
    ├── core/             # Fichiers core (profil, workflow)
    ├── skills/           # Skills spécialisés
    ├── agents/           # Subagents
    ├── quickrefs/        # Références rapides
    └── hooks/            # Hooks pre/post actions
```

### settings.json
```json
{
  "model": "claude-3-opus",
  "maxTokens": 200000,
  "temperature": 0.7,
  "autoCompact": true,
  "compactThreshold": 0.7,
  "tools": {
    "bash": { "enabled": true },
    "edit": { "enabled": true },
    "web": { "enabled": true }
  }
}
```

---

## Syntaxe Spéciale dans les Messages

### Références Fichiers
```
Regarde le fichier @src/main.ts
```
Le `@` permet de référencer rapidement un fichier.

### Blocs de Code
```
Crée ce fichier:
\`\`\`typescript:src/utils.ts
export function helper() {
  return true;
}
\`\`\`
```
Le format `:chemin` après le langage indique où créer le fichier.

### Instructions Multi-Lignes
```
"""
Ceci est une instruction
sur plusieurs lignes
qui sera traitée comme un bloc.
"""
```

---

## MCP (Model Context Protocol)

### Commandes MCP
| Commande | Description |
|----------|-------------|
| `/mcp list` | Liste les serveurs MCP connectés |
| `/mcp status` | État des connexions MCP |
| `/mcp tools` | Outils disponibles via MCP |

### Configuration MCP
```json
// .claude/mcp-config.json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-github"],
      "env": { "GITHUB_TOKEN": "..." }
    },
    "filesystem": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-filesystem", "/path"]
    }
  }
}
```

---

## Bonnes Pratiques

### Économie de Contexte
```bash
# Utiliser /compact régulièrement
/compact

# Avant une nouvelle tâche majeure
/clear

# Ajouter seulement les fichiers nécessaires
/add src/specific-file.ts
# Éviter: /add src/  (tout le dossier)
```

### Communication Efficace
```
✅ BON:
"Ajoute une fonction validateEmail dans src/utils.ts
qui retourne true si l'email est valide"

❌ MAUVAIS:
"Fais quelque chose pour les emails"
```

### Checkpoints
```
✅ Demander validation avant gros changements:
"Voici mon plan. Tu valides avant que j'implémente ?"

✅ Commiter régulièrement:
/commit après chaque feature complète
```

---

## Dépannage

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| Contexte saturé | `/compact` ou `/clear` |
| Fichier non trouvé | Vérifier chemin avec `/files` |
| Commande bloquée | `Ctrl+C` pour annuler |
| Config non chargée | Vérifier `.claude/CLAUDE.md` existe |

### Diagnostic
```bash
# Vérifier la configuration
/doctor

# Voir l'état complet
/status

# Mode verbose pour debug
claude --verbose
```

---

## Commandes Jay-Specific (Skills)

Ces commandes activent les skills personnalisés :

| Commande | Skill | Usage |
|----------|-------|-------|
| "nouvelle session" | Session-Manager | Démarre session avec questions énergie |
| "on arrête" | Session-Manager | Sauvegarde état et résumé |
| "review ce code" | Code-Review | Audit qualité/sécurité |
| "debug ça" | Debug-Expert | Analyse root cause |
| "deploy" | Deployment | Checklist déploiement |
| "ajoute des tests" | Test-Writer | Génère tests |
| "refactor" | Refactoring-Planner | Plan refactoring safe |
| "vérifie les deps" | Dependency-Auditor | Audit dépendances |

---

---

## Nouveautés Claude Code 2.1.x (2026)

### Checkpoints & /rewind

Claude Code sauvegarde automatiquement l'état du code **avant chaque modification**.

| Action | Commande/Raccourci |
|--------|-------------------|
| Revenir en arrière | Double-tap `Esc` |
| Choisir un checkpoint | `/rewind` |
| Voir les checkpoints | `/checkpoints` |

**Usage recommandé** :
```
1. Tenter une approche expérimentale
2. Si ça ne fonctionne pas → /rewind
3. Essayer approche alternative
```

### Task Management /tasks

Système de tâches avec dépendances pour workflows complexes.

| Commande | Description |
|----------|-------------|
| `/tasks` | Voir toutes les tâches |
| `/tasks add "Description"` | Ajouter une tâche |
| `/tasks done <id>` | Marquer comme terminée |

**Quand utiliser** :
- Refactoring multi-fichiers
- Migration avec étapes séquentielles
- Features avec dépendances

### Keyboard Shortcuts /keybindings

Raccourcis personnalisables depuis v2.1.18.

| Commande | Description |
|----------|-------------|
| `/keybindings` | Configurer les raccourcis |
| `/keybindings reset` | Restaurer les défauts |

**Exemples personnalisation** :
- Créer séquences de touches (chords)
- Raccourcis par contexte

### LSP Tool (Code Intelligence)

Fonctionnalités de Language Server Protocol :

| Feature | Description |
|---------|-------------|
| Go-to-definition | Navigation vers définition |
| Find references | Trouver tous les usages |
| Hover documentation | Doc au survol |

**Activation** : Configurer dans `settings.json`

### Auto-Compact MCP

Les outils MCP > 10% du contexte sont automatiquement différés via MCPSearch.

**Économie** : 134K → 5K tokens (96% réduction)

**Désactiver** : Ajouter `MCPSearch` à `disallowedTools` dans settings

### Skill Hot-Reload

Les skills se rechargent **automatiquement** sans redémarrer.

**Emplacements** :
- `~/.claude/skills/`
- `.claude/skills/`

**Usage dev** : Modifier un skill → Tester immédiatement

### Permissions Wildcards

Nouveaux patterns pour permissions :

| Pattern | Exemple |
|---------|---------|
| Wildcard début | `Bash(* install)` |
| Wildcard milieu | `Bash(git * main)` |
| Wildcard fin | `Bash(npm *)` |
| MCP server complet | `mcp__server__*` |

**Commande** : `/permissions` avec `/` pour filtrer

### History Autocomplete (Bash Mode)

En mode bash, tape un début de commande + `Tab` pour compléter depuis l'historique.

---

## Nouveaux Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| Double `Esc` | Rewind au checkpoint précédent |
| `Shift+Tab` (plan mode) | Auto-accept edits |
| `Tab` | Accepter suggestion de prompt |
| `Enter` | Soumettre sans accepter suggestion |

---

## Variables Arguments Skills

**Nouvelle syntaxe (2.1.19)** :
```
# Ancien
$ARGUMENTS.0

# Nouveau (recommandé)
$ARGUMENTS[0]
$0  # Shorthand
$1  # Deuxième argument
```

---

## Commandes Diagnostic

| Commande | Description |
|----------|-------------|
| `/doctor` | Vérifie config + détecte règles permissions inaccessibles |
| `/context` | Usage contexte avec breakdown détaillé |
| `/permissions` | Gérer permissions avec recherche (/) |
| `/config` | Configuration avec recherche |

---

**Version** : 2.0 | **Mise à jour** : 2026-01-24 | **Trigger** : Questions sur commandes Claude, premiers pas, optimisation usage
