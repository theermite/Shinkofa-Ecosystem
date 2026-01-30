#!/bin/bash
# Script de test pour les endpoints Journals & Rituals
# Usage: ./test-journals-rituals.sh

# Configuration
API_URL="https://alpha.shinkofa.com/api/shizen"
USER_ID="jay"

echo "🧪 Test des endpoints Journals & Rituals"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function pour afficher les résultats
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -e "${YELLOW}📍 Test: $name${NC}"
    echo "   Method: $method $endpoint"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" -H "X-User-ID: $USER_ID")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "X-User-ID: $USER_ID" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ Success ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "   ${RED}❌ Failed ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# ===================
# JOURNALS TESTS
# ===================

echo "📔 JOURNALS TESTS"
echo "=================="
echo ""

# 1. Create Journal
TODAY=$(date +%Y-%m-%d)
test_endpoint "Create Journal (Today)" "POST" "/journals/" '{
  "date": "'$TODAY'",
  "energy_morning": 7,
  "energy_evening": 6,
  "intentions": "Tester les endpoints Journals/Rituals",
  "gratitudes": ["Tests fonctionnels", "API stable", "Documentation claire"],
  "successes": ["52 tests passent", "Documentation complète", "Commit réussi"],
  "learning": "Les endpoints fonctionnent parfaitement",
  "adjustments": "Continuer les tests"
}'

# 2. List Journals
test_endpoint "List Journals" "GET" "/journals/?limit=5"

# 3. Get Journal by Date
test_endpoint "Get Journal by Date ($TODAY)" "GET" "/journals/date/$TODAY"

# 4. Update Journal (if exists)
echo -e "${YELLOW}📍 Update Journal (you'll need to replace journal_id manually)${NC}"
echo "   Example: curl -X PUT \"$API_URL/journals/journal-xxx\" \\"
echo "            -H \"Content-Type: application/json\" \\"
echo "            -H \"X-User-ID: $USER_ID\" \\"
echo "            -d '{\"energy_evening\": 8}'"
echo ""

# ===================
# RITUALS TESTS
# ===================

echo "🧘 RITUALS TESTS"
echo "================"
echo ""

# 1. Create Morning Ritual
test_endpoint "Create Ritual (Morning Meditation)" "POST" "/rituals/" '{
  "label": "Morning meditation",
  "icon": "🧘",
  "completed": false,
  "category": "morning",
  "order": 1
}'

# 2. Create Evening Ritual
test_endpoint "Create Ritual (Evening Review)" "POST" "/rituals/" '{
  "label": "Evening review",
  "icon": "📝",
  "completed": false,
  "category": "evening",
  "order": 2
}'

# 3. List All Rituals
test_endpoint "List All Rituals" "GET" "/rituals/"

# 4. List Morning Rituals
test_endpoint "List Morning Rituals" "GET" "/rituals/?category=morning"

# 5. Reset All Rituals
test_endpoint "Reset All Rituals" "POST" "/rituals/reset"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo "Pour tester manuellement:"
echo "  - Créer journal: curl -X POST \"$API_URL/journals/\" -H \"Content-Type: application/json\" -H \"X-User-ID: $USER_ID\" -d '{...}'"
echo "  - Lister journals: curl \"$API_URL/journals/\" -H \"X-User-ID: $USER_ID\""
echo "  - Créer ritual: curl -X POST \"$API_URL/rituals/\" -H \"Content-Type: application/json\" -H \"X-User-ID: $USER_ID\" -d '{...}'"
echo "  - Lister rituals: curl \"$API_URL/rituals/\" -H \"X-User-ID: $USER_ID\""
echo ""
echo "📚 Documentation complète: apps/api-shizen-planner/docs/API-JOURNALS-RITUALS.md"
