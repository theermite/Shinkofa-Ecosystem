# =============================================================================
# Setup Project - Configuration Claude Code pour nouveau projet (Windows)
# Usage: .\setup-project.ps1 -ProjectPath "C:\chemin\projet" -Type "fullstack"
# Types: fullstack, coaching, website, tooling, desktop (défaut: fullstack)
# =============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,

    [Parameter(Mandatory=$false)]
    [ValidateSet("fullstack", "coaching", "website", "tooling", "desktop")]
    [string]$Type = "fullstack"
)

# Couleurs
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Chemin du script (dossier Prompt-2026-Optimized)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "🚀 Configuration Claude Code pour: $ProjectPath" -ForegroundColor Cyan
Write-Host "📦 Type de projet: $Type" -ForegroundColor Cyan
Write-Host ""

# Vérifier/créer le dossier projet
if (-not (Test-Path $ProjectPath)) {
    Write-Host "⚠️  Dossier n'existe pas, création..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
}

# Créer le dossier .claude
$ClaudeDir = Join-Path $ProjectPath ".claude"
New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
Write-Host "✅ Dossier .claude/ créé" -ForegroundColor Green

# Copier core/ (toujours)
$CoreSource = Join-Path $ScriptDir "core"
if (Test-Path $CoreSource) {
    Copy-Item -Path $CoreSource -Destination $ClaudeDir -Recurse -Force
    Write-Host "✅ core/ copié (Profil-Jay, Workflow, Rag-Context, Agent-Behavior, Conventions)" -ForegroundColor Green
}

# Déterminer le template selon le type
$TemplateFile = switch ($Type) {
    "fullstack" { Join-Path $ScriptDir "templates\CLAUDE-Fullstack.md" }
    "coaching"  { Join-Path $ScriptDir "templates\CLAUDE-Coaching.md" }
    "website"   {
        $f = Join-Path $ScriptDir "templates\CLAUDE-Website.md"
        if (Test-Path $f) { $f } else {
            Write-Host "⚠️  Template website non trouvé, utilisation de fullstack" -ForegroundColor Yellow
            Join-Path $ScriptDir "templates\CLAUDE-Fullstack.md"
        }
    }
    "tooling"   {
        $f = Join-Path $ScriptDir "templates\CLAUDE-Tooling.md"
        if (Test-Path $f) { $f } else {
            Write-Host "⚠️  Template tooling non trouvé, utilisation de fullstack" -ForegroundColor Yellow
            Join-Path $ScriptDir "templates\CLAUDE-Fullstack.md"
        }
    }
    "desktop"   {
        $f = Join-Path $ScriptDir "templates\CLAUDE-Desktop.md"
        if (Test-Path $f) { $f } else {
            Write-Host "⚠️  Template desktop non trouvé, utilisation de fullstack" -ForegroundColor Yellow
            Join-Path $ScriptDir "templates\CLAUDE-Fullstack.md"
        }
    }
}

if (Test-Path $TemplateFile) {
    Copy-Item -Path $TemplateFile -Destination (Join-Path $ClaudeDir "CLAUDE.md") -Force
    Write-Host "✅ CLAUDE.md copié (template: $Type)" -ForegroundColor Green
}

# Copier skills/
$SkillsSource = Join-Path $ScriptDir "skills"
if (Test-Path $SkillsSource) {
    Copy-Item -Path $SkillsSource -Destination $ClaudeDir -Recurse -Force
    Write-Host "✅ skills/ copié (Code-Review, Debug-Expert, Deployment, Session-Manager, Test-Writer, Refactoring-Planner)" -ForegroundColor Green
}

# Copier agents/
$AgentsSource = Join-Path $ScriptDir "agents"
if (Test-Path $AgentsSource) {
    Copy-Item -Path $AgentsSource -Destination $ClaudeDir -Recurse -Force
    Write-Host "✅ agents/ copié (Security-Auditor, Codebase-Explorer, Desktop-App, Electron, Ai-Ml, Frontend-Auditor)" -ForegroundColor Green
}

# Créer quickrefs/ et copier dev/
$QuickrefsDir = Join-Path $ClaudeDir "quickrefs"
New-Item -ItemType Directory -Path $QuickrefsDir -Force | Out-Null

$DevQuickrefs = Join-Path $ScriptDir "quickrefs\dev"
if (Test-Path $DevQuickrefs) {
    Copy-Item -Path $DevQuickrefs -Destination $QuickrefsDir -Recurse -Force
    Write-Host "✅ quickrefs/dev/ copié (Git, Docker, DB, Tests, Security, Performance)" -ForegroundColor Green
}

# Copier quickrefs spécifiques pour coaching
if ($Type -eq "coaching") {
    $CoachingQuickrefs = Join-Path $ScriptDir "quickrefs\coaching"
    if (Test-Path $CoachingQuickrefs) {
        Copy-Item -Path $CoachingQuickrefs -Destination $QuickrefsDir -Recurse -Force
        Write-Host "✅ quickrefs/coaching/ copié" -ForegroundColor Green
    }

    $PhiloQuickrefs = Join-Path $ScriptDir "quickrefs\philosophies"
    if (Test-Path $PhiloQuickrefs) {
        Copy-Item -Path $PhiloQuickrefs -Destination $QuickrefsDir -Recurse -Force
        Write-Host "✅ quickrefs/philosophies/ copié" -ForegroundColor Green
    }
}

# Copier checklists/
$ChecklistsSource = Join-Path $ScriptDir "checklists"
if (Test-Path $ChecklistsSource) {
    Copy-Item -Path $ChecklistsSource -Destination $ClaudeDir -Recurse -Force
    Write-Host "✅ checklists/ copié (Pre-Commit, Pre-Deploy, Session-Start, Session-End)" -ForegroundColor Green
}

# Copier hooks/
$HooksSource = Join-Path $ScriptDir "hooks"
if (Test-Path $HooksSource) {
    Copy-Item -Path $HooksSource -Destination $ClaudeDir -Recurse -Force
    Write-Host "✅ hooks/ copié" -ForegroundColor Green
}

# Résumé
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "Structure créée dans $ClaudeDir :"
Write-Host ""
Get-ChildItem $ClaudeDir | Format-Table Name, Mode -AutoSize
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Ouvrir $ClaudeDir\CLAUDE.md"
Write-Host "   2. Remplir les infos du projet (nom, stack, URLs)"
Write-Host "   3. Lancer Claude Code dans le projet"
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
