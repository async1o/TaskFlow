# TaskFlow

A full-featured task management application with corporations, invitations, notifications, task assignments, and avatar uploads.

**Stack:** FastAPI (Python) + React (TypeScript) + PostgreSQL

## Quick Start

### Backend (Docker)

```bash
docker compose up --build
```

API: http://localhost:8000 — Docs: http://localhost:8000/docs

### Backend (local)

```bash
cp .env.example .env    # edit DB_HOST=localhost
uv sync
uv run python src/main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
uv run pytest -v
```

Tests use `.test.env` (separate DB). Requires PostgreSQL running on localhost.

## CI

GitHub Actions runs on push to `main`:
- **lint** — `ruff check`
- **test** — pytest with PostgreSQL service container
- **frontend** — `npm run build`

## Project Structure

```
src/
├── db/            # Database engine, session, auto-migrations
├── models/        # SQLAlchemy ORM models (users, tasks, corps, invitations, notifications)
├── schemas/       # Pydantic validation schemas
├── repositories/  # Data access layer (CRUD)
├── services/      # Business logic layer
├── routers/       # API route handlers (users, tasks, corps, invitations, notifications)
└── utils/         # JWT auth, dependencies, custom exceptions

frontend/
├── src/
│   ├── pages/     # Route pages (Welcome, Tasks, Corps, Profile, Notifications, Auth)
│   ├── components/# Reusable UI components + layout (Navbar, Sidebar, Cards, etc.)
│   ├── hooks/     # Custom React hooks (useTasks, useTask)
│   ├── store/     # Zustand auth store
│   ├── api/       # Axios API clients
│   └── types/     # TypeScript type definitions
```

## Architecture

```
Router → Service → Repository → DB
```

## Environment Variables

| Variable   | Description     | Default     |
|------------|-----------------|-------------|
| `DB_HOST`  | PostgreSQL host | `localhost` |
| `DB_PORT`  | PostgreSQL port | `5432`      |
| `DB_NAME`  | Database name   | `fastapi_db`|
| `DB_USER`  | Database user   | `postgres`  |
| `DB_PASS`  | Database password | —          |
| `MODE`     | `DEV` or `TEST` | `DEV`       |

## API Endpoints

### Auth
- `POST /users/login` — Login, returns JWT
- `POST /users` — Register

### Users
- `GET /users/me` — Current user profile
- `GET /users` — List all users
- `PUT /users` — Update own profile
- `DELETE /users` — Delete own account
- `POST /users/avatar` — Upload avatar

### Tasks
- `GET /tasks` — List my tasks (owned or assigned)
- `GET /tasks/{id}` — Get task detail
- `POST /tasks` — Create task (optionally assign)
- `PUT /tasks` — Update own task
- `PATCH /tasks/{id}/complete` — Mark complete (owner or assignee)
- `DELETE /tasks` — Delete own task

### Corporations
- `GET /corps` — My corps
- `GET /corps/{id}` — Corp detail
- `POST /corps` — Create corp
- `PUT /corps/{id}` — Update corp (owner only)
- `DELETE /corps/{id}` — Delete corp (owner only)
- `GET /corps/{id}/members` — List member IDs
- `POST /corps/{id}/members` — Add member (owner only)
- `DELETE /corps/{id}/members/{uid}` — Remove member (owner only)

### Invitations
- `POST /corps/{id}/invite` — Send invite (owner only)
- `GET /invitations/pending` — My pending invites
- `GET /corps/{id}/invitations/pending` — Corp pending invites (owner only)
- `POST /invitations/{id}/accept` — Accept invite
- `POST /invitations/{id}/reject` — Reject invite

### Notifications
- `GET /notifications` — Combined feed (task notifications + pending invites)
- `POST /notifications/{id}/read` — Mark notification as read
