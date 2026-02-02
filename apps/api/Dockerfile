# =========================
# Base
# =========================
FROM node:20.20.0-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# =========================
# Builder
# =========================
FROM base AS builder
RUN npm install -g turbo
COPY . .
# Prune apenas a api
RUN turbo prune api --docker

# =========================
# Installer
# =========================
FROM base AS installer
# Deps de sistema para build
RUN apt-get update && apt-get install -y python3 make g++
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --unsafe-perm

COPY --from=builder /app/out/full/ .

RUN pnpm turbo run build --filter=api...

RUN pnpm --filter=api --prod deploy pruned --legacy

# =========================
# Runner (A SOLUÇÃO REAL)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/sqlite.db"

# 1. Instala Python e ferramentas de build (Necessário para better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ openssl

# 2. Copia a aplicação
COPY --from=installer /app/pruned ./
COPY --from=installer /app/apps/api/drizzle.config.ts ./
COPY --from=installer /app/apps/api/src ./src

# 3. O package.json tem referências "workspace:*" que o NPM não entende.
# Usamos 'sed' para deletar qualquer linha que tenha 'workspace:' do arquivo.
# Isso "sanitiza" o arquivo para o NPM conseguir ler.
RUN sed -i '/workspace:/d' package.json

# 4. Agora instalamos as dependências faltantes sem erro de protocolo
# O --no-save evita tentar reescrever o package.json de forma complexa
RUN npm install --no-save better-sqlite3 drizzle-orm drizzle-kit

# 5. Comando de inicialização
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit push && node dist/main.js"]