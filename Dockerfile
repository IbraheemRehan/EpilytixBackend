# Base image
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
ENV npm_config_engine_strict=false
RUN npm install

# Bundle app source
COPY . .

# Build the app
RUN npx nest build

# ---

# Production image
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy the bundled code from the build stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Set environment variables
ENV NODE_ENV=production

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
