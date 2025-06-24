FROM python:3.10-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app

WORKDIR /app
RUN uv sync --locked --no-cache --compile-bytecode

CMD ["uv", "run", "app/main.py"]
