# PrismDesign production deployment

PrismDesign is deployed as three services:

```text
Browser -> Vercel (frontend/) -> Render (server/) -> Supabase PostgreSQL
```

The Supabase elevated key is used only by the Express server. It must never be
added to Vercel or to a `VITE_` environment variable.

## 1. Supabase

1. Create a Supabase project.
2. Open **SQL Editor**, paste `server/db/schema.sql`, and run it once.
3. Open **Project Settings -> API Keys**.
4. Copy the project URL and a server-side Secret key. A legacy `service_role`
   key is also supported, but the newer Secret key is preferred.

The SQL creates `public.users` and `public.graphs`, enables RLS, and revokes
direct browser-role access. Passwords are stored only as bcrypt hashes.

## 2. Render backend

Create a **Web Service** from this repository, or use `render.yaml` as a
Blueprint.

```text
Root Directory: server
Build Command: npm ci --include=dev && npm run build
Start Command: npm start
Health Check Path: /health
```

Set these environment variables:

```text
NODE_ENV=production
JWT_SECRET=<random value of at least 32 characters>
FRONTEND_URL=https://<your-vercel-project>.vercel.app
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<server-only Supabase Secret key>
```

For a legacy key, set `SUPABASE_SERVICE_ROLE_KEY` instead of
`SUPABASE_SECRET_KEY`. `PORT` is assigned by Render and does not need a manual
value. Comma-separated values are accepted in `FRONTEND_URL` when production
and preview origins both need access.

Deploy and confirm `https://<render-service>.onrender.com/health` returns
`{"ok":true}`.

## 3. Vercel frontend

Import the same repository and configure:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Environment Variable:
  VITE_API_BASE_URL=https://<render-service>.onrender.com
```

`frontend/vercel.json` rewrites SPA deep links such as `/demo`, `/list`, and
`/visualizer` to `index.html`. The API URL is absolute in production, so `/api`
is not handled as a Vercel Function.

After the first Vercel deployment, copy its final URL into Render's
`FRONTEND_URL` and redeploy the backend. If the Vercel domain changes, update
this value again.

## 4. Local development

Copy both examples to untracked `.env` files and fill in Supabase credentials:

```text
frontend/.env.example -> frontend/.env
server/.env.example   -> server/.env
```

Then run:

```bash
cd server
npm install
npm run dev

cd frontend
npm install
npm run dev
```

To keep using Vite's `/api` proxy, set `VITE_API_BASE_URL` to an empty value.

## 5. Production smoke test

Run these checks in order after both deployments are live:

1. Open `/` and `/demo` without logging in.
2. Register, log out, and log in again.
3. Confirm `/list` and `/visualizer` require a login.
4. Create nodes in Studio and save a graph.
5. List, load, rename, and delete that graph.
6. Log out and confirm a graph API request returns HTTP 401.
7. Refresh `/demo`, `/list`, and `/visualizer` directly to confirm SPA routing.
8. Test camera and microphone permission allow/deny paths over HTTPS.

## References

- Vercel Vite SPA deployment: https://vercel.com/docs/frameworks/frontend/vite
- Render Express deployment: https://render.com/docs/deploy-node-express-app
- Render monorepo root directories: https://render.com/docs/monorepo-support
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
