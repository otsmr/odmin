FROM node:14.16.0

RUN  apt-get update \
     && apt-get update

WORKDIR /odmin/frontend

RUN ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime

COPY "./entrypoint.sh" "/odmin/"

RUN ["/bin/chown", "node:node", "/odmin/entrypoint.sh"]
RUN ["/bin/chmod", "+x", "/odmin/entrypoint.sh"]

EXPOSE 3000

USER node

ENTRYPOINT ["/odmin/entrypoint.sh"]
