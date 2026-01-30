# Deploy Widgets Script - PowerShell (Windows)
# Deploys built widgets to VPS via SSH/SCP
# @author Jay "The Ermite" Goncalves
# @copyright Jay The Ermite

param(
    [string]$VpsHost = "tools.theermite.com",
    [string]$VpsUser = "ubuntu",
    [string]$VpsPath = "/var/www/tools.theermite.com/w"
)

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $PSScriptRoot
$widgetsDir = Join-Path $rootDir "widgets"

Write-Host "`nErmite Toolbox - Deploy Widgets`n" -ForegroundColor Cyan
Write-Host ("=" * 50)

# Get all widget directories with dist folders
$widgets = Get-ChildItem -Path $widgetsDir -Directory | Where-Object {
    $distFolder = Join-Path $_.FullName "dist"
    Test-Path $distFolder
} | Select-Object -ExpandProperty Name

if ($widgets.Count -eq 0) {
    Write-Host "`nNo built widgets found!" -ForegroundColor Red
    Write-Host "   Run 'npm run build' first."
    exit 1
}

Write-Host "`nDeploying $($widgets.Count) widget(s):`n" -ForegroundColor Green
$widgets | ForEach-Object { Write-Host "   - $_" }
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($widget in $widgets) {
    $distPath = Join-Path (Join-Path $widgetsDir $widget) "dist"
    $remotePath = "$VpsPath/$widget"

    Write-Host "`nDeploying: $widget" -ForegroundColor Yellow
    Write-Host ("-" * 40)

    try {
        # Create remote directory
        Write-Host "   Creating remote directory..."
        ssh "${VpsUser}@${VpsHost}" "mkdir -p $remotePath"

        # Upload files - scp each item in dist folder
        Write-Host "   Uploading files..."
        $items = Get-ChildItem -Path $distPath
        foreach ($item in $items) {
            $itemPath = $item.FullName
            if ($item.PSIsContainer) {
                scp -r "$itemPath" "${VpsUser}@${VpsHost}:${remotePath}/"
            } else {
                scp "$itemPath" "${VpsUser}@${VpsHost}:${remotePath}/"
            }
            if ($LASTEXITCODE -ne 0) {
                throw "SCP failed for $($item.Name)"
            }
        }

        Write-Host "   $widget deployed successfully" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "   $widget deployment failed: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n" + ("=" * 50)
Write-Host "`nDeployment Summary:" -ForegroundColor Cyan
Write-Host "   Success: $successCount" -ForegroundColor Green
Write-Host "   Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "   Total: $($widgets.Count)"

if ($failCount -gt 0) {
    Write-Host "`nSome deployments failed. Check the errors above." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`nAll widgets deployed to $VpsHost!" -ForegroundColor Green
    Write-Host "`nWidgets available at:" -ForegroundColor Cyan
    $widgets | ForEach-Object { Write-Host "   https://tools.theermite.com/w/$_/" }
    Write-Host ""
}
