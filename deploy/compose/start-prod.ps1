$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Test-Path ".env.prod")) {
  Write-Error "缺少 deploy/compose/.env.prod，请先根据 .env.prod.example 创建。"
}

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
