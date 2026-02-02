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
RUN pnpm install --frozen-lockfile --unsafe-perm

# Copia o código fonte
COPY --from=builder /app/out/full/ .

# 1. Faz o Build
RUN pnpm turbo run build --filter=api...

# 2. Gera deploy isolado
RUN pnpm --filter=api --prod deploy pruned --legacy

# =========================
# Runner (produção)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Mantivemos seu caminho que já funciona
ENV DATABASE_URL="file:/app/data/sqlite.db"

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Cria a pasta data e dá permissão (Isso resolveu o erro do SQLITE_CANTOPEN)
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app/data

USER nestjs

# Copia o app preparado (node_modules + dist + package.json)
COPY --from=installer --chown=nestjs:nodejs /app/pruned ./

# --- [INÍCIO DAS ALTERAÇÕES] ---

# 1. Copia o arquivo de configuração do Drizzle
# (Necessário para o drizzle-kit saber onde está o banco e o schema)
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/drizzle.config.ts ./

# 2. Copia a pasta 'src'
# (Necessário porque o drizzle-kit push lê o schema.ts original, não o JS compilado)
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/src ./src

# 3. Altera o comando de inicialização
# "npx drizzle-kit push" cria as tabelas no banco vazio antes de iniciar a API
CMD ["sh", "-c", "npx drizzle-kit push && node dist/main.js"]