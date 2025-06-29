# Build Stage
#frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Evita conflitos de dependências (como o do react-image-lightbox)
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
