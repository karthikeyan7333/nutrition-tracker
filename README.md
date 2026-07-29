# Nutrition Tracker

A production-ready MERN migration of the original Google AI Studio nutrition tracker. The React UI, user flows, route paths, Gemini prompt/schema, and nutrition fallback behavior are preserved.

## Architecture

- `frontend/`: Vite + React application, deployed to Vercel.
- `backend/`: Express API, JWT authentication, Mongoose models, Gemini service, deployed to Render.
- MongoDB Atlas: persistent users, goals, food logs, and water logs.
- `data/db.json`: legacy local data retained only for the optional one-time import.

## Local setup

1. Run `npm install` in the repository root.
2. Copy `backend/.env.example` to `backend/.env`, then configure an Atlas URI, secure JWT secret, and Gemini key.
3. Optionally copy `frontend/.env.example` to `frontend/.env`. Do not set `VITE_API_BASE_URL` locally unless you are using another API host.
4. Run `npm run dev`.

The UI runs at `http://localhost:5173`; its `/api` calls proxy to `http://localhost:5000`.

## Commands

- `npm run dev` — starts frontend and backend.
- `npm run build` — creates the Vite frontend production build and checks the backend entry point.
- `npm run lint` — type-checks the frontend and syntax-checks the backend.
- `npm run migrate:json` — imports the original `data/db.json` into the configured Atlas database. This is idempotent for the current legacy records; run it only after configuring Atlas.

## Deploy

### MongoDB Atlas

Create a cluster and database user, allow Render network access, and set its connection string as `MONGODB_URI` in Render.

### Render backend

Create a Web Service from this repository. `render.yaml` supplies the backend root and health check. Set these environment variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`, optionally `GEMINI_MODEL`, and `NODE_ENV=production`. Set `CLIENT_URL` to the deployed Vercel URL. Render provides `PORT` automatically.

### Vercel frontend

Import the repository and set the Vercel project Root Directory to `frontend`. Configure `VITE_API_BASE_URL` as `https://YOUR-RENDER-SERVICE.onrender.com/api`. `frontend/vercel.json` ensures browser-route refreshes load the React application.

## Migration notes

The frontend never has access to the Gemini API key. Its Axios client calls the backend’s established `/api` routes, while the backend owns Gemini, JWT verification, password hashing, and all database access.
