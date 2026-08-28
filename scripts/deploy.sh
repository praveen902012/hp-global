#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-178.236.185.159}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/hp-global}"
PUBLIC_URL="${PUBLIC_URL:-https://hpglobalinfra.com}"
APP_PORT="${APP_PORT:-3002}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-hp-global}"
RUN_CHECKS="${RUN_CHECKS:-1}"
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
ARCHIVE_NAME="hp-global-next-$(date +%Y%m%d%H%M%S).tar.gz"
LOCAL_ARCHIVE="${TMPDIR:-/tmp}/${ARCHIVE_NAME}"
REMOTE_ARCHIVE="/tmp/${ARCHIVE_NAME}"

if [[ "${RUN_CHECKS}" == "1" ]]; then
  echo "Running lint..."
  npm run lint

  echo "Running production build..."
  npm run build
fi

echo "Creating deployment archive..."
COPYFILE_DISABLE=1 tar \
  --exclude=.git \
  --exclude=.next \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.DS_Store \
  --exclude=.env \
  -czf "${LOCAL_ARCHIVE}" .

echo "Uploading archive to ${SSH_TARGET}..."
scp "${LOCAL_ARCHIVE}" "${SSH_TARGET}:${REMOTE_ARCHIVE}"

echo "Deploying release on ${SSH_TARGET}..."
ssh "${SSH_TARGET}" "DEPLOY_PATH='${DEPLOY_PATH}' APP_PORT='${APP_PORT}' COMPOSE_PROJECT='${COMPOSE_PROJECT}' REMOTE_ARCHIVE='${REMOTE_ARCHIVE}' bash -s" <<'REMOTE'
set -euo pipefail

timestamp="$(date +%Y%m%d%H%M%S)"
release_dir="${DEPLOY_PATH}/releases/${timestamp}"
shared_dir="${DEPLOY_PATH}/shared"

mkdir -p "${release_dir}" "${shared_dir}"
tar -xzf "${REMOTE_ARCHIVE}" -C "${release_dir}"

if [[ -f "${shared_dir}/.env" ]]; then
  cp "${shared_dir}/.env" "${release_dir}/.env"
else
  cp "${release_dir}/.env.example" "${shared_dir}/.env"
  cp "${shared_dir}/.env" "${release_dir}/.env"
  echo "Created ${shared_dir}/.env from .env.example. Update it with production values."
fi

if ! grep -q '^POSTGRES_PASSWORD=.[[:print:]]*' "${shared_dir}/.env" \
  || grep -q '^POSTGRES_PASSWORD=replace-with-' "${shared_dir}/.env"; then
  database_password="$(openssl rand -hex 24)"
  if grep -q '^POSTGRES_PASSWORD=' "${shared_dir}/.env"; then
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${database_password}/" "${shared_dir}/.env"
  else
    printf '\nPOSTGRES_PASSWORD=%s\n' "${database_password}" >> "${shared_dir}/.env"
  fi
  grep -q '^POSTGRES_DB=' "${shared_dir}/.env" || printf 'POSTGRES_DB=hp_global\n' >> "${shared_dir}/.env"
  grep -q '^POSTGRES_USER=' "${shared_dir}/.env" || printf 'POSTGRES_USER=hp_global\n' >> "${shared_dir}/.env"
  cp "${shared_dir}/.env" "${release_dir}/.env"
  echo "Generated persistent PostgreSQL credentials."
fi

if ! grep -q '^ADMIN_SESSION_SECRET=.[[:print:]]*' "${shared_dir}/.env" \
  || grep -q '^ADMIN_SESSION_SECRET=replace-with-' "${shared_dir}/.env"; then
  session_secret="$(openssl rand -hex 32)"
  if grep -q '^ADMIN_SESSION_SECRET=' "${shared_dir}/.env"; then
    sed -i "s/^ADMIN_SESSION_SECRET=.*/ADMIN_SESSION_SECRET=${session_secret}/" "${shared_dir}/.env"
  else
    printf 'ADMIN_SESSION_SECRET=%s\n' "${session_secret}" >> "${shared_dir}/.env"
  fi
  cp "${shared_dir}/.env" "${release_dir}/.env"
  echo "Generated persistent admin session secret."
fi

ln -sfn "${release_dir}" "${DEPLOY_PATH}/current"

cd "${DEPLOY_PATH}/current"
APP_PORT="${APP_PORT}" docker compose -p "${COMPOSE_PROJECT}" up -d --build --remove-orphans

for attempt in {1..30}; do
  if curl -fsS -I --max-time 5 "http://127.0.0.1:${APP_PORT}" >/dev/null; then
    break
  fi
  if [[ "${attempt}" == "30" ]]; then
    echo "Application did not become ready in time."
    docker logs --tail 100 hp-global
    exit 1
  fi
  sleep 2
done

echo "Release deployed: ${release_dir}"
docker ps --filter "name=${COMPOSE_PROJECT}" --format "{{.Names}} {{.Status}} {{.Ports}}"
REMOTE

rm -f "${LOCAL_ARCHIVE}"

echo "Deployment complete."
echo "Server: ${PUBLIC_URL}"
echo "Direct container port: http://${DEPLOY_HOST}:${APP_PORT}"
