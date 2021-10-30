# Odmin
I created this project to provide a privacy compliant and feature rich "sign in with" solution for my own websites. In the meantime my focus has changed to web application security. It is therefore explicitly allowed to hack my own instance under odmin.de - and if the hack impresses me there is also a small bug bounty :)

![Dashboard](docs/dashboard.png "Dashboard")

## Development 

1. install Docker from [here](https://www.docker.com/products/docker-desktop)
2. run `sudo ./run.sh`
3. wait until no more new logs come
4. Press `strg + c` to stop and run `sudo ./run.sh` again
5. open `http://localhost:10004/`
6. setup odmin

## Build

1. install node and npm from [here](https://www.freecodecamp.org/news/how-to-install-node-js-on-ubuntu-and-update-npm-to-the-latest-version/)
2. Install zip if not already installed
3. run `./build.sh`

## Production (with docker-container)

Download the latest version at  [Releases](https://github.com/otsmr/odmin/releases) or build it yourself as described above.

1. run ``docker-compose build``
2. run ``docker-compose up``
3. If you are running on localhost, use a hosts entry. Production environments cannot run on localhost.  
    ``127.0.0.1   odmin.local``
4. open ``http://odmin.local:10004/setup``
5. Follow the setup  
    ``mysql-host: prod_odmin_mysql``
6. Restarting the Docker container to reload the configurations 

The different pages are available under the following port number:  

| Page | Port |
| ----- | --- |
| mysql | 10001 |
| phpMyAdmin | [10002](http://localhost:10002) (Username:Password: `root:root`)
| Backend (API) | [10003](http://localhost:10003) |
| Frontend | [10004](http://localhost:10004) |  


## Goals

- Two-factor authentication
- WebAuthn (not yet implemented)
- DSGVO compliant (Privacy-by-Design)
- modern and intuitive design
- open source project
- "Login-with" solution for *own* websites (cross-domain)


## ToDo

- id -> use uuidv4
- WebAuthn
- Demo-Account: demo:demo
