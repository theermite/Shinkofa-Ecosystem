# rag-first-reminder.ps1 - Rappel consultation RAG (Windows)
# Hook type: user-prompt-submit
#
# Installation:
#   Ajouter dans ~/.claude/settings.json ou .claude/settings.json:
#   {
#     "hooks": {
#       "user-prompt-submit": [
#         {
#           "command": "powershell -ExecutionPolicy Bypass -File \"$env:USERPROFILE\\.claude\\hooks\\rag-first-reminder.ps1\" -Prompt \"$PROMPT\""
#         }
#       ]
#     }
#   }
#
# Philosophie Shinkofa: Consulter la sagesse existante avant créer du nouveau

param(
    [string]$Prompt = ""
)

# Read from stdin if no argument
if ([string]::IsNullOrEmpty($Prompt)) {
    $Prompt = [Console]::In.ReadToEnd()
}

# Skip if empty
if ([string]::IsNullOrEmpty($Prompt)) {
    exit 0
}

# Skip if not in Claude Code project
if (-not (Test-Path ".claude")) {
    exit 0
}

# Skip if RAG/lessons not available
$HasRag = (Test-Path ".claude/cache/rag") -or
          (Test-Path ".claude/cache/chromadb") -or
          (Test-Path "Prompt-2026-Optimized/infrastructure/lessons") -or
          (Test-Path "infrastructure/lessons")

if (-not $HasRag) {
    exit 0
}

# Convert to lowercase
$PromptLower = $Prompt.ToLower()

# Keywords suggesting code exploration needed (FR + EN)
$CodeKeywords = @(
    # Actions création/modification
    "ajoute", "add", "créer", "create", "nouveau", "new",
    "modifier", "modify", "change", "update", "éditer", "edit",

    # Debug/fix
    "fix", "corriger", "bug", "debug", "erreur", "error",
    "problème", "problem", "issue",

    # Implémentation
    "implémenter", "implement", "coder", "code",
    "feature", "fonction", "function", "méthode", "method",

    # Refactor/optimisation
    "refactor", "refactoring", "optimiser", "optimize",
    "améliorer", "improve", "nettoyer", "clean",

    # Recherche info
    "où", "where", "comment", "how", "quoi", "what",
    "trouve", "find", "cherche", "search", "localise", "locate",

    # Éléments code
    "classe", "class", "composant", "component",
    "api", "endpoint", "route", "controller", "service",
    "database", "table", "schema", "query", "migration",
    "test", "testing", "spec",

    # Architecture
    "architecture", "structure", "pattern", "design"
)

# Skip keywords - user explicitly wants to bypass RAG
$SkipKeywords = @(
    "sans rag", "skip rag", "no rag", "directement", "direct",
    "/rag", "git ", "commit", "push", "pull", "status", "log",
    "merge", "rebase", "checkout", "branch"
)

# Check if needs RAG
$NeedsRag = $false
foreach ($keyword in $CodeKeywords) {
    if ($PromptLower.Contains($keyword)) {
        $NeedsRag = $true
        break
    }
}

# Check skip keywords
foreach ($skip in $SkipKeywords) {
    if ($PromptLower.Contains($skip)) {
        $NeedsRag = $false
        break
    }
}

# Display reminder if needed
if ($NeedsRag) {
    # Truncate prompt for display
    $ShortPrompt = if ($Prompt.Length -gt 40) {
        $Prompt.Substring(0, 40) + "..."
    } else {
        $Prompt
    }

    Write-Host ""
    Write-Host "+-------------------------------------------------------------+"
    Write-Host "|  [!] RAPPEL: Consulter le RAG en premier!                   |"
    Write-Host "+-------------------------------------------------------------+"
    Write-Host "|  Avant d'explorer le code, utilise:                         |"
    Write-Host "|                                                             |"
    Write-Host "|    /rag `"$ShortPrompt`"                                    |"
    Write-Host "|    /search-registry `"keywords`"                            |"
    Write-Host "|    /check-duplicate `"nom_fonction`"                        |"
    Write-Host "|                                                             |"
    Write-Host "|  Pour ignorer: ajoute 'sans rag' a ta demande              |"
    Write-Host "+-------------------------------------------------------------+"
    Write-Host ""
    Write-Host "📚 Philosophie Shinkofa: Consulter la sagesse avant créer"
    Write-Host ""
}

exit 0
