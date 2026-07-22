#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer with sudo: sudo bash deploy/install.sh"
  exit 1
fi

SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
APP_ROOT="/opt/psx-portfolio"
APP_DIR="${APP_ROOT}/apps/scraper"
ENV_FILE="/etc/psx-scraper.env"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 openssl
systemctl enable --now docker

install -d -m 0755 "${APP_ROOT}/apps/backend" "${APP_ROOT}/apps/frontend" "${APP_DIR}/deploy"
install -m 0644 "${SOURCE_ROOT}/package.json" "${APP_ROOT}/package.json"
install -m 0644 "${SOURCE_ROOT}/package-lock.json" "${APP_ROOT}/package-lock.json"
install -m 0644 "${SOURCE_ROOT}/apps/backend/package.json" "${APP_ROOT}/apps/backend/package.json"
install -m 0644 "${SOURCE_ROOT}/apps/frontend/package.json" "${APP_ROOT}/apps/frontend/package.json"
install -m 0644 "${SOURCE_ROOT}/apps/scraper/index.js" "${APP_DIR}/index.js"
install -m 0644 "${SOURCE_ROOT}/apps/scraper/package.json" "${APP_DIR}/package.json"
install -m 0644 "${SOURCE_ROOT}/apps/scraper/Dockerfile" "${APP_DIR}/Dockerfile"
install -m 0644 "${SOURCE_ROOT}/apps/scraper/compose.yaml" "${APP_DIR}/compose.yaml"

if [[ ! -f "${ENV_FILE}" ]]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  printf 'POSTGRES_PASSWORD=%s\n' "${DB_PASSWORD}" > "${ENV_FILE}"
  chmod 0600 "${ENV_FILE}"
fi

install -m 0644 "${SOURCE_ROOT}/apps/scraper/deploy/psx-scraper.service" /etc/systemd/system/psx-scraper.service
install -m 0644 "${SOURCE_ROOT}/apps/scraper/deploy/psx-scraper.timer" /etc/systemd/system/psx-scraper.timer

cd "${APP_DIR}"
docker compose --env-file "${ENV_FILE}" build scraper
docker compose --env-file "${ENV_FILE}" up -d db

systemctl daemon-reload
systemctl enable --now psx-scraper.timer
systemctl start psx-scraper.service

echo
echo "Deployment complete."
echo "Schedule: Monday-Friday at 18:00 Asia/Karachi"
echo "Timer status: systemctl status psx-scraper.timer"
echo "Scraper logs: journalctl -u psx-scraper.service -n 100 --no-pager"
