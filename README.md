# Portfolio — MERN stack

A personal résumé / portfolio site with an admin dashboard.

| Part | Tech | Hosted on (free) |
|---|---|---|
| Frontend | React 18 + Vite + React Router | **Vercel** |
| Backend | Node.js + Express 5 (Docker container) | **Render** |
| Database | MongoDB + Mongoose | **MongoDB Atlas** (M0 free cluster) |

**Features:** hero/branding, about + stats, skills, filterable projects, experience timeline, contact form that saves messages to MongoDB, dark/light mode, mobile layout, and a password-protected `/admin` page to edit all content and read messages.

```
client/   React app (Vercel)        → src/components, src/admin
server/   Express API (Render)      → src/routes, src/models.js, src/seed-data.js
docker-compose.yml                  → runs mongo + server + client locally
render.yaml                         → Render blueprint for the API
```

---

## 1. Install the tools (one time)

- **Node.js LTS** (v20 or newer) — https://nodejs.org
- **Docker Desktop** — https://www.docker.com/products/docker-desktop
- **Git** — https://git-scm.com

## 2. Run locally

### Option A — everything in Docker (easiest)

```bash
docker compose up --build
```

- Site: http://localhost:8080
- Admin: http://localhost:8080/admin (password `changeme`, or set `ADMIN_PASSWORD` in a root `.env` — see `.env.example`)

The database starts empty and is filled with starter content on first run. Edit it from `/admin`.

### Option B — hot-reload development

Start only MongoDB in Docker, and run the API and React app with Node:

```bash
docker compose up -d mongo
```

In one terminal (first time only, copy `server/.env.example` to `server/.env`):

```bash
cd server
npm install
npm run dev
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 (the Vite dev server forwards `/api` to the Express server on port 5000).

## 3. Deploy for free

### a) Database — MongoDB Atlas
1. Create a free account at https://www.mongodb.com/cloud/atlas and create an **M0 (free)** cluster.
2. **Database Access** → add a user with a password.
3. **Network Access** → allow `0.0.0.0/0` (Render's free tier has no fixed IP).
4. **Connect → Drivers** → copy the connection string and add a database name, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio`

### b) Push the code to GitHub
Create an empty repo on GitHub, then from this folder:

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### c) Backend — Render (Docker)
1. Sign in at https://render.com with GitHub → **New → Blueprint** → choose the repo. Render reads `render.yaml`.
2. Fill in:
   - `MONGODB_URI` — the Atlas string from step a
   - `ADMIN_PASSWORD` — a strong password for `/admin`
   - `CLIENT_ORIGIN` — leave as `http://localhost:5173` for now; you'll set the Vercel URL after step d
3. Deploy, then open `https://<your-service>.onrender.com/api/health` — it should show `{"ok":true,"db":true}`.

> Render's free plan sleeps after ~15 minutes without traffic. The first visit after that takes 30–50 s while it wakes; the site shows a "waking up the server" message meanwhile.

### d) Frontend — Vercel
1. Sign in at https://vercel.com with GitHub → **Add New → Project** → import the repo.
2. Set **Root Directory** to `client` (framework preset: Vite).
3. Add environment variable `VITE_API_URL` = your Render URL (e.g. `https://portfolio-api.onrender.com`).
4. Deploy. You'll get a URL like `https://your-name.vercel.app`.

### e) Connect them
Back in Render → your service → **Environment** → set `CLIENT_ORIGIN` to your Vercel URL (comma-separate several, e.g. a custom domain too) → save. Render redeploys automatically.

Every `git push` to `main` now redeploys both sites.

---

## Editing content

Go to `/admin` on your site and sign in with `ADMIN_PASSWORD`:
- **Profile** — name, role, tagline, about, stats, skills, contact details and social links
- **Projects / Experience** — add, edit, reorder (via the *Order* field) and delete
- **Messages** — everything sent through the contact form

**Résumé PDF:** put it at `client/public/resume.pdf`, push, then set the résumé link to `/resume.pdf` in the admin Profile tab.

**Brand colour:** change `--accent` / `--accent-2` at the top of `client/src/styles.css`.

## API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | – |
| GET | `/api/portfolio` | – |
| POST | `/api/messages` | – (rate-limited: 5 per 15 min per IP) |
| POST | `/api/auth/login` | – (rate-limited) |
| GET / PUT | `/api/admin/profile` | Bearer token |
| GET / POST / PUT / DELETE | `/api/admin/projects[/:id]`, `/api/admin/experience[/:id]` | Bearer token |
| GET / PATCH / DELETE | `/api/admin/messages[/:id]` | Bearer token |
