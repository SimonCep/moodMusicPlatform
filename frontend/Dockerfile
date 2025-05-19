# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/certs

EXPOSE 3000

CMD ["npm", "run", "dev"]
