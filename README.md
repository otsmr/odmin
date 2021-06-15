# Odmin
I created this project to provide a privacy compliant and feature rich "sign in with" solution for my own websites. In the meantime my focus has changed to web application security. It is therefore explicitly allowed to hack my own instance under odmin.de - and if the hack impresses me there is also a small bug bounty :)

![Dashboard](docs/dashboard.png "Dashboard")

## Let's Hack
It is very easy to get Odmin up and running (but it does require docker and docker-compose):

```bash
docker-compose up
```

Configurations can be adjusted here after startup: `odmin/docker-data/odmin/config.json`  

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
