# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start", "--workspace=server"]