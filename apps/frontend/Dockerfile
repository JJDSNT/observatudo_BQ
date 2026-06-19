# Build context: raiz do monorepo (precisa de pnpm-workspace.yaml/pnpm-lock.yaml)
# docker build -f apps/frontend/Dockerfile .

# Etapa 1: build da aplicação
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /repo

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

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend ./apps/frontend

RUN pnpm install --filter frontend... --frozen-lockfile
RUN pnpm --filter frontend build

# Etapa 2: imagem final mínima para produção (Next.js standalone output)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /repo/apps/frontend/.next/standalone ./
COPY --from=builder /repo/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /repo/apps/frontend/public ./apps/frontend/public

EXPOSE 8080

CMD ["node", "apps/frontend/server.js"]
