# OpenFix AI — Full-Stack Starter

Vercel-inspired monochrome OpenFix AI starter: React/Vite frontend + FastAPI backend, Google login, GitHub login, email/password, GitHub issue search, and an AI-analysis endpoint.

## Requirements
- Node.js 20+
- Python 3.11+
- Git (optional)

## Google login setup
1. Go to https://console.cloud.google.com/ and create a project.
2. Configure Google Auth Platform / OAuth consent screen.
3. Create an OAuth Client ID of type **Web application**.
4. Add this authorized redirect URI: `http://localhost:8000/auth/google/callback`
5. Copy Client ID and Client Secret into `backend/.env`.
6. While the app is in testing mode, add test users if Google requires it.

Google sign-in only authenticates a Google account. This app does not access the Gmail inbox and does not need the Gmail API.

## GitHub login setup
1. Go to https://github.com/settings/developers and create an OAuth App.
2. Homepage URL: `http://localhost:5173`
3. Authorization callback URL: `http://localhost:8000/auth/github/callback`
4. Copy Client ID and Client Secret into `backend/.env`.

Login only requests basic identity/email scopes. It does not grant private repository access or write permissions.

## Start backend — Windows PowerShell
```powershell
cd openfix-ai\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```
Edit `backend/.env`. Set a long random `SESSION_SECRET`. Generate one with:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```
Then run:
```powershell
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

macOS/Linux:
```bash
cd openfix-ai/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Start frontend in a second terminal
```powershell
cd openfix-ai\frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open http://localhost:5173. macOS/Linux: use `cp .env.example .env` instead of `Copy-Item`.

## AI analysis
Set `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` in `backend/.env` to use an OpenAI-compatible API. If blank, the app returns a clearly labeled demo analysis.

## Email/password login
Registration and login work locally. This starter does not send verification or password-reset emails yet. Add a transactional email service, verified-email workflow, reset tokens, and rate limits before public launch.

## Data and security notes
- SQLite is used locally. `DATABASE_URL` can be changed to PostgreSQL.
- Never commit `.env` or expose secrets in frontend code.
- Use HTTPS and `COOKIE_SECURE=true` in production.
- Add CSRF protection for cookie-authenticated write endpoints, rate limits, tests, logging, and monitoring before production.
- Account providers are not automatically merged just because email strings match.
- OAuth login does not automatically allow GitHub write operations.
- AI suggestions are hypotheses and must be checked against actual code.

## Structure
```text
openfix-ai/
  backend/
    app/
      main.py config.py database.py models.py schemas.py security.py oauth.py
      routers/auth.py routers/issues.py routers/analysis.py
    requirements.txt .env.example
  frontend/
    index.html package.json vite.config.js .env.example
    src/main.jsx App.jsx api.js styles.css
    src/components/AuthForm.jsx Layout.jsx
```
