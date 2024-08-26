# Establece la imagen base
FROM node:21-alpine3.18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

# Expone el puerto en el que la aplicación estará corriendo
EXPOSE 3000

# Establece la variable de entorno NODE_ENV a production
#ENV NODE_ENV=production

# Comando para correr la aplicación
CMD ["npm", "start"]