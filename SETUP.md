# ServifyX — Setup & Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone and install
```bash
git clone <your-repo>
cd local-services-marketplace
npm run install-all
```

### 2. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-min-32-chars
PORT=5000
NODE_ENV=development
```

**Client** — `client/.env` is already set for local dev:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Set up the database
1. Go to your Supabase project → SQL Editor
2. Run the contents of `server/database/schema-simple.sql`

### 4. Run locally
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

---

## Deploying to Vercel

### Architecture
- **Frontend** (React/Vite) → Vercel static hosting
- **Backend** (Express) → Vercel serverless function
- **Database** → Supabase (external, no changes needed)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/servifyx.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Vercel will auto-detect the `vercel.json` config

### Step 3 — Set Environment Variables in Vercel
In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `JWT_SECRET` | a long random string |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-app.vercel.app` |

> **Important:** Do NOT add `VITE_API_URL` — it's handled by `client/.env.production` which sets it to `/api` (same-domain routing).

### Step 4 — Deploy
Click **Deploy**. Vercel will:
1. Run `cd client && npm install && npm run build`
2. Output the static files from `client/dist`
3. Expose `server/index.js` as a serverless function at `/api/*`
4. Route all other paths to `index.html` (SPA routing)

### Step 5 — Update Supabase CORS (if needed)
In Supabase → **Settings → API**, add your Vercel URL to the allowed origins.

---

## Environment Variables Reference

### Server (`server/.env`)
| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (bypasses RLS) |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `CLIENT_URL` | ❌ | Frontend URL for CORS |

### Client (`client/.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | API base URL (`/api` in production) |
| `VITE_GOOGLE_MAPS_API_KEY` | ❌ | Google Maps key for location features |

---

## Troubleshooting

**Build fails on Vercel**
- Check that all env vars are set in the Vercel dashboard
- Make sure `server/node_modules` is not committed

**API returns 404**
- Verify `vercel.json` rewrites are correct
- Check the function logs in Vercel dashboard → Functions tab

**CORS errors**
- Add your Vercel URL to `CLIENT_URL` env var
- The server allows all `*.vercel.app` origins automatically

**Supabase connection fails**
- Double-check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Make sure the schema has been run in Supabase SQL Editor
