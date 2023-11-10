FROM node:18-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG BOT_TOKEN
ENV BOT_TOKEN=$BOT_TOKEN

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm install;
COPY . .

CMD ["node", "index.mjs"]