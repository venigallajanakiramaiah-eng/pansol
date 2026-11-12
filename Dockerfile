# syntax=docker/dockerfile:1

# ---------- Stage 1: build the React client ----------
FROM node:22-bookworm-slim AS client-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY client ./client
RUN npm run build --workspace=client

# ---------- Stage 2: install server production dependencies ----------
FROM node:22-bookworm-slim AS server-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace=server --include-workspace-root=false

# ---------- Stage 3: small runtime image ----------
FROM node:22-bookworm-slim
ENV NODE_ENV=production \
    PORT=4000 \
    DATA_DIR=/data \
    CLIENT_DIST=/app/client/dist
WORKDIR /app
COPY --from=server-deps /app/node_modules ./node_modules
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 4000
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
