FROM node:18-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml* tsconfig.json ./
RUN corepack enable && pnpm install
COPY . .
RUN pnpm build
CMD ["pnpm", "run", "ingest:all"]



