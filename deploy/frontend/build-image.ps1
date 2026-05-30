$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\..\.."
docker build -f deploy/frontend/Dockerfile -t daily-question-frontend:latest .
