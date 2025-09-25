# api/Dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --production

COPY . .
ENV NODE_ENV=production
EXPOSE 3000
# assumes your package.json start script runs your server (server.mjs)
CMD ["npm", "start"]
