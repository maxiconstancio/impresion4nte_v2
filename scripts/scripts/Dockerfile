# Etapa 1: Build del proyecto
FROM node:20 AS build

WORKDIR /app

# Pasar la variable de entorno para el build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor liviano para archivos estáticos
FROM nginx:alpine

# Copiar el build generado
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
