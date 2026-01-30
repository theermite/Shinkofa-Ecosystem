#!/bin/bash

# propagate-to-project.sh
# Script pour propager la méthodologie v4.0 vers un projet

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <target-project-path> [--dry-run]"
    echo ""
    echo "Example:"
    echo "  $0 ~/projets/Shinkofa-Platform"
    echo "  $0 ~/projets/SLF-Esport --dry-run"
    exit 1
fi

TARGET_PROJECT="$1"
DRY_RUN=false

if [ "$2" == "--dry-run" ]; then
    DRY_RUN=true
    print_warning "DRY RUN MODE - No changes will be made"
fi

# Validate target project exists
if [ ! -d "$TARGET_PROJECT" ]; then
    print_error "Target project does not exist: $TARGET_PROJECT"
    exit 1
fi

# Get source (this script's parent directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

print_step "Propagating methodology v4.0"
echo "  Source: $SOURCE_ROOT"
echo "  Target: $TARGET_PROJECT"
echo ""

# Navigate to target
cd "$TARGET_PROJECT"

PROJECT_NAME=$(basename "$TARGET_PROJECT")
print_step "Project: $PROJECT_NAME"
echo ""

# Step 1: Check if git repo
if [ ! -d ".git" ]; then
    print_warning "Not a git repository. Initialize? (y/n)"
    if [ "$DRY_RUN" = false ]; then
        read -r response
        if [ "$response" = "y" ]; then
            git init
            print_success "Git repository initialized"
        fi
    fi
else
    print_success "Git repository found"
fi

# Step 2: Create feature branch
if [ "$DRY_RUN" = false ]; then
    print_step "Creating feature branch..."

    # Check if branch already exists
    if git rev-parse --verify feature/methodologie-v4 >/dev/null 2>&1; then
        print_warning "Branch feature/methodologie-v4 already exists"
        echo "  Switch to it? (y/n)"
        read -r response
        if [ "$response" = "y" ]; then
            git checkout feature/methodologie-v4
        fi
    else
        git checkout -b feature/methodologie-v4
        print_success "Branch created: feature/methodologie-v4"
    fi
else
    print_step "[DRY RUN] Would create branch: feature/methodologie-v4"
fi

# Step 3: Create .claude structure
print_step "Creating .claude/ structure..."

DIRS=(
    ".claude/agents/Project-Planner"
    ".claude/agents/Documentation-Generator"
    ".claude/agents/Context-Guardian"
    ".claude/agents/Build-Deploy-Test"
    ".claude/agents/Code-Reviewer"
    ".claude/agents/Debug-Investigator"
    ".claude/agents/Refactor-Safe"
    ".claude/commands"
    ".claude/scripts"
    ".claude/knowledge/coaching"
    ".claude/knowledge/business"
    ".claude/knowledge/technical"
    ".claude/docker"
    ".claude/docs"
)

for dir in "${DIRS[@]}"; do
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$dir"
    else
        echo "  [DRY RUN] Would create: $dir"
    fi
done

if [ "$DRY_RUN" = false ]; then
    print_success "Directory structure created"
else
    print_step "[DRY RUN] Would create directory structure"
fi

# Step 4: Copy agents
print_step "Copying agents..."

AGENTS=(
    "Project-Planner"
    "Documentation-Generator"
    "Context-Guardian"
    "Build-Deploy-Test"
    "Code-Reviewer"
    "Debug-Investigator"
    "Refactor-Safe"
)

for agent in "${AGENTS[@]}"; do
    SOURCE_AGENT="$SOURCE_ROOT/Prompt-2026-Optimized/agents/$agent"
    TARGET_AGENT=".claude/agents/$agent"

    if [ -d "$SOURCE_AGENT" ]; then
        if [ "$DRY_RUN" = false ]; then
            cp -r "$SOURCE_AGENT"/* "$TARGET_AGENT/" 2>/dev/null || true
            print_success "  Copied: $agent"
        else
            echo "  [DRY RUN] Would copy: $agent"
        fi
    else
        print_warning "  Source not found: $agent (skipping)"
    fi
done

# Step 5: Copy commands
print_step "Copying commands..."

if [ -d "$SOURCE_ROOT/Prompt-2026-Optimized/.claude/commands" ]; then
    if [ "$DRY_RUN" = false ]; then
        cp "$SOURCE_ROOT/Prompt-2026-Optimized/.claude/commands"/*.md .claude/commands/ 2>/dev/null || true
        COMMAND_COUNT=$(ls .claude/commands/*.md 2>/dev/null | wc -l)
        print_success "  Copied $COMMAND_COUNT commands"
    else
        echo "  [DRY RUN] Would copy commands from source"
    fi
else
    print_warning "  Commands directory not found in source"
fi

# Step 6: Copy scripts
print_step "Copying scripts..."

if [ -d "$SOURCE_ROOT/Prompt-2026-Optimized/.claude/scripts" ]; then
    if [ "$DRY_RUN" = false ]; then
        cp "$SOURCE_ROOT/Prompt-2026-Optimized/.claude/scripts"/*.py .claude/scripts/ 2>/dev/null || true
        chmod +x .claude/scripts/*.py 2>/dev/null || true
        SCRIPT_COUNT=$(ls .claude/scripts/*.py 2>/dev/null | wc -l)
        print_success "  Copied $SCRIPT_COUNT scripts"
    else
        echo "  [DRY RUN] Would copy scripts from source"
    fi
else
    print_warning "  Scripts directory not found in source"
fi

# Step 7: Copy Docker configs
print_step "Copying Docker configuration..."

if [ -d "$SOURCE_ROOT/Prompt-2026-Optimized/.claude/docker" ]; then
    if [ "$DRY_RUN" = false ]; then
        cp -r "$SOURCE_ROOT/Prompt-2026-Optimized/.claude/docker"/* .claude/docker/ 2>/dev/null || true
        print_success "  Docker configs copied"
    else
        echo "  [DRY RUN] Would copy Docker configs"
    fi
else
    print_warning "  Docker configs not found in source"
fi

# Step 8: Copy documentation templates
print_step "Copying documentation templates..."

DOC_TEMPLATES="$SOURCE_ROOT/Prompt-2026-Optimized/templates/generic-project/.claude/docs"

if [ -d "$DOC_TEMPLATES" ]; then
    if [ "$DRY_RUN" = false ]; then
        cp "$DOC_TEMPLATES"/*.md .claude/docs/ 2>/dev/null || true
        DOC_COUNT=$(ls .claude/docs/*.md 2>/dev/null | wc -l)
        print_success "  Copied $DOC_COUNT documentation templates"
    else
        echo "  [DRY RUN] Would copy documentation templates"
    fi
else
    print_warning "  Documentation templates not found in source"
fi

# Step 9: Initialize Knowledge Library
print_step "Initializing Knowledge Library..."

if [ "$DRY_RUN" = false ]; then
    # Create config.json
    cat > .claude/knowledge/config.json <<EOF
{
  "version": "1.0",
  "chunk_size": 800,
  "chunk_overlap": 100,
  "categories": {
    "coaching": {
      "description": "Frameworks et méthodologies coaching",
      "enabled": true,
      "auto_tags": true
    },
    "business": {
      "description": "Business plan Shinkofa, stratégie",
      "enabled": true,
      "auto_tags": true
    },
    "technical": {
      "description": "Architecture, patterns, décisions techniques",
      "enabled": true,
      "auto_tags": true
    }
  },
  "auto_enrich": true,
  "embeddings": {
    "enabled": false,
    "provider": "openai",
    "model": "text-embedding-3-small"
  }
}
EOF

    # Create index.json
    cat > .claude/knowledge/index.json <<EOF
{
  "version": "1.0",
  "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "documents": [],
  "stats": {
    "total_documents": 0,
    "total_chunks": 0,
    "categories": {
      "coaching": 0,
      "business": 0,
      "technical": 0
    }
  }
}
EOF

    print_success "Knowledge Library initialized"
else
    echo "  [DRY RUN] Would initialize Knowledge Library"
fi

# Step 10: Copy CLAUDE.md template
print_step "Copying CLAUDE.md template..."

if [ -f "$SOURCE_ROOT/.claude/CLAUDE.md" ]; then
    if [ "$DRY_RUN" = false ]; then
        if [ -f ".claude/CLAUDE.md" ]; then
            print_warning "  CLAUDE.md already exists - creating backup"
            cp .claude/CLAUDE.md .claude/CLAUDE.md.backup
        fi

        cp "$SOURCE_ROOT/.claude/CLAUDE.md" .claude/CLAUDE.md

        # Replace project name placeholder
        sed -i "s/Instruction-Claude-Code/$PROJECT_NAME/g" .claude/CLAUDE.md 2>/dev/null || \
            sed -i '' "s/Instruction-Claude-Code/$PROJECT_NAME/g" .claude/CLAUDE.md 2>/dev/null || true

        print_success "  CLAUDE.md copied (needs manual adaptation)"
    else
        echo "  [DRY RUN] Would copy CLAUDE.md"
    fi
else
    print_warning "  CLAUDE.md not found in source"
fi

# Step 11: Git add
if [ "$DRY_RUN" = false ]; then
    print_step "Adding files to git..."
    git add .claude/ 2>/dev/null || true
    print_success "Files added to git staging"
else
    print_step "[DRY RUN] Would add .claude/ to git"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Propagation completed!"
echo ""
echo "📋 Next steps (MANUAL):"
echo ""
echo "  1. Adapt .claude/CLAUDE.md to project context"
echo "     - Update stack information"
echo "     - Add project-specific priorities"
echo "     - Describe architecture"
echo ""
echo "  2. Generate documentation:"
echo "     /doc-generate"
echo ""
echo "  3. Verify documentation quality:"
echo "     /doc-check"
echo ""
echo "  4. Commit changes:"
echo "     git commit -m \"feat: Integrate methodology v4.0 (Phase 1+2)"
echo ""
echo "     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>\""
echo ""
echo "  5. Push feature branch:"
echo "     git push origin feature/methodologie-v4"
echo ""
echo "  6. Create Pull Request and review"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN completed - no changes were made"
fi
