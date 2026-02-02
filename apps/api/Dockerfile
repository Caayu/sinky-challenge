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

# Cria diretório para dados persistentes e dá permissões
RUN mkdir -p /data && chmod 777 /data

# Define variável de ambiente para o banco
ENV DATABASE_URL="file:/data/sqlite.db"

# Expõe porta
EXPOSE 3000

# Roda migrations e inicia
CMD ["sh", "-c", "pnpm drizzle-kit push && node dist/main.js"]