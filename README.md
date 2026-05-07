# 🚀 FastAPI Starter App

A modern REST API built with **FastAPI** and **SQLAlchemy** using a clean layered architecture.

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
  - [🐳 Docker](#-docker)
  - [💻 Local with uv](#-local-with-uv)
- [🧪 Running Tests](#-running-tests)
- [📁 Project Structure](#-project-structure)
- [🔌 API Endpoints](#-api-endpoints)
- [⚙️ Configuration](#️-configuration)

---

## 🚀 Quick Start

### 🐳 Docker

```bash
docker compose up --build
```

> [!NOTE]
> The API will be available at **http://localhost:8000**
> API docs: **http://localhost:8000/docs**

---

### 💻 Local with uv

```bash
uv sync && uv run python src/main.py
```

> [!IMPORTANT]
> Make sure **PostgreSQL** is running and configured in `.env` file.

---

## 🧪 Running Tests

```bash
uv run pytest
```

> [!TIP]
> Tests use a separate test database (configured in `.test.env`). The test suite:
> - Resets tables before running
> - Seeds a default user
> - Covers all CRUD operations for Users and Tasks

---

## 📁 Project Structure

```
src/
├── 📂 db/                  # Database connection & setup
│   └── db.py               # SQLAlchemy async engine, session maker
├── 📂 models/              # SQLAlchemy ORM models
│   ├── users.py            # UsersModel
│   └── tasks.py            # TasksModel
├── 📂 schemas/             # Pydantic validation schemas
│   ├── users.py            # UserSchema, UserAddSchema
│   └── tasks.py            # TasksSchema, TasksAddSchema
├── 📂 repositories/        # Data access layer
│   ├── users.py            # UserRepositories
│   └── tasks.py            # TasksRepositories
├── 📂 services/            # Business logic layer
│   ├── users.py            # UserServices
│   └── tasks.py            # TasksServices
├── 📂 routers/             # API route handlers
│   ├── users.py            # /users endpoints
│   └── tasks.py            # /tasks endpoints
├── 📂 utils/               # Shared utilities
│   ├── exceptions.py       # Custom exceptions
│   └── repositories.py    # Base repository classes
├── config_db.py            # Settings from .env
└── main.py                 # FastAPI application entry point
```

### 🏗️ Architecture Pattern

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│   Router    │ ──▶ │  Service    │ ──▶ │ Repository  │ ──▶ │    DB    │
│  (Endpoint) │     │  (Logic)    │     │   (Data)    │     │          │
└─────────────┘     └─────────────┘     └─────────────┘     └──────────┘
```

| Layer | Purpose |
|-------|---------|
| **Routers** | Handle HTTP requests/responses |
| **Services** | Business logic & data transformation |
| **Repositories** | Database operations (CRUD) |
| **Models** | SQLAlchemy ORM definitions |
| **Schemas** | Pydantic request/response validation |

---

## 🔌 API Endpoints

### 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `GET` | `/users/{user_id}` | Get user by ID |
| `POST` | `/users` | Create new user |
| `PUT` | `/users?user_id={id}` | Update user |
| `DELETE` | `/users?user_id={id}` | Delete user |

### ✅ Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | Get all tasks |
| `GET` | `/tasks/{task_id}` | Get task by ID |
| `POST` | `/tasks` | Create new task |
| `PUT` | `/tasks?task_id={id}` | Update task |
| `DELETE` | `/tasks?task_id={id}` | Delete task |

---

## ⚙️ Configuration

Create a `.env` file (copy from `.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastapi_db
DB_USER=postgres
DB_PASS=your_password
MODE=DEV
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `fastapi_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASS` | Database password | - |
| `MODE` | App mode (`DEV` / `TEST`) | `DEV` |

---

## 🛠️ Tech Stack

- **FastAPI** — Web framework
- **SQLAlchemy** — ORM (async)
- **PostgreSQL** — Database
- **Pydantic** — Data validation
- **uv** — Package manager
- **pytest** — Testing framework