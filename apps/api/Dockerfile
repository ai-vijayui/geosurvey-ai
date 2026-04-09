FROM node:20-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm install
RUN npm run build -w @geosurvey-ai/shared
RUN npm run build -w @geosurvey-ai/api
RUN npx prisma generate --schema=prisma/schema.prisma

FROM node:20-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin python3-gdal openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY packages ./packages
COPY apps/api/package*.json ./apps/api/

RUN npm install --omit=dev
RUN npx prisma generate --schema=prisma/schema.prisma

COPY --from=build /app/apps/api/dist ./apps/api/dist

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node apps/api/dist/index.js"]
