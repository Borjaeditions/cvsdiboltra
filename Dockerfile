# Imagen base
FROM node:18

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la app
CMD ["node", "index.js"]