# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json ./
COPY apps/web/package*.json apps/web/
COPY apps/api/package*.json apps/api/
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM deps AS builder
WORKDIR /app
COPY . .
RUN mkdir -p apps/web/public
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma
RUN npm run build -w @lesextras/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache curl wget

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
