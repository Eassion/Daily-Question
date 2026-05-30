#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/../.."
docker build -f deploy/frontend/Dockerfile -t daily-question-frontend:latest .
