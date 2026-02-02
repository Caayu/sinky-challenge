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
# Prune (recorta) apenas o app api
RUN turbo prune api --docker

# =========================
# Installer
# =========================
FROM base AS installer
# Instala compiladores para garantir que nada falhe na instalação
RUN apt-get update && apt-get install -y python3 make g++
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Instala todas as dependências
RUN pnpm install --frozen-lockfile --unsafe-perm

COPY --from=builder /app/out/full/ .

# Build do código
RUN pnpm turbo run build --filter=api...

# Prepara a pasta final
RUN pnpm --filter=api --prod deploy pruned --legacy

# =========================
# Runner (A SOLUÇÃO DEFINITIVA)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Banco na raiz para não ter erro de pasta
ENV DATABASE_URL="file:/app/sqlite.db"

# 1. Copia a aplicação podada
COPY --from=installer /app/pruned ./

# 2. Copia os arquivos necessários para o Drizzle ler o Schema
COPY --from=installer /app/apps/api/drizzle.config.ts ./
COPY --from=installer /app/apps/api/src ./src

# 3. [O PULO DO GATO] Instala dependências de sistema e o Drizzle Kit GLOBALMENTE
# Isso garante que o comando 'drizzle-kit' vai existir, independente do package.json
RUN apt-get update && apt-get install -y openssl \
    && npm install -g drizzle-kit

# 4. Comando de inicialização
# Usa o comando global 'drizzle-kit' que acabamos de instalar
CMD ["sh", "-c", "drizzle-kit push && node dist/main.js"]