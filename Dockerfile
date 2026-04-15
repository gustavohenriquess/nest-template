# Stage 1: Development
FROM node:24-alpine AS development

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (dev + prod) para o ambiente local
RUN npm ci

COPY . .

# Stage 2: Builder
FROM node:24-alpine AS builder

WORKDIR /app
COPY --from=development /app ./

# Gera Prisma e builda
RUN npx prisma generate
RUN npm run build

# Otimização: Remover pacotes de desenvolvimento ANTES de copiar para prod
RUN npm prune --omit=dev

# Stage 3: Production
FROM node:24-alpine AS production

# Setar modo de produção 
ENV NODE_ENV=production

WORKDIR /app

# Copiar arquivos necessários com as permissões corretas
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Mudar para o usuário não-root 'node'
USER node

# Expor a porta
EXPOSE 3000

# Comando para rodar a aplicação em produção
CMD ["node", "dist/main"]
