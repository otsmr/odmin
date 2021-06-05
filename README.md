# Odmin
I created this project to provide a privacy compliant and feature rich "sign in with" solution for my own websites. In the meantime my focus has changed to web application security. It is therefore explicitly allowed to hack my own instance under odmin.de - and if the hack impresses me there is also a small bug bounty :)

![Dashboard](docs/dashboard.png "Dashboard")

## Let's Hack
It is very easy to get Odmin up and running (but it does require docker and docker-compose):

```bash
docker-compose up
```

Configurations can be adjusted here after startup: `odmin/docker-data/odmin/config.json`

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
