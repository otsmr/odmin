#!/bin/bash

if [ $(id -u) = 0 ]; then
    mkdir ./docker-data/odmin
    mkdir ./backend/build

    chown "${SUDO_USER}:${SUDO_USER}" ./docker-data/odmin
    chown "${SUDO_USER}:${SUDO_USER}" ./backend/build
fi

docker-compose up