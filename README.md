# X Group DM Repost Autopilot

A mobile-responsive React dashboard and independent Express backend with a persistent SQLite queue, per-item approval, OAuth 2.0 PKCE, demo scanner, history and duplicate protection.

## Official API limitations

**Group DM reading is NOT implemented in Live Mode.** The project does not assume access to a group-DM reading endpoint. `/api/scan` returns HTTP 501 in Live Mode and the UI explicitly displays unsupported status. X API access tiers, scopes, endpoints and policies can change: check https://docs.x.com/ and your developer account before attempting new functionality. No scraping, private endpoints, or simulated live scan successes are used.

Live repost uses `GET /2/users/me` and `POST /2/users/:id/retweets`, with `tweet.read users.read tweet.write offline.access` scopes. It requires a connected authorized X user and explicit manual approval of each public post URL. X may reject calls due to tier, policy, permissions or rate limits; errors are shown, not marked successful. The app never automatically approves live reposts.

**Security caveat:** This starter uses an anonymous signed browser session, not a multi-user login system. Do not deploy publicly for multiple users without adding real account authentication, authorization and CSRF protections. Cookies are cross-site `SameSite=None; Secure` in production and may be blocked by some browser privacy configurations. For production, serve both services behind the same site via a reverse proxy or add a robust login and CSRF scheme. Sessions and tokens persist in SQLite unencrypted: use encrypted-at-rest storage and an application-level encryption key before handling sensitive production accounts. `SESSION_SECRET` must be persistent.

## Local installation

Node.js 22+ required.

Terminal 1:
```sh
cd backend
cp .env.example .env
npm install
npm run dev
```

Terminal 2:
```sh
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. Demo works without X credentials. `npm test` runs backend tests; `npm run build` checks frontend production build.

## Render backend deployment

1. Push this repository to GitHub. Create a **Web Service** on Render using the repository.
2. Root Directory: `backend`; Runtime: Node; Build Command: `npm install`; Start Command: `npm start`.
3. Set `NODE_ENV=production`, `PORT=10000`, `BACKEND_URL=https://YOUR-SERVICE.onrender.com`, `FRONTEND_URL=https://YOUR-SITE.netlify.app`, `SESSION_SECRET` to a strong random value, `DATABASE_PATH=/var/data/app.db`.
4. Attach a **persistent Render disk** mounted at `/var/data` (requires a Render plan supporting persistent disks). Without a disk SQLite data will be lost on redeploy. Run only one backend instance with SQLite.
5. Set `X_CLIENT_ID`, `X_CLIENT_SECRET` (only if your X app is confidential), and `X_SCOPES=tweet.read users.read tweet.write offline.access`. Set X OAuth redirect/callback URL to `https://YOUR-SERVICE.onrender.com/api/auth/x/callback` in the X developer portal. Register the matching website URL.
6. Verify `https://YOUR-SERVICE.onrender.com/health` and `/api/status`.

## Netlify frontend deployment

1. Create a new Netlify site from the same GitHub repository.
2. Base Directory: `frontend`; Build Command: `npm run build`; Publish Directory: `frontend/dist` (or `dist` if Netlify resolves relative to the base directory).
3. Environment variable: `VITE_API_BASE_URL=https://YOUR-SERVICE.onrender.com` (no trailing slash). Redeploy after setting this build-time variable.
4. Set the actual Netlify domain as `FRONTEND_URL` in Render, then redeploy backend. If you use a custom domain, update both values and the OAuth app configuration as needed.
5. Test Demo Mode, queue, scanner, connection and mobile layout on Android Chrome. Third-party cookie restrictions may require a same-site custom-domain reverse proxy.

## API routes

`GET /health`, `GET /api/status`, `GET /api/queue`, `GET /api/activity`, `GET /api/stats`, `GET /api/auth/x/start`, `GET /api/auth/x/callback`; `POST /api/mode`, `/api/control`, `/api/scan`, `/api/queue`, `/api/queue/:id/approve`, `/api/queue/:id/reject`, `/api/auth/disconnect`.

## Operational notes

- Demo mode makes no X repost requests, even if connected. Demo IDs cannot be approved live.
- Duplicate prevention is enforced by a unique `(owner,tweet_id)` database constraint. Queue items and logs are persistent. SQLite WAL mode is enabled.
- Start/Stop controls govern the demo scanner state; Live Start returns HTTP 409 because Group DM scanning is unsupported.
- X HTTP 429 and other errors are surfaced without claiming success; the caller should retry only after the applicable limit resets. This implementation has API-side request throttling but no automatic retry scheduler.
- The activity table records non-secret event details. Do not log OAuth tokens or secrets.
- The app is an approval queue, not an unattended repost bot.
