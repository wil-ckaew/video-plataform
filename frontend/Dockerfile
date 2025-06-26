# Build Stage
FROM node:18-alpine AS build
WORKDIR /pages
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /pages/.next /usr/share/nginx/html/.next
COPY --from=build /pages/public /usr/share/nginx/html/public
COPY --from=build /pages/nginx.conf /etc/nginx/nginx.conf
