param(
  [string]$TaskPath = "data/harbor-tasks/vf_42_spatial"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker Desktop is required. Start Docker Desktop and rerun this script."
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw "Docker is installed but its engine is not ready. Start Docker Desktop, wait for it to show Running, then rerun."
}

if (-not (Get-Command harbor -ErrorAction SilentlyContinue)) {
  throw "Harbor CLI is required. Install it with: py -3.12 -m pip install harbor"
}

if (-not (Test-Path $TaskPath)) {
  throw "Harbor task package not found: $TaskPath"
}

harbor run --path $TaskPath --agent oracle
