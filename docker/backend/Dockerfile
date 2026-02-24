# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for nodemon)
RUN npm install

# Copy source code
COPY . .

EXPOSE 5000

# Use nodemon for hot-reloading in development
CMD ["npm", "run", "dev"]
