FROM node:12-alpine
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN node_modules/.bin/tsc

RUN rm -rf node_modules && npm ci --production


FROM node:12-alpine
WORKDIR /app
VOLUME /app/persist

ENV NODE_ENV=production

COPY --from=0 /build/node_modules ./node_modules
COPY locales locales/
COPY wikidata-items.yaml ./
COPY --from=0 /build/dist ./

CMD node -r source-map-support/register index.js
