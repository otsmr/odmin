# Odmin
I created this project to provide a privacy compliant and feature rich "sign in with" solution for my own websites. In the meantime my focus has changed to web application security. It is therefore explicitly allowed to hack my own instance under odmin.de - and if the hack impresses me there is also a small bug bounty :)

![Dashboard](docs/dashboard.png "Dashboard")

## Let's Hack
1. Install Docker from [here](https://www.docker.com/products/docker-desktop)
2. run `sudo ./run.sh`
3. open `http://localhost:10004/`
4. setup odmin

Configurations can be adjusted here after setup: `odmin/docker-data/odmin/config.json`  

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
