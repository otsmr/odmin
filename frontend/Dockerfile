FROM node:14.16.0

RUN  apt-get update \
     && apt-get update

COPY ./ /odmin/web
WORKDIR /odmin/web

RUN cd /odmin/web && npm install && \
    ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime

# RUN groupadd -r odmin && useradd -r -g odmin odmin
# USER odmin

EXPOSE 3000
ENTRYPOINT ["npm", "start"]