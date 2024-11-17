FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /frontend
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY --from=deps /frontend/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./

EXPOSE 3000
CMD ["bun", "run", "src/server.ts"]