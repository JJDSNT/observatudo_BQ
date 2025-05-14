# Etapa 1: build da aplicação
FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

# Instala dependências e constrói o projeto Next.js
RUN npm install && npm run build

# Etapa 2: imagem final mínima para produção
FROM node:18-alpine AS runner

WORKDIR /app

# Copia o app compilado
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.js ./next.config.js

# Variável obrigatória para Next.js SSR no modo standalone
ENV PORT=8080

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
