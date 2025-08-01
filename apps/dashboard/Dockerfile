FROM node:24.4-alpine3.22 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder stage: Install dependencies and build the application
FROM base AS builder
WORKDIR /app

COPY . .

# Install pnpm dependencies. Use --mount=type=cache for faster builds.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the dashboard application
RUN pnpm --filter=./apps/dashboard build

# Production stage for 'dashboard' application
FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/rodneyosodo/dolla
LABEL org.opencontainers.image.description="Dashboard application for the dolla project"
LABEL org.opencontainers.image.licenses=Apache-2.0

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/dashboard/server.js"]
