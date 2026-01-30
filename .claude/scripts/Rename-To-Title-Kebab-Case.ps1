# =============================================================================
# Rename-To-Title-Kebab-Case.ps1
# Renomme les fichiers .md en Title-Kebab-Case selon les conventions Jay/Shinkofa
# Usage: .\Rename-To-Title-Kebab-Case.ps1 -ProjectPath "D:\mon-projet" [-DryRun]
# =============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

# Exceptions - fichiers à NE PAS renommer
$Exceptions = @(
    "README.md",
    "CLAUDE.md",
    "LICENSE",
    "LICENSE.md",
    "SKILL.md"
)

# Fonction pour convertir en Title-Kebab-Case
function ConvertTo-TitleKebabCase {
    param([string]$Name)

    # Séparer par tirets ou underscores
    $parts = $Name -replace '\.md$', '' -split '[-_]'

    # Capitaliser chaque partie
    $titleParts = $parts | ForEach-Object {
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
        }
    }

    # Rejoindre avec tirets + extension
    return ($titleParts -join '-') + '.md'
}

# Fonction pour vérifier si un fichier a besoin d'être renommé
function Test-NeedsRename {
    param([string]$FileName)

    # Vérifier exceptions
    if ($Exceptions -contains $FileName) {
        return $false
    }

    # Vérifier si c'est déjà en Title-Kebab-Case
    $expected = ConvertTo-TitleKebabCase -Name $FileName
    return $FileName -cne $expected
}

Write-Host ""
Write-Host "🔄 Rename-To-Title-Kebab-Case" -ForegroundColor Cyan
Write-Host "   Projet: $ProjectPath" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "   Mode: DRY RUN (aucune modification)" -ForegroundColor Yellow
}
Write-Host ""

# Vérifier que le projet existe
if (-not (Test-Path $ProjectPath)) {
    Write-Host "❌ Erreur: Le dossier n'existe pas: $ProjectPath" -ForegroundColor Red
    exit 1
}

# Vérifier si c'est un repo git
$isGitRepo = Test-Path (Join-Path $ProjectPath ".git")

# Trouver tous les fichiers .md
$mdFiles = Get-ChildItem -Path $ProjectPath -Filter "*.md" -Recurse -File |
    Where-Object {
        $_.FullName -notmatch '\\node_modules\\' -and
        $_.FullName -notmatch '\\venv\\' -and
        $_.FullName -notmatch '\\.venv\\' -and
        $_.FullName -notmatch '\\__pycache__\\'
    }

$toRename = @()
$skipped = @()

foreach ($file in $mdFiles) {
    if (Test-NeedsRename -FileName $file.Name) {
        $newName = ConvertTo-TitleKebabCase -Name $file.Name
        $toRename += [PSCustomObject]@{
            OldPath = $file.FullName
            OldName = $file.Name
            NewName = $newName
            NewPath = Join-Path $file.DirectoryName $newName
            RelativePath = $file.FullName.Replace($ProjectPath, '').TrimStart('\')
        }
    } else {
        $skipped += $file.Name
    }
}

# Afficher les fichiers à renommer
if ($toRename.Count -eq 0) {
    Write-Host "✅ Tous les fichiers sont déjà en Title-Kebab-Case!" -ForegroundColor Green
    exit 0
}

Write-Host "📝 Fichiers à renommer: $($toRename.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($item in $toRename) {
    $relativePath = $item.RelativePath
    Write-Host "   $($item.OldName)" -ForegroundColor Red -NoNewline
    Write-Host " → " -NoNewline
    Write-Host "$($item.NewName)" -ForegroundColor Green
}

Write-Host ""

# Si DryRun, s'arrêter ici
if ($DryRun) {
    Write-Host "🔍 DRY RUN terminé. Aucun fichier modifié." -ForegroundColor Yellow
    Write-Host "   Relancez sans -DryRun pour appliquer les changements." -ForegroundColor Yellow
    exit 0
}

# Demander confirmation
$confirmation = Read-Host "Voulez-vous renommer ces $($toRename.Count) fichiers? (o/N)"
if ($confirmation -ne 'o' -and $confirmation -ne 'O') {
    Write-Host "❌ Annulé." -ForegroundColor Red
    exit 0
}

# Renommer les fichiers
$renamed = 0
$errors = 0

foreach ($item in $toRename) {
    try {
        if ($isGitRepo) {
            # Utiliser git mv pour préserver l'historique
            $oldRelative = $item.OldPath.Replace($ProjectPath, '').TrimStart('\').Replace('\', '/')
            $newRelative = $item.NewPath.Replace($ProjectPath, '').TrimStart('\').Replace('\', '/')

            Push-Location $ProjectPath
            git mv "$oldRelative" "$newRelative" 2>$null
            Pop-Location
        } else {
            # Renommage simple
            Rename-Item -Path $item.OldPath -NewName $item.NewName
        }

        Write-Host "   ✅ $($item.OldName) → $($item.NewName)" -ForegroundColor Green
        $renamed++
    }
    catch {
        Write-Host "   ❌ Erreur: $($item.OldName) - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Terminé: $renamed fichiers renommés" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "⚠️  Erreurs: $errors" -ForegroundColor Yellow
}
if ($isGitRepo) {
    Write-Host ""
    Write-Host "📌 N'oubliez pas de commiter les changements:" -ForegroundColor Yellow
    Write-Host "   git commit -m `"refactor: Rename files to Title-Kebab-Case convention`"" -ForegroundColor White
}
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
