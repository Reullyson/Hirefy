# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código e faz o build
COPY . .
# RUN npm run build # Ativar para produção

# Stage 2: Development (Padrão para agora)
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
