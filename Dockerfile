FROM node:20-slim

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && \
    apt-get install -y python3 make g++ openssl && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    corepack prepare pnpm@10.28.2 --activate

# Copia tudo (IMPORTANTE: incluindo tsconfig.json na raiz)
COPY . .

# Instala dependências
RUN pnpm install --frozen-lockfile

# Build usando Turbo (resolve paths corretamente)
RUN pnpm turbo build --filter=api...

# Vai pra pasta da API
WORKDIR /app/apps/api

# /tmp sempre tem permissão de escrita (mas é efêmero)
ENV DATABASE_URL="file:/tmp/sqlite.db"

# Expõe porta
EXPOSE 3000

# Roda migrations e inicia
CMD ["sh", "-c", "pnpm drizzle-kit push && node dist/main.js"]