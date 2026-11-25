#!/usr/bin/env bash
set -euo pipefail

# Rsync-based production deployment. Override any of these for another server.
DEPLOY_HOST="${DEPLOY_HOST:-178.236.185.159}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/hp-global}"
PUBLIC_URL="${PUBLIC_URL:-https://hpglobalinfra.com}"
APP_PORT="${APP_PORT:-3002}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-hp-global}"
RUN_CHECKS="${RUN_CHECKS:-1}"
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="${DEPLOY_PATH}/releases/${RELEASE_ID}"

if [[ "${RUN_CHECKS}" == "1" ]]; then
  echo "Running lint..."
  npm run lint

  echo "Running production build..."
  npm run build
fi

echo "Creating release directory on ${SSH_TARGET}..."
ssh "${SSH_TARGET}" "mkdir -p '${RELEASE_DIR}' '${DEPLOY_PATH}/shared'"

echo "Syncing deployment files..."
# macOS ships openrsync, which uses short flags for human-readable output.
rsync -azh --delete --progress \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.DS_Store' \
  --exclude='.env' \
  ./ "${SSH_TARGET}:${RELEASE_DIR}/"

echo "Building release and migrating the database on ${SSH_TARGET}..."
ssh "${SSH_TARGET}" "DEPLOY_PATH='${DEPLOY_PATH}' RELEASE_DIR='${RELEASE_DIR}' APP_PORT='${APP_PORT}' COMPOSE_PROJECT='${COMPOSE_PROJECT}' bash -s" <<'REMOTE'
set -euo pipefail

shared_env="${DEPLOY_PATH}/shared/.env"
uploads_dir="${DEPLOY_PATH}/shared/uploads"

if [[ -f "${shared_env}" ]]; then
  cp "${shared_env}" "${RELEASE_DIR}/.env"
else
  cp "${RELEASE_DIR}/.env.example" "${shared_env}"
  cp "${shared_env}" "${RELEASE_DIR}/.env"
  echo "Created ${shared_env} from .env.example. Update it with production values."
fi

mkdir -p "${uploads_dir}"
if ! grep -q '^HOST_UPLOADS_DIR=' "${shared_env}"; then
  printf 'HOST_UPLOADS_DIR=%s\n' "${uploads_dir}" >> "${shared_env}"
fi

if ! grep -q '^POSTGRES_PASSWORD=.[[:print:]]*' "${shared_env}" \
  || grep -q '^POSTGRES_PASSWORD=replace-with-' "${shared_env}"; then
  database_password="$(openssl rand -hex 24)"
  if grep -q '^POSTGRES_PASSWORD=' "${shared_env}"; then
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${database_password}/" "${shared_env}"
  else
    printf '\nPOSTGRES_PASSWORD=%s\n' "${database_password}" >> "${shared_env}"
  fi
  grep -q '^POSTGRES_DB=' "${shared_env}" || printf 'POSTGRES_DB=hp_global\n' >> "${shared_env}"
  grep -q '^POSTGRES_USER=' "${shared_env}" || printf 'POSTGRES_USER=hp_global\n' >> "${shared_env}"
  echo "Generated persistent PostgreSQL credentials."
fi

if ! grep -q '^ADMIN_SESSION_SECRET=.[[:print:]]*' "${shared_env}" \
  || grep -q '^ADMIN_SESSION_SECRET=replace-with-' "${shared_env}"; then
  session_secret="$(openssl rand -hex 32)"
  if grep -q '^ADMIN_SESSION_SECRET=' "${shared_env}"; then
    sed -i "s/^ADMIN_SESSION_SECRET=.*/ADMIN_SESSION_SECRET=${session_secret}/" "${shared_env}"
  else
    printf 'ADMIN_SESSION_SECRET=%s\n' "${session_secret}" >> "${shared_env}"
  fi
  echo "Generated persistent admin session secret."
fi

cp "${shared_env}" "${RELEASE_DIR}/.env"

cd "${RELEASE_DIR}"

# Start (or reuse) PostgreSQL first. The named Docker volume keeps its data
# across releases.
APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" up -d hp-global-db

for attempt in {1..30}; do
  if APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" exec -T hp-global-db \
    sh -c 'exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1"' >/dev/null </dev/null; then
    break
  fi
  if [[ "${attempt}" == "30" ]]; then
    echo "PostgreSQL did not become ready in time."
    APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" logs --tail 100 hp-global-db
    exit 1
  fi
  sleep 2
done

# schema.sql is intentionally idempotent (CREATE/ALTER ... IF NOT EXISTS), so
# it is safe to apply on every release before the new web container starts.
APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" exec -T hp-global-db \
  sh -c 'exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < server/schema.sql
echo "Database schema applied."

APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" up -d --build --remove-orphans

for attempt in {1..30}; do
  if curl -fsS -I --max-time 5 "http://127.0.0.1:${APP_PORT}" >/dev/null; then
    break
  fi
  if [[ "${attempt}" == "30" ]]; then
    echo "Application did not become ready in time."
    APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" logs --tail 100 hp-global
    exit 1
  fi
  sleep 2
done

ln -sfn "${RELEASE_DIR}" "${DEPLOY_PATH}/current"
echo "Release deployed: ${RELEASE_DIR}"
APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" ps
REMOTE

echo "Deployment complete."
echo "Server: ${PUBLIC_URL}"
echo "Direct container port: http://${DEPLOY_HOST}:${APP_PORT}"
