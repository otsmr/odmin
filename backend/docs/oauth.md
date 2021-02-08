
# Ziel von "Anmelden mit Odmin"

- ein Login für alle **eigenen** Seiten des Betreibers der Odmin Instance

Beispiel: Betreiber A besitzt folgende Webseiten:
- oabos.de
- osurl.de

Unter der Webseite odmin.de betreibt er eine Instanz von Odmin.  
- Hier kann der Benutzer seine Benutzerinformationen ändern
- Die Seiten haben direkten Zugriff über eine API auf
    - E-Mail-Adresse
    - Benutzername
    - die aktuelle Session


## Step 1: Authorization Code Link

`GET https://odmin.de/signin?serviceid=SERVICE_ID&continue=CONTINUE`

SERVICE_ID = the application’s client ID (how the API identifies the application)
CONTINUE = where the service redirects the user-agent after an authorization code is granted

## Step 2: User Authorizes Application

Benutzer meldet sich an. 

## Step 3: Application Receives Authorization Code

`GET https://CALLBACK_URL?code=AUTHORIZATION_CODE`

CALLBACK_URL: Wird beim erstellen des Dienstes im odmin festgelegt
AUTHORIZATION_CODE: 

## Step 4: Application Requests Access Token

`POST https://odmin.de/v1/oauth/token?serviceid=SERVICE_ID&service_secret=SERVICE_SECRET&code=AUTHORIZATION_CODE`

## Step 5: Application Receives Access Token

```JSON
{ "session_token":"SESSION_TOKEN" }
```

Der JWT-SESSION-TOKEN beinhaltet:

TOKEN: session_token
SERVICE_ID: 
USER_ID: integer
USER_NAME:  
USER_ROLE: admin | viewer