#!/usr/bin/env bash
# Боевой запуск: подхватывает токен из .env и шлёт только новые находки.
set -euo pipefail
cd "$(dirname "$0")"
set -a
. ./.env
set +a
exec python3 olx_watch.py --config config.json --new-only --tg "$@"
