<p align="center">
  <img src="frontend/public/favicon.svg" width="80" height="80" alt="TaskFlow logo">
</p>

<h1 align="center">🚀 TaskFlow</h1>

<p align="center">
  <strong>Full-featured task management app</strong><br>
  Corporations · Invitations · Notifications · Task assignments · Avatar uploads
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

---

## ✨ Features

| | | |
|---|---|---|
| ✅ **Task CRUD** | 👥 **Corporations** | 📨 **Invitations** |
| 🔔 **Notifications** | 👤 **Profile & avatars** | 🔐 **JWT auth** |

---

## 🚀 Quick Start

<details open>
<summary><b>🐳 Backend (Docker)</b></summary>

```bash
docker compose up --build
```

> API: [`http://localhost:8000`](http://localhost:8000) &nbsp;·&nbsp; Docs: [`http://localhost:8000/docs`](http://localhost:8000/docs)
</details>

<details>
<summary><b>💻 Backend (local)</b></summary>

```bash
cp .env.example .env        # set DB_HOST=localhost
uv sync
uv run python src/main.py
```

> Requires PostgreSQL running locally.
</details>

<details>
<summary><b>🎨 Frontend</b></summary>

```bash
cd frontend
npm install
npm run dev
```
</details>

---

## 🧪 Testing

```bash
uv run pytest -v
```

Tests use a separate database (`.test.env`). Requires PostgreSQL on `localhost`.

---

## 🔄 CI

| Job | What it does |
|-----|-------------|
| 🔍 **lint** | `ruff check src/` |
| ✅ **test** | `pytest` with PostgreSQL service container |
| 🏗️ **frontend** | `npm run build` (TypeScript + Vite) |

---

## 📁 Project Structure

```
📦 taskflow
├── 🐍 src/                  # FastAPI backend
│   ├── db/                  # Engine, session, migrations
│   ├── models/              # SQLAlchemy ORM
│   ├── schemas/             # Pydantic validation
│   ├── repositories/        # Data access (CRUD)
│   ├── services/            # Business logic
│   ├── routers/             # API endpoints
│   └── utils/               # JWT, auth deps, exceptions
│
├── ⚛️ frontend/             # React + Vite + TypeScript
│   └── src/
│       ├── pages/           # Route pages
│       ├── components/      # UI + layout components
│       ├── hooks/           # Custom React hooks
│       ├── store/           # Zustand auth store
│       ├── api/             # Axios API clients
│       └── types/           # TypeScript definitions
│
├── 🧪 tests/                # Backend test suite
└── 🐳 Dockerfile / docker-compose.yml
```

---

## 🧠 Architecture

```
🌐 Router  ──▶  ⚙️ Service  ──▶  🗄️ Repository  ──▶  🐘 PostgreSQL
(HTTP)          (Logic)          (Data)              (DB)
```

---

## ⚙️ Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `fastapi_db` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASS` | — | Database password |
| `MODE` | `DEV` | `DEV` or `TEST` |

---

## 📡 API Reference

### 🔐 Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/login` | Login → JWT token |
| `POST` | `/users` | Register new account |

### 👤 Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/me` | Current profile |
| `GET` | `/users` | List all users |
| `PUT` | `/users?user_id=` | Update profile |
| `DELETE` | `/users?user_id=` | Delete account |
| `POST` | `/users/avatar` | Upload avatar |

### ✅ Tasks

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List my tasks (owned or assigned) |
| `GET` | `/tasks/{id}` | Get task detail |
| `POST` | `/tasks` | Create task |
| `PUT` | `/tasks?task_id=` | Update own task |
| `PATCH` | `/tasks/{id}/complete` | Mark complete |
| `DELETE` | `/tasks?task_id=` | Delete own task |

### 🏢 Corporations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/corps` | My corps |
| `GET` | `/corps/{id}` | Corp detail |
| `POST` | `/corps` | Create corp |
| `PUT` | `/corps/{id}` | Update corp *(owner)* |
| `DELETE` | `/corps/{id}` | Delete corp *(owner)* |
| `GET` | `/corps/{id}/members` | List members |
| `POST` | `/corps/{id}/members` | Add member *(owner)* |
| `DELETE` | `/corps/{id}/members/{uid}` | Remove member *(owner)* |

### 📨 Invitations

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/corps/{id}/invite` | Send invite *(owner)* |
| `GET` | `/invitations/pending` | My pending invites |
| `GET` | `/corps/{id}/invitations/pending` | Corp pending *(owner)* |
| `POST` | `/invitations/{id}/accept` | Accept invite |
| `POST` | `/invitations/{id}/reject` | Reject invite |

### 🔔 Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications` | Combined feed |
| `POST` | `/notifications/{id}/read` | Mark as read |

---

<p align="center">
  Built with ❤️ using <b>FastAPI</b> + <b>React</b> + <b>PostgreSQL</b>
</p>
