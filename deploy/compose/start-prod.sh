#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if [ ! -f ".env.prod" ]; then
  echo "缺少 deploy/compose/.env.prod，请先根据 .env.prod.example 创建。" >&2
  exit 1
fi

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
