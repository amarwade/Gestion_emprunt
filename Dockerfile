FROM nginx:alpine

# Config nginx custom (routing SPA, cache statique)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copie le site statique dans le dossier servi par nginx
# Adapte le nom du dossier source si ton code n'est pas à la racine (ex: ./public, ./src)
COPY . /usr/share/nginx/html

# Expose le port 80 pour accéder à l'application
EXPOSE 80 
