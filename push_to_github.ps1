param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

$ErrorActionPreference = "Stop"
Write-Host "1/4 Generating studio/package-lock.json..." -ForegroundColor Cyan
Push-Location studio
npm install --package-lock-only
Pop-Location

Write-Host "2/4 Initializing Git repo..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    git init
}
git branch -M main

Write-Host "3/4 Committing repo-ready rick-169 project..." -ForegroundColor Cyan
git add .
git commit -m "init: rick-169 studio, 1009-item universe, MainVideo, and 40-job CI matrix"

Write-Host "4/4 Pushing to $RepoUrl ..." -ForegroundColor Cyan
if (git remote | Select-String -Pattern "^origin$") {
    git remote set-url origin $RepoUrl
} else {
    git remote add origin $RepoUrl
}
git push -u origin main

Write-Host "DONE! Now open GitHub -> Actions -> Render rick-169 Video (Parallel Matrix) -> Run workflow." -ForegroundColor Green
