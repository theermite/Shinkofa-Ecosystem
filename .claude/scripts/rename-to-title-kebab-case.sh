#!/bin/bash
# =============================================================================
# rename-to-title-kebab-case.sh
# Renomme les fichiers .md en Title-Kebab-Case selon les conventions Jay/Shinkofa
# Usage: ./rename-to-title-kebab-case.sh /chemin/projet [--dry-run]
# =============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Arguments
PROJECT_PATH="${1:-}"
DRY_RUN=false

if [ "$2" == "--dry-run" ]; then
    DRY_RUN=true
fi

# Exceptions - fichiers à NE PAS renommer
EXCEPTIONS=("README.md" "CLAUDE.md" "LICENSE" "LICENSE.md" "SKILL.md")

# Fonction pour vérifier si un nom est dans les exceptions
is_exception() {
    local name="$1"
    for exc in "${EXCEPTIONS[@]}"; do
        if [ "$name" == "$exc" ]; then
            return 0
        fi
    done
    return 1
}

# Fonction pour convertir en Title-Kebab-Case
to_title_kebab_case() {
    local name="$1"
    local base="${name%.md}"

    # Séparer par tirets ou underscores, capitaliser chaque partie
    local result=$(echo "$base" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | sed 's/ /-/g')

    echo "${result}.md"
}

# Validation
if [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Erreur: Chemin du projet requis${NC}"
    echo ""
    echo "Usage: ./rename-to-title-kebab-case.sh /chemin/projet [--dry-run]"
    exit 1
fi

if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Erreur: Le dossier n'existe pas: $PROJECT_PATH${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Rename-To-Title-Kebab-Case${NC}"
echo -e "${BLUE}   Projet: $PROJECT_PATH${NC}"
if [ "$DRY_RUN" == true ]; then
    echo -e "${YELLOW}   Mode: DRY RUN (aucune modification)${NC}"
fi
echo ""

# Vérifier si c'est un repo git
IS_GIT_REPO=false
if [ -d "$PROJECT_PATH/.git" ]; then
    IS_GIT_REPO=true
fi

# Trouver tous les fichiers .md à renommer
TO_RENAME=()
while IFS= read -r -d '' file; do
    filename=$(basename "$file")

    # Ignorer les exceptions
    if is_exception "$filename"; then
        continue
    fi

    # Calculer le nouveau nom
    new_name=$(to_title_kebab_case "$filename")

    # Vérifier si le renommage est nécessaire
    if [ "$filename" != "$new_name" ]; then
        TO_RENAME+=("$file|$new_name")
    fi
done < <(find "$PROJECT_PATH" -name "*.md" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/venv/*" \
    -not -path "*/.venv/*" \
    -not -path "*/__pycache__/*" \
    -print0 2>/dev/null)

# Afficher les fichiers à renommer
if [ ${#TO_RENAME[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les fichiers sont déjà en Title-Kebab-Case!${NC}"
    exit 0
fi

echo -e "${YELLOW}📝 Fichiers à renommer: ${#TO_RENAME[@]}${NC}"
echo ""

for item in "${TO_RENAME[@]}"; do
    old_path="${item%%|*}"
    new_name="${item##*|}"
    old_name=$(basename "$old_path")
    echo -e "   ${RED}$old_name${NC} → ${GREEN}$new_name${NC}"
done

echo ""

# Si DryRun, s'arrêter ici
if [ "$DRY_RUN" == true ]; then
    echo -e "${YELLOW}🔍 DRY RUN terminé. Aucun fichier modifié.${NC}"
    echo -e "${YELLOW}   Relancez sans --dry-run pour appliquer les changements.${NC}"
    exit 0
fi

# Demander confirmation
read -p "Voulez-vous renommer ces ${#TO_RENAME[@]} fichiers? (o/N) " confirmation
if [ "$confirmation" != "o" ] && [ "$confirmation" != "O" ]; then
    echo -e "${RED}❌ Annulé.${NC}"
    exit 0
fi

# Renommer les fichiers
renamed=0
errors=0

for item in "${TO_RENAME[@]}"; do
    old_path="${item%%|*}"
    new_name="${item##*|}"
    old_name=$(basename "$old_path")
    dir_path=$(dirname "$old_path")
    new_path="$dir_path/$new_name"

    if [ "$IS_GIT_REPO" == true ]; then
        # Utiliser git mv pour préserver l'historique
        cd "$PROJECT_PATH"
        relative_old="${old_path#$PROJECT_PATH/}"
        relative_new="${new_path#$PROJECT_PATH/}"

        if git mv "$relative_old" "$relative_new" 2>/dev/null; then
            echo -e "   ${GREEN}✅ $old_name → $new_name${NC}"
            ((renamed++))
        else
            echo -e "   ${RED}❌ Erreur: $old_name${NC}"
            ((errors++))
        fi
    else
        # Renommage simple
        if mv "$old_path" "$new_path" 2>/dev/null; then
            echo -e "   ${GREEN}✅ $old_name → $new_name${NC}"
            ((renamed++))
        else
            echo -e "   ${RED}❌ Erreur: $old_name${NC}"
            ((errors++))
        fi
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Terminé: $renamed fichiers renommés${NC}"
if [ $errors -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Erreurs: $errors${NC}"
fi
if [ "$IS_GIT_REPO" == true ]; then
    echo ""
    echo -e "${YELLOW}📌 N'oubliez pas de commiter les changements:${NC}"
    echo "   git commit -m \"refactor: Rename files to Title-Kebab-Case convention\""
fi
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
