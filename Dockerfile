FROM node:12-alpine
WORKDIR /app
VOLUME /app/persist

ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
CMD ["npm", "start"]
