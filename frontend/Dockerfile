# frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Create necessary directories
RUN mkdir -p /app/certs

EXPOSE 3000

CMD ["npm", "run", "dev"]
