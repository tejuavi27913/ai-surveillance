# AI Smart Surveillance

A full-stack security monitoring system with React + Vite frontend, Node.js + Express backend, SQLite persistence, and an AI detection engine built with Python and Ultralytics.

## Overview

This repository includes:

- `backend/`: Express API, authentication, camera management, alerts, reporting, face recognition logs, and audit trails.
- `src/`: React user interface for admins and security staff.
- `ai-engine/`: Python Flask engine for AI detections and simulation.

## Prerequisites

- Node.js 18+
- Python 3.10+
- Git

## Setup

### Backend

```bash
cd backend
npm install
node server.cjs
```

On Windows, you can use the helper script:

```batch
cd backend
install-and-run.bat
```

### Frontend

From the project root:

```bash
npm install
npm run dev
```

### AI Engine

From the `ai-engine` folder:

```powershell
cd ai-engine
.\run.ps1
```

Or using batch:

```batch
cd ai-engine
run.bat
```

## Default Credentials

A fresh backend install seeds a default admin account:

- Email: `tejuavi27913@gmail.com`
- Password: `Awini@27`

Override these values by copying `.env.example` to `.env` and setting:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-admin-password
```

## Notes

- Public user registration is available at `/api/auth/register`.
- Admin login uses `/api/admin/login`; user login uses `/api/user/login`.
- Use `backend/rotate-admin.cjs` to rotate the seeded admin password.
- The backend uses `.env` values for `DB_PATH`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` when present.

## Troubleshooting

- Confirm `node` is on `PATH` and backend dependencies are installed for the server to start.
- Confirm the Python virtual environment is created and dependencies are installed for the AI engine.
- If port conflicts occur, set `PORT` in `backend/.env`.

## Production (Docker)

1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. Build and start with Docker Compose:

```bash
docker compose build
docker compose up -d
```

The backend will be available on port `5000`. The `app` service builds the frontend and serves the `dist/` static files via the backend.

A GitHub Actions workflow is included at `.github/workflows/ci.yml` to build the frontend and run smoke tests on push and pull request.

Security notes:
- Rotate the seeded admin password after deployment. Use `backend/rotate-admin.cjs`.
- Set a strong `JWT_SECRET` in `.env` and never commit it.
- Use HTTPS in front of the `app` service (nginx or cloud load balancer) in production.

## Publish Checklist

Before publishing the repo to GitHub, verify the following:

- **Secrets:** Ensure `.env` files do NOT get committed. Set `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as repository secrets or document that they must be set in deployment.
- **Remove tracked binaries:** If `backend/database/surveillance.db` or `ai-engine/venv/` are in git, remove them with `git rm --cached <path>` and commit.
- **Dependencies:** Run `npm install` in root and `backend/` and create the Python `venv` in `ai-engine` via `python -m venv venv` then `pip install -r requirements.txt`.
- **Seed DB:** Run `cd backend && npm run seed` to populate sample data (admin account, cameras, alerts).
- **Run smoke tests:** Start backend (`node backend/server.cjs`), AI engine (`python ai-engine/app.py`), and build frontend (`npm run build`) to confirm basic flows work.
- **Docker:** Verify `docker compose build` and `docker compose up -d` start services cleanly.

Quick commands to try locally:

```bash
cd backend
npm install
npm run seed
cd ..
npm install
npm run build
cd ai-engine
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

If you want, I can run the installs and seed the DB for you now.

### Run AI Engine locally (Windows)

The AI engine requires Python 3.10+ on Windows.

From `ai-engine` folder run:

```powershell
cd ai-engine
.\run.ps1
```

Or run the batch script:

```batch
cd ai-engine
run.bat
```

These scripts create a `venv`, install Python dependencies from `requirements.txt`, and start `app.py`.

