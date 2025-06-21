FROM node:24.2.0-alpine3.22 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder stage: Install dependencies and build the application
FROM base AS builder
WORKDIR /app

COPY . .

# Install pnpm dependencies. Use --mount=type=cache for faster builds.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the web application
RUN pnpm --filter=./apps/web build

# Production stage for 'web' application
FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/rodneyosodo/dolla
LABEL org.opencontainers.image.description="Web application (landing page) for the dolla project"
LABEL org.opencontainers.image.licenses=Apache-2.0

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3001

ENV PORT=3001

ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
