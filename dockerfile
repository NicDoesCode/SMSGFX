FROM nginx

ADD ./dist /usr/share/nginx/html

EXPOSE 80

