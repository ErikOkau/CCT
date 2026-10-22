# Optional: Railway → Settings → Builder → Dockerfile
# Dockerfile path: services/discord-ocr-bot/Dockerfile (repo root as build context)

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY utils ./utils
COPY types ./types
COPY services/discord-ocr-bot/package*.json ./services/discord-ocr-bot/

WORKDIR /app/services/discord-ocr-bot
RUN npm ci && npm rebuild sharp

COPY services/discord-ocr-bot ./

CMD ["npm", "start"]
