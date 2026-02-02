# =========================
# Base
# =========================
FROM node:20.20.0-slim AS base
WORKDIR /app

# =========================
# Builder
# =========================
FROM base AS builder

# Instala turbo globalmente (ok em build stage)
RUN npm install -g turbo

COPY . .

# Prune apenas o app api
RUN turbo prune api --docker

# =========================
# Installer (deps + build)
# =========================
FROM base AS installer

# Ativa pnpm exatamente na versão do projeto
RUN corepack enable \
    && corepack prepare pnpm@10.28.2 --activate

# Copia apenas o workspace podado
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Instala dependências (scripts permitidos!)
RUN pnpm install --unsafe-perm

# Copia o código completo do app podado
COPY --from=builder /app/out/full/ .

# Build apenas da API
RUN pnpm turbo run build --filter=api...

# =========================
# Runner (produção)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

USER nestjs

# Copia APENAS o necessário para runtime
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

CMD ["node", "dist/main.js"]
