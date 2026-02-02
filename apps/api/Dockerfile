# =========================
# Base
# =========================
FROM node:20.20.0-slim AS base
WORKDIR /app
# Variável para garantir que o PNPM saiba onde está
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# =========================
# Builder
# =========================
FROM base AS builder
# Instala turbo globalmente
RUN npm install -g turbo
COPY . .
# Prune apenas o app api
RUN turbo prune api --docker

# =========================
# Installer (deps + build)
# =========================
FROM base AS installer

# Ativa pnpm na versão correta
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Copia arquivos de definição do workspace podado
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Instala dependências (incluindo devDependencies para o build)
# --frozen-lockfile garante que usará versões exatas do lock
RUN pnpm install --frozen-lockfile --unsafe-perm

# Copia o código fonte
COPY --from=builder /app/out/full/ .

# Build apenas da API
RUN pnpm turbo run build --filter=api...

# (OPCIONAL MAS RECOMENDADO)
# Remove devDependencies antes de ir para produção para diminuir a imagem
# RUN pnpm prune --prod

# =========================
# Runner (produção)
# =========================
FROM node:20.20.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Cria usuário
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

USER nestjs

# --- A CORREÇÃO ESTÁ AQUI ---
# O pnpm instala as dependências na raiz (/app/node_modules), não dentro do app
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copia o build da API
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

# O comando de start
CMD ["node", "dist/main.js"]