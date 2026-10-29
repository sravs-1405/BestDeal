FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN npm ci --omit=dev --prefix ./backend

COPY backend ./backend
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix ./frontend
COPY frontend ./frontend
RUN npm run build --prefix ./frontend

FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production \
    PORT=10000 \
    PYTHON_PATH=python3

EXPOSE 10000
CMD ["node", "backend/src/server.js"]
