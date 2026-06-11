# syntax=docker/dockerfile:1
# ---------- base ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
# Prisma needs OpenSSL at generate-time (engine) and runtime.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

# ---------- dependencies (full, incl. dev for build) ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ---------- runtime ----------
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=8000
# node_modules from build keeps the generated Prisma client AND the prisma CLI
# (needed by the entrypoint to run `prisma migrate deploy`).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# scripts/ + tsconfig.json let you run ops scripts in the container via ts-node,
# e.g. `docker compose exec backend pnpm admin:create -- --email=...`.
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY package.json pnpm-lock.yaml ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && chown -R node:node /app
USER node
EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
