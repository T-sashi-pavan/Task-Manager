# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
COPY . .

# Create tmp directory for SQLite in production
RUN mkdir -p /tmp

EXPOSE 3001

CMD ["npm", "start"]
