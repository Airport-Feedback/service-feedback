# consumer/Dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --production

COPY . .
ENV NODE_ENV=production
# run your consumer entry (index.mjs)
CMD ["node", "index.mjs"]
