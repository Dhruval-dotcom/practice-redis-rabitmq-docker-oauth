# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Vite dev server with HMR
CMD ["npm", "run", "dev"]
