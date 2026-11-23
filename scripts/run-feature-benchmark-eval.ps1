# run-feature-benchmark-eval.ps1
# Runs the complete reusable task generation and 4-state validation evidence harness.

$ErrorActionPreference = "Stop"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " HARBOR AI CODING BENCHMARK: TASK GENERATION & VALIDATION HARNESS " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "`n[Step 1/2] Generating Harbor Feature-Development Task Packages..." -ForegroundColor Yellow
node scripts/generate-harbor-feature-tasks.js

Write-Host "`n[Step 2/2] Running 4-State Validation Evidence Matrix..." -ForegroundColor Yellow
node scripts/validate-strategy-evidence.js

Write-Host "`n✔ Benchmark generation and validation complete!" -ForegroundColor Green
Write-Host "  Harbor tasks exported to: data/harbor-tasks/"
Write-Host "  Evidence matrix saved to: data/validation_evidence_matrix.json"
