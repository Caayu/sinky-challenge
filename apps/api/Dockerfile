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

# Instala todas as dependências (necessário para o build)
RUN pnpm install --frozen-lockfile --unsafe-perm

# Copia o código fonte
COPY --from=builder /app/out/full/ .

# 1. Faz o Build
RUN pnpm turbo run build --filter=api...

# 2. [NOVO] Gera um deploy isolado na pasta /app/pruned
# Isso resolve as dependências e remove symlinks do workspace
# --prod garante que só vão as dependências de produção
RUN pnpm --filter=api --prod deploy pruned --legacy

# =========================
# Runner (produção)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

USER nestjs

# [NOVO] Copia TUDO da pasta 'pruned' gerada pelo pnpm deploy
# Essa pasta já contém: dist, node_modules (correto) e package.json
COPY --from=installer --chown=nestjs:nodejs /app/pruned ./

# Comando para iniciar
CMD ["node", "dist/main.js"]