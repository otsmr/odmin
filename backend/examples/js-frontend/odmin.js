

const config = {
    "serviceId": "e3jk94x828",
    "secret": "e5b6432c547f2baab64b8030d6fa375b44078692d3b19ab44630e59029d3",
    "baseUrl": "http://localhost:3030/"
};

class OdminOAuth {

    constructor (config) {

        this.serviceId = config.serviceId;
        this.secret = config.secret;
        this.baseUrl = config.baseUrl;

    }

    handleOAuthCode (code, callBack) {

        fetch(this.baseUrl + "api/v0/service/getsessionfromcode", {
            method: "POST",
            headers: {
                "Content-Typ": "application/json"
            },
            data: JSON.stringify({
                code,
                secret: this.secret
            })
        })
        .then(e => e.json())
        .then(session => {

            console.log(session);

            if (session.sessionToken) {
                this.cookie = session.sessionToken;
                callBack(true);
            }

            callBack(false);

        })
        .catch(e => {
            callBack(false);
        })

    }

    initSessionFromCookie (callBack) {

        if (!this.cookie)
            return false;

        fetch(this.baseUrl + "api/v0/service/getuserfromtoken", {
            method: "POST",
            headers: {
                "Content-Typ": "application/json"
            },
            data: JSON.stringify({
                token: this.cookie,
                secret: this.secret
            })
        })
        .then(e => e.json())
        .then(userData => {

            console.log(userData);

        })
        .catch(e => {
            callBack(false);
        })

    }

    handleLogout () {

    }

    getSigninUrl (continueUrl) {
        continueUrl = encodeURI(continueUrl);
        return this.baseUrl + "api/v0/service/user/sigin?serviceid=" + this.serviceId + "&continue=" . continueUrl;
    }

    get isLoggedIn () {
        return this.session.token !== "";
    }

    set cookie () {

    }

    get cookie () {

    }


}

window.odmin = new OdminOAuth(config);