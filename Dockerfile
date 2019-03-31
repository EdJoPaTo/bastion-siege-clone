FROM node:11-alpine
WORKDIR /app

ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
CMD ["npm", "start"]