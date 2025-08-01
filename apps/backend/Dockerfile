FROM golang:1.24-alpine AS builder

ARG GOOS
ARG GOARCH

WORKDIR /github.com/rodneyosodo/dolla/backend
COPY . .

RUN apk update \
    && apk add make\
    && make backend \
    && mv build/backend /exe

FROM alpine:3.22.1

LABEL org.opencontainers.image.source=https://github.com/rodneyosodo/dolla
LABEL org.opencontainers.image.description="Backend application for the dolla project"
LABEL org.opencontainers.image.licenses=Apache-2.0

COPY --from=builder /exe /

ENTRYPOINT ["/exe"]
