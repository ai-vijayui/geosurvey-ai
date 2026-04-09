FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN npm install
RUN npm run build -w @geosurvey-ai/shared
RUN npm run build -w @geosurvey-ai/web

FROM node:20-alpine AS runtime
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/apps/web/dist ./dist

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "serve -s dist -l ${PORT:-10000}"]
