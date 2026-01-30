#!/bin/bash
# rag-first-reminder.sh - Rappel consultation RAG avant exploration code
# Hook type: user-prompt-submit
#
# Ce hook analyse le message utilisateur et rappelle de consulter
# le RAG si la requête nécessite exploration code/docs.
#
# Installation:
#   Ajouter dans ~/.claude/settings.json ou .claude/settings.json:
#   {
#     "hooks": {
#       "user-prompt-submit": [
#         {
#           "command": "bash ~/.claude/hooks/rag-first-reminder.sh \"$PROMPT\""
#         }
#       ]
#     }
#   }
#
# Philosophie Shinkofa: Consulter la sagesse existante avant créer du nouveau

set -e

# Get user prompt from argument or stdin
PROMPT="${1:-$(cat)}"

# Skip if empty
if [[ -z "$PROMPT" ]]; then
    exit 0
fi

# Skip if not in Claude Code project
if [[ ! -d ".claude" ]]; then
    exit 0
fi

# Skip if RAG/lessons not available
if [[ ! -d ".claude/cache/rag" ]] && [[ ! -d ".claude/cache/chromadb" ]] && [[ ! -d "Prompt-2026-Optimized/infrastructure/lessons" ]] && [[ ! -d "infrastructure/lessons" ]]; then
    exit 0
fi

# Convert to lowercase for matching
PROMPT_LOWER=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

# Keywords suggesting code exploration needed (FR + EN)
CODE_KEYWORDS=(
    # Actions création/modification
    "ajoute" "add" "créer" "create" "nouveau" "new"
    "modifier" "modify" "change" "update" "éditer" "edit"

    # Debug/fix
    "fix" "corriger" "bug" "debug" "erreur" "error"
    "problème" "problem" "issue"

    # Implémentation
    "implémenter" "implement" "coder" "code"
    "feature" "fonction" "function" "méthode" "method"

    # Refactor/optimisation
    "refactor" "refactoring" "optimiser" "optimize"
    "améliorer" "improve" "nettoyer" "clean"

    # Recherche info
    "où" "where" "comment" "how" "quoi" "what"
    "trouve" "find" "cherche" "search" "localise" "locate"

    # Éléments code
    "classe" "class" "composant" "component"
    "api" "endpoint" "route" "controller" "service"
    "database" "table" "schema" "query" "migration"
    "test" "testing" "spec"

    # Architecture
    "architecture" "structure" "pattern" "design"
)

# Skip keywords - user explicitly wants to bypass RAG
SKIP_KEYWORDS=(
    "sans rag" "skip rag" "no rag" "directement" "direct"
    "/rag" "git " "commit" "push" "pull" "status" "log"
    "merge" "rebase" "checkout" "branch"
)

# Check if prompt contains code-related keywords
NEEDS_RAG=false
for keyword in "${CODE_KEYWORDS[@]}"; do
    if [[ "$PROMPT_LOWER" == *"$keyword"* ]]; then
        NEEDS_RAG=true
        break
    fi
done

# Check skip keywords
for skip in "${SKIP_KEYWORDS[@]}"; do
    if [[ "$PROMPT_LOWER" == *"$skip"* ]]; then
        NEEDS_RAG=false
        break
    fi
done

# Display reminder if needed
if [[ "$NEEDS_RAG" == "true" ]]; then
    # Truncate prompt for display
    SHORT_PROMPT=$(echo "$PROMPT" | head -c 40)
    if [[ ${#PROMPT} -gt 40 ]]; then
        SHORT_PROMPT="${SHORT_PROMPT}..."
    fi

    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│  ⚠️  RAPPEL: Consulter le RAG en premier!                   │"
    echo "├─────────────────────────────────────────────────────────────┤"
    echo "│  Avant d'explorer le code, utilise:                         │"
    echo "│                                                              │"
    echo "│    /rag \"${SHORT_PROMPT}\"                                   │"
    echo "│    /search-registry \"keywords\"                              │"
    echo "│    /check-duplicate \"nom_fonction\"                          │"
    echo "│                                                              │"
    echo "│  Pour ignorer ce rappel: ajoute \"sans rag\" à ta demande    │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    echo "📚 Philosophie Shinkofa: Consulter la sagesse avant créer"
    echo ""
fi

exit 0
