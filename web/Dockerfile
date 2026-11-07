# Imagen de producción del frontend de tivu (Next, modo standalone), para
# Coolify. Sirve el panel (app.tivuapp.com) y las tiendas (*.tivuapp.store).
# Guía: docs/infra/despliegue-web.md

# 1) Dependencias.
FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 2) Build. Las NEXT_PUBLIC_* se fijan aquí, dentro del bundle: salen de
#    .env.production (en el repo, sin secretos).
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Lo que corre: solo el servidor standalone y los estáticos.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/login > /dev/null || exit 1

CMD ["node", "server.js"]
