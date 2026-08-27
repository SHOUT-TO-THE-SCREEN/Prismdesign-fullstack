# PrismDesign API

Express and TypeScript API for authentication and persistent graph storage.
Production data is stored in Supabase PostgreSQL; no user data is written to
the server filesystem.

## Commands

```bash
npm install
npm run dev        # development server on http://localhost:3001
npm run typecheck
npm run build      # compile TypeScript to dist/
npm start          # run dist/index.js
```

Copy `.env.example` to `.env` and fill in the Supabase URL, server-only key,
and JWT secret before starting the API. The SQL schema is in `db/schema.sql`.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Render health check |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in |
| `GET` | `/api/auth/me` | Validate the JWT |
| `GET` | `/api/graphs` | List the current user's graphs |
| `GET` | `/api/graphs/:name` | Load a graph |
| `POST` | `/api/graphs/:name` | Create or overwrite a graph |
| `PATCH` | `/api/graphs/:name/rename` | Rename a graph |
| `DELETE` | `/api/graphs/:name` | Delete a graph |

All graph endpoints require `Authorization: Bearer <token>`. Graph queries are
always filtered by the user ID from the verified JWT.

See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) for Vercel, Render, and Supabase
configuration.
