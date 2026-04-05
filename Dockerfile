# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o restante do código e buildar
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários do builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expor a porta
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "dist/main"]
