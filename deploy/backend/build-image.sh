#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/../.."
mvn clean package -DskipTests
docker build -f deploy/backend/Dockerfile -t daily-question-backend:latest .
