# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Instalar dependências nativas utilitárias caso algum pacote exija
RUN apk add --no-cache python3 make g++

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o restante do código e buildar
COPY . .
RUN npm run build

# Otimização: Remover pacotes de desenvolvimento ANTES de copiar
RUN npm prune --omit=dev

# Stage 2: Production
FROM node:24-alpine

# Setar modo de produção 
ENV NODE_ENV=production

WORKDIR /app

# Copiar arquivos necessários atribuindo as permissões ao usuário seguro
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Mudar para o usuário não-root 'node' (padrão em imagens node baseadas em Alpine)
USER node

# Expor a porta
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "dist/main"]
