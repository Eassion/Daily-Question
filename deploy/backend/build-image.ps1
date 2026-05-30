$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\..\.."
mvn clean package -DskipTests
docker build -f deploy/backend/Dockerfile -t daily-question-backend:latest .
