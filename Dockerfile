# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /src

# "production" por defecto — pasar --build-arg CONFIGURATION=development
# para una imagen de prueba con el environment de dev horneado adentro.
ARG CONFIGURATION=production

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration=$CONFIGURATION

FROM nginx:alpine AS final
COPY --from=build /src/dist/OAuthService/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 8080: mismo puerto que ya usan plexrag-api/authservice en Container Apps.
EXPOSE 8080
