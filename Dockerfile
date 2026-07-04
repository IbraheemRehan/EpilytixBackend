# ---------- Builder -------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /usr/src/app
ENV PATH=/usr/src/app/node_modules/.bin:$PATH

# Install dependencies
COPY package*.json ./
ENV npm_config_engine_strict=false
RUN npm install
RUN chmod -R 755 ./node_modules/.bin

# Copy source & compile
COPY . .
RUN npm run build

# Verify the build output exists
RUN ls -la dist/ && ls dist/main.js

# ---------- Production -----------------------------------------------
FROM node:22-alpine AS production
WORKDIR /usr/src/app

# Copy only what we need
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
