# HP Global

Next.js + TypeScript app with App Router API routes backed by PostgreSQL. Docker Compose runs the Next app and a persistent PostgreSQL database behind the server's nginx reverse proxy.

## PostgreSQL setup

Copy `.env.example` to `.env` and update:

- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_SSL`: set to `true` for hosted databases that require SSL
- `POSTGRES_DB`: Docker PostgreSQL database name
- `POSTGRES_USER`: Docker PostgreSQL user
- `POSTGRES_PASSWORD`: Docker PostgreSQL password; generated automatically on first deploy
- `ADMIN_EMAIL`: admin login email
- `ADMIN_PASSWORD`: initial admin password, used until it is changed from the dashboard
- `ADMIN_SESSION_SECRET`: signs persistent admin sessions; generated automatically on first deploy
- `PORT`: Next server port, default `3000`
- `APP_PORT`: host port exposed by the Next container for nginx to proxy, default `3002`

The API initializes the required PostgreSQL tables from `server/schema.sql` on first database access. Passwords changed from the admin dashboard are stored as salted `scrypt` hashes.

## Development

Run the Next development server:

```sh
npm run dev
```

The app and `/api` routes run from the same Next server.

## Production

Build the frontend:

```sh
npm run build
```

Start the production server:

```sh
npm start
```

`next start` serves the frontend and API routes from the same process.

## Deploy

Deploy the Dockerized app to the configured server:

```sh
npm run deploy
```

Defaults:

- `DEPLOY_HOST=178.236.185.159`
- `DEPLOY_USER=root`
- `DEPLOY_PATH=/opt/hp-global`
- `PUBLIC_URL=https://hpglobalinfra.com`
- `APP_PORT=3002`
- `COMPOSE_PROJECT=hp-global`

The script uploads a timestamped release, preserves `/opt/hp-global/shared/.env`, rebuilds the Docker image, restarts Compose, removes old orphan services, and verifies the local app response.

To skip local lint/build checks:

```sh
RUN_CHECKS=0 npm run deploy
```
