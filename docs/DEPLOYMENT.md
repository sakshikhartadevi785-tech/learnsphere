# Deployment guide

The project supports two deployment methods. Complete one method and add the resulting URL to the root README before submission.

## Method A: Docker Compose on a local or hosted server

1. Install Docker Desktop or Docker Engine.
2. From the project root, run:

```bash
docker compose up --build -d mongo
docker compose --profile tools run --rm seed
docker compose up --build -d app
```

3. Open `http://localhost:5000`.
4. Test `/api/health`, login, basket, checkout and administrator CRUD.
5. Before any public deployment, replace the Docker `SESSION_SECRET`, use HTTPS and set `COOKIE_SECURE=true`.

To stop the system:

```bash
docker compose down
```

To remove the database volume and start again:

```bash
docker compose down -v
```

## Method B: MongoDB Atlas plus a Docker web host

### 1. Create the database

- Create a MongoDB Atlas project and cluster.
- Create a database user with a strong unique password.
- Configure network access for the hosting provider.
- Copy the connection string and replace its database name with `learnsphere`.
- Never place this connection string in submitted source code.

### 2. Deploy the web application

The included `render.yaml` and `Dockerfile` can deploy the React build and Express API as one service.

Set these environment variables on the host:

```text
NODE_ENV=production
PORT=5000
MONGODB_URI=<Atlas connection string>
SESSION_SECRET=<long random secret>
CLIENT_URL=<public HTTPS application URL>
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
TRUST_PROXY=1
```

The container builds the React client and the Express server serves the generated client files. API calls remain on the same origin under `/api`.

### 3. Seed the hosted database

Run the seed command using the host's shell or a temporary one-off job:

```bash
cd server
npm run seed
```

The seed command replaces the LearnSphere collections, so do not run it after real demonstration changes unless a reset is intended.

### 4. Verify deployment

- Open `<public-url>/api/health` and confirm `database: connected`.
- Log in with both demonstration accounts.
- Add an unregistered course to the student basket.
- Confirm registration and verify the seat count decreases.
- Test administrator create/update/deactivate operations.
- Refresh a React route directly, such as `/courses/web-development-essentials`, and confirm it does not return a host 404.
- Test on a phone or responsive browser emulator.

## Remote access information to add before submission

Update the root README:

```text
Live application: https://...
Health/API check: https://.../api/health
Admin: admin@learnsphere.test / Admin123!
Student: student@learnsphere.test / Student123!
```

Change demonstration passwords if the application will remain publicly available after marking.
