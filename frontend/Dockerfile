# frontend/Dockerfile

# ---- build stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps for node-gyp if needed (common in React projects)
RUN apk add --no-cache python3 make g++

# copy package files first for better caching
COPY package*.json ./

# install deps (use npm install to regenerate lock if missing/unsynced)
RUN npm install --legacy-peer-deps

# copy the rest of the project
COPY . .

# build production bundle
RUN npm run build

# ---- production stage ----
FROM nginx:stable-alpine

# copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built files to nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

# explicitly copy public files in case Vite didn’t move all of them
COPY public /usr/share/nginx/html

# ensure correct mime type for manifest.json
RUN echo 'types { application/manifest+json json; }' > /etc/nginx/conf.d/mime.types

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
