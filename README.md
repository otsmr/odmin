Readme is just a brainstorming for now...


# Odmin
Simple user management with the aim to learn common web security vulnerability.

![Dashboard](docs/dashboard.png "Dashboard")


## Goals

- Cross-domain capable
- WebAuthn support
- e-mail notifications
- JWT
- ...

## check for web security vulnerabilities

- OAuth -> token not in the url
- sql-injection?
- logging + monitoring
- DoS?
- check dependencies: https://medium.com/hackernoon/im-harvesting-credit-card-numbers-and-passwords-from-your-site-here-s-how-9a8cb347c5b5
- id -> use uuidv4 
- http headers
    - x-frame
    - cors
    - content-type
    - ...
- ...


# getting started

Required are docker and docker-compose.

```bash
docker-compose up
```

*E-Mail debugging**
Test-Server: https://github.com/nodemailer/nodemailer-app