#!/bin/bash
# =============================================================================
# Setup Project - Configuration Claude Code pour nouveau projet
# Usage: ./setup-project.sh /chemin/vers/projet [type]
# Types: fullstack, coaching, website, tooling, desktop (défaut: fullstack)
# =============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Chemin du script (dossier Prompt-2026-Optimized)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Arguments
PROJECT_PATH="${1:-}"
PROJECT_TYPE="${2:-fullstack}"

# Validation
if [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Erreur: Chemin du projet requis${NC}"
    echo ""
    echo "Usage: ./setup-project.sh /chemin/vers/projet [type]"
    echo ""
    echo "Types disponibles:"
    echo "  fullstack  - Apps web complètes (Next.js + FastAPI)"
    echo "  coaching   - Outils coaching Shinkofa"
    echo "  website    - Sites vitrines"
    echo "  tooling    - Scripts et CLI"
    echo "  desktop    - Applications desktop"
    echo ""
    echo "Exemple: ./setup-project.sh /home/user/mon-projet fullstack"
    exit 1
fi

# Vérifier que le projet existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${YELLOW}⚠️  Dossier n'existe pas, création...${NC}"
    mkdir -p "$PROJECT_PATH"
fi

echo -e "${BLUE}🚀 Configuration Claude Code pour: ${PROJECT_PATH}${NC}"
echo -e "${BLUE}📦 Type de projet: ${PROJECT_TYPE}${NC}"
echo ""

# Créer le dossier .claude
CLAUDE_DIR="${PROJECT_PATH}/.claude"
mkdir -p "$CLAUDE_DIR"
echo -e "${GREEN}✅ Dossier .claude/ créé${NC}"

# Copier core/ (toujours)
if [ -d "${SCRIPT_DIR}/core" ]; then
    cp -r "${SCRIPT_DIR}/core" "$CLAUDE_DIR/"
    echo -e "${GREEN}✅ core/ copié (Profil-Jay, Workflow, Rag-Context, Agent-Behavior, Conventions)${NC}"
fi

# Copier le template CLAUDE.md selon le type
TEMPLATE_FILE=""
case $PROJECT_TYPE in
    "fullstack")
        TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Fullstack.md"
        ;;
    "coaching")
        TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Coaching.md"
        ;;
    "website")
        # Si pas de template website, utiliser fullstack
        if [ -f "${SCRIPT_DIR}/templates/CLAUDE-Website.md" ]; then
            TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Website.md"
        else
            TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Fullstack.md"
            echo -e "${YELLOW}⚠️  Template website non trouvé, utilisation de fullstack${NC}"
        fi
        ;;
    "tooling")
        if [ -f "${SCRIPT_DIR}/templates/CLAUDE-Tooling.md" ]; then
            TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Tooling.md"
        else
            TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Fullstack.md"
            echo -e "${YELLOW}⚠️  Template tooling non trouvé, utilisation de fullstack${NC}"
        fi
        ;;
    "desktop")
        if [ -f "${SCRIPT_DIR}/templates/CLAUDE-Desktop.md" ]; then
            TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Desktop.md"
        else
            TEMPLATE_FILE="${SCRIPT_DIR}/templates/CLAUDE-Fullstack.md"
            echo -e "${YELLOW}⚠️  Template desktop non trouvé, utilisation de fullstack${NC}"
        fi
        ;;
    *)
        echo -e "${RED}❌ Type inconnu: ${PROJECT_TYPE}${NC}"
        exit 1
        ;;
esac

if [ -f "$TEMPLATE_FILE" ]; then
    cp "$TEMPLATE_FILE" "${CLAUDE_DIR}/CLAUDE.md"
    echo -e "${GREEN}✅ CLAUDE.md copié (template: ${PROJECT_TYPE})${NC}"
fi

# Copier skills/ (optionnel mais recommandé)
if [ -d "${SCRIPT_DIR}/skills" ]; then
    cp -r "${SCRIPT_DIR}/skills" "$CLAUDE_DIR/"
    echo -e "${GREEN}✅ skills/ copié (Code-Review, Debug-Expert, Deployment, Session-Manager, Test-Writer, Refactoring-Planner)${NC}"
fi

# Copier agents/ (optionnel)
if [ -d "${SCRIPT_DIR}/agents" ]; then
    cp -r "${SCRIPT_DIR}/agents" "$CLAUDE_DIR/"
    echo -e "${GREEN}✅ agents/ copié (Security-Auditor, Codebase-Explorer, Desktop-App, Electron, Ai-Ml, Frontend-Auditor)${NC}"
fi

# Copier quickrefs/dev/ (toujours utile)
if [ -d "${SCRIPT_DIR}/quickrefs/dev" ]; then
    mkdir -p "${CLAUDE_DIR}/quickrefs"
    cp -r "${SCRIPT_DIR}/quickrefs/dev" "${CLAUDE_DIR}/quickrefs/"
    echo -e "${GREEN}✅ quickrefs/dev/ copié (Git, Docker, DB, Tests, Security, Performance)${NC}"
fi

# Copier quickrefs spécifiques selon le type
if [ "$PROJECT_TYPE" == "coaching" ]; then
    if [ -d "${SCRIPT_DIR}/quickrefs/coaching" ]; then
        cp -r "${SCRIPT_DIR}/quickrefs/coaching" "${CLAUDE_DIR}/quickrefs/"
        echo -e "${GREEN}✅ quickrefs/coaching/ copié${NC}"
    fi
    if [ -d "${SCRIPT_DIR}/quickrefs/philosophies" ]; then
        cp -r "${SCRIPT_DIR}/quickrefs/philosophies" "${CLAUDE_DIR}/quickrefs/"
        echo -e "${GREEN}✅ quickrefs/philosophies/ copié${NC}"
    fi
fi

# Copier checklists/
if [ -d "${SCRIPT_DIR}/checklists" ]; then
    cp -r "${SCRIPT_DIR}/checklists" "$CLAUDE_DIR/"
    echo -e "${GREEN}✅ checklists/ copié (Pre-Commit, Pre-Deploy, Session-Start, Session-End)${NC}"
fi

# Copier hooks/settings.json
if [ -f "${SCRIPT_DIR}/hooks/settings.json" ]; then
    mkdir -p "${CLAUDE_DIR}/hooks"
    cp "${SCRIPT_DIR}/hooks/settings.json" "${CLAUDE_DIR}/hooks/"
    echo -e "${GREEN}✅ hooks/settings.json copié${NC}"
fi

# Résumé
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuration terminée!${NC}"
echo ""
echo -e "Structure créée dans ${CLAUDE_DIR}:"
echo ""
ls -la "$CLAUDE_DIR" 2>/dev/null || true
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "   1. Ouvrir ${CLAUDE_DIR}/CLAUDE.md"
echo "   2. Remplir les infos du projet (nom, stack, URLs)"
echo "   3. Lancer Claude Code dans le projet"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
