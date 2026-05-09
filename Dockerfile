FROM python:3.13-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./

RUN apt update && apt install -y --no-install-recommends build-essential libpq-dev

RUN uv sync --frozen --no-install-project

COPY src/ ./src/
COPY static/ ./static/

CMD ["uv", "run", "python", "src/main.py"]