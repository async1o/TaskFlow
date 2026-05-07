# Agents

## Run Commands

```bash
# Backend (local)
DB_HOST=localhost uv run python src/main.py

# Docker
docker compose up --build

# Tests
uv run pytest

# Lint
uv run ruff check src/
```

## Environment

- `.env` - Docker config (DB_HOST=db)
- `.test.env` - Test config (MODE=TEST, DB_HOST=localhost)
- For local dev, override: `DB_HOST=localhost`

## Architecture

Repository pattern: `Router -> Service -> Repository -> DB`

Key files:
- `src/main.py` - FastAPI entry point
- `src/routers/` - API endpoints
- `src/services/` - Business logic
- `src/repositories/` - Data access
- `src/models/` - SQLAlchemy models
- `src/schemas/` - Pydantic schemas

## Auth

JWT-based authentication. All protected endpoints require `Authorization: Bearer <token>`.

## Database

- PostgreSQL with asyncpg
- SQLAlchemy ORM with relationships (Users -> Tasks)
- Migrations: DB/tables auto-create on startup if missing

## Frontend

Frontend implementation plan: `FRONTEND_PLAN.md`

To start frontend work:
```bash
cd frontend
npm run dev
```