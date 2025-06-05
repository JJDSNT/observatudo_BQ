# Etapa 1: build da aplicação
FROM node:18-alpine AS builder

WORKDIR /app

# 🔽 Aceita variáveis passadas via --build-arg
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

# 🔽 Torna as variáveis acessíveis no build do Next.js
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

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

# Variável obrigatória para Next.js SSR no modo standalone
ENV PORT=8080

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
