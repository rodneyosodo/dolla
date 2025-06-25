FROM python:3.13-slim

LABEL org.opencontainers.image.source=https://github.com/rodneyosodo/dolla
LABEL org.opencontainers.image.description="PDF Extractor application for the dolla project"
LABEL org.opencontainers.image.licenses=Apache-2.0

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app

WORKDIR /app
RUN uv sync --locked --no-cache --compile-bytecode

CMD ["uv", "run", "app/main.py"]
