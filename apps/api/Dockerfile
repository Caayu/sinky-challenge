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
# Prune (recorta) apenas o app api e suas dependências
RUN turbo prune api --docker

# =========================
# Installer (deps + build + deploy prep)
# =========================
FROM base AS installer

# Ativa pnpm
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Copia arquivos de lock e json do prune
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Instala dependências
# (Nota: better-sqlite3 precisa de python/build tools se não houver binário pré-compilado,
# mas geralmente funciona bem nas versões recentes do node-slim. Se der erro de build, avise)
RUN pnpm install --frozen-lockfile --unsafe-perm

# Copia o código fonte
COPY --from=builder /app/out/full/ .

# 1. Faz o Build
RUN pnpm turbo run build --filter=api...

# 2. Gera deploy isolado (com --legacy para pnpm v10)
RUN pnpm --filter=api --prod deploy pruned --legacy

# =========================
# Runner (produção)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Define o caminho padrão do banco para facilitar (Drizzle lerá isso se configurado)
ENV DATABASE_URL="file:/app/data/sqlite.db"

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# [CRUCIAL] Cria a pasta 'data' e transfere a posse para o usuário nestjs
# Sem isso, o SQLite lança o erro SQLITE_CANTOPEN
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app/data

USER nestjs

# Copia o app preparado
COPY --from=installer --chown=nestjs:nodejs /app/pruned ./

# Se você roda migrations via comando separado, copie a pasta de migrations também
# Geralmente o 'pnpm deploy' já traz se estiver dentro do pacote, mas se estiver na raiz do repo:
# COPY --from=installer --chown=nestjs:nodejs /app/apps/api/drizzle ./drizzle

# Comando para iniciar
CMD ["node", "dist/main.js"]