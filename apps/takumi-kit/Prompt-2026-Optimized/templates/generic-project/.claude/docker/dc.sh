#!/bin/bash
# ==============================================
# Docker Compose Helper Script
# Usage rapide sans répéter chemins longs
# ==============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_COMPOSE="$SCRIPT_DIR/docker-compose.yml"
DEV_COMPOSE="$SCRIPT_DIR/docker-compose.dev.yml"
PROD_COMPOSE="$SCRIPT_DIR/docker-compose.prod.yml"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================
# Fonctions
# ==============================================

show_help() {
    cat << EOF
${GREEN}Docker Compose Helper${NC}

${YELLOW}Usage:${NC}
  ./dc.sh <command> [options]

${YELLOW}Environnements:${NC}
  dev          Utilise docker-compose.dev.yml (développement)
  prod         Utilise docker-compose.prod.yml (production)

${YELLOW}Commandes:${NC}
  dev up       Démarre services en mode développement
  dev down     Arrête services
  dev logs     Affiche logs (+ -f pour follow)
  dev ps       Liste containers
  dev exec     Execute commande dans container
  dev build    Build images
  dev restart  Redémarre services

  prod up      Démarre services en mode production
  prod down    Arrête services
  prod logs    Affiche logs

${YELLOW}Exemples:${NC}
  ./dc.sh dev up -d              # Start dev en background
  ./dc.sh dev logs -f app        # Logs service app
  ./dc.sh dev exec app bash      # Shell dans container app
  ./dc.sh prod up -d             # Start prod
  ./dc.sh dev down -v            # Stop et supprimer volumes

${YELLOW}Raccourcis:${NC}
  ./dc.sh up       = ./dc.sh dev up
  ./dc.sh down     = ./dc.sh dev down
  ./dc.sh logs     = ./dc.sh dev logs
  ./dc.sh restart  = ./dc.sh dev restart
EOF
}

run_docker_compose() {
    local env=$1
    shift

    if [ "$env" = "dev" ]; then
        echo -e "${GREEN}Running in DEVELOPMENT mode${NC}"
        docker-compose -f "$BASE_COMPOSE" -f "$DEV_COMPOSE" "$@"
    elif [ "$env" = "prod" ]; then
        echo -e "${YELLOW}Running in PRODUCTION mode${NC}"
        docker-compose -f "$BASE_COMPOSE" -f "$PROD_COMPOSE" "$@"
    else
        echo -e "${RED}Unknown environment: $env${NC}"
        echo "Use 'dev' or 'prod'"
        exit 1
    fi
}

# ==============================================
# Main
# ==============================================

if [ $# -eq 0 ] || [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Raccourcis (assume dev par défaut)
if [ "$1" != "dev" ] && [ "$1" != "prod" ]; then
    run_docker_compose "dev" "$@"
else
    run_docker_compose "$@"
fi
