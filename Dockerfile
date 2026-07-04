# ---------- Builder -------------------------------------------------
FROM node:22-alpine AS builder

# Work dir & make the local bin searchable
WORKDIR /usr/src/app
ENV PATH=/usr/src/app/node_modules/.bin:$PATH

# Install exact deps (deterministic)
COPY package*.json ./
ENV npm_config_engine_strict=false
RUN npm ci                     # no global Nest install – we use the local CLI

# Copy source & compile
COPY . .
RUN npm run build             # runs `nest build` → creates ./dist

# ---------- Production -----------------------------------------------
FROM node:22-alpine AS production
WORKDIR /usr/src/app

# **Copy the *entire* build output** (including dist, node_modules, etc.)
COPY --from=builder /usr/src/app . 

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
