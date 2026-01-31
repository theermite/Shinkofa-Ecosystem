# ==============================================
# Docker Compose Helper Script (PowerShell)
# Usage rapide sans répéter chemins longs
# ==============================================

param(
    [string]$Environment = "dev",
    [Parameter(ValueFromRemainingArguments)]
    [string[]]$Args
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseCompose = Join-Path $ScriptDir "docker-compose.yml"
$DevCompose = Join-Path $ScriptDir "docker-compose.dev.yml"
$ProdCompose = Join-Path $ScriptDir "docker-compose.prod.yml"

# ==============================================
# Fonctions
# ==============================================

function Show-Help {
    Write-Host "Docker Compose Helper" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\dc.ps1 <command> [options]"
    Write-Host ""
    Write-Host "Environnements:" -ForegroundColor Yellow
    Write-Host "  dev          Utilise docker-compose.dev.yml (développement)"
    Write-Host "  prod         Utilise docker-compose.prod.yml (production)"
    Write-Host ""
    Write-Host "Commandes:" -ForegroundColor Yellow
    Write-Host "  dev up       Démarre services en mode développement"
    Write-Host "  dev down     Arrête services"
    Write-Host "  dev logs     Affiche logs (+ -f pour follow)"
    Write-Host "  dev ps       Liste containers"
    Write-Host "  dev exec     Execute commande dans container"
    Write-Host "  dev build    Build images"
    Write-Host "  dev restart  Redémarre services"
    Write-Host ""
    Write-Host "Exemples:" -ForegroundColor Yellow
    Write-Host "  .\dc.ps1 dev up -d              # Start dev en background"
    Write-Host "  .\dc.ps1 dev logs -f app        # Logs service app"
    Write-Host "  .\dc.ps1 dev exec app bash      # Shell dans container app"
    Write-Host "  .\dc.ps1 prod up -d             # Start prod"
    Write-Host ""
    Write-Host "Raccourcis:" -ForegroundColor Yellow
    Write-Host "  .\dc.ps1 up       = .\dc.ps1 dev up"
    Write-Host "  .\dc.ps1 down     = .\dc.ps1 dev down"
    Write-Host "  .\dc.ps1 logs     = .\dc.ps1 dev logs"
}

function Run-DockerCompose {
    param(
        [string]$Env,
        [string[]]$Arguments
    )

    if ($Env -eq "dev") {
        Write-Host "Running in DEVELOPMENT mode" -ForegroundColor Green
        docker-compose -f $BaseCompose -f $DevCompose $Arguments
    }
    elseif ($Env -eq "prod") {
        Write-Host "Running in PRODUCTION mode" -ForegroundColor Yellow
        docker-compose -f $BaseCompose -f $ProdCompose $Arguments
    }
    else {
        Write-Host "Unknown environment: $Env" -ForegroundColor Red
        Write-Host "Use 'dev' or 'prod'"
        exit 1
    }
}

# ==============================================
# Main
# ==============================================

if ($Environment -eq "help" -or $Environment -eq "-h" -or $Environment -eq "--help" -or $Args.Count -eq 0) {
    Show-Help
    exit 0
}

# Raccourcis (assume dev si pas spécifié)
$ValidEnvs = @("dev", "prod")
if ($ValidEnvs -contains $Environment) {
    Run-DockerCompose -Env $Environment -Arguments $Args
}
else {
    # Assume dev, et traite $Environment comme premier argument
    $AllArgs = @($Environment) + $Args
    Run-DockerCompose -Env "dev" -Arguments $AllArgs
}
