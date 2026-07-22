FROM node:22-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/scraper/package.json ./apps/scraper/package.json
RUN npm ci --omit=dev --workspace @psx/scraper && npm cache clean --force

WORKDIR /workspace/apps/scraper
COPY --chown=node:node apps/scraper/index.js ./

USER node

CMD ["node", "index.js"]
