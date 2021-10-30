FROM node:14.16.0

RUN  apt-get update \
     && apt-get update

WORKDIR /odmin

RUN ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime

COPY "./" "/odmin/"

RUN ["/bin/chown", "-R",  "node:node", "/odmin"]
RUN ["/bin/chmod", "+x", "/odmin/entrypoint.sh"]

EXPOSE 3030

USER node

ENTRYPOINT ["/odmin/entrypoint.sh"]
