import { getUserByUsername, createNewUser, checkCredentialForSignIn, checkUserIsLocked } from "../database/services/user";
import { getToken } from "../database/services/token";
import { getServiceByServiceId } from "../database/services/service";
import config from "../utils/config";
import { SocketWithData } from "../utils/socket";

function getClientIPFromSocket (socket) {
    let ip = socket.handshake.headers['x-forwarded-for']?.split(",")[0] || socket.handshake.address || socket.clientip;
    return ip;
}


export default (socket: SocketWithData, slog) => {

    let signUpData: {
        username: string,
        password: string,
        tokenDB: any,
        checkContinue: string,
        serviceid: string
    } = {
        username: "",
        password: "",
        tokenDB: null,
        checkContinue: "/",
        serviceid: ""
    };

    socket

    .on("/sign/checkservice", async (serviceid: string, call: {(err: boolean, service: {
        name: string,
        homepage: string
    } | null)}) => {

        slog("API /sign/checkservice");

        const service = await getServiceByServiceId(serviceid);

        if (!service)
            return call(false, null);

        return call(false, {
            name: service.name,
            homepage: service.homepage
        });

    })

    .on("/sign/isloggedin", async (call: {(err: boolean, isLoggedIn: boolean, user?: { username: string, role: string, userid: number })}) => {

        slog("API /sign/isloggedin");

        await socket.user.checkToken();
    
        if (socket.user.isLoggedIn) 
            return call(false, true, {
                username: socket.user.name,
                role: socket.user.role,
                userid: socket.user.id
            });

        return call(false, false);

    })

    .on("/sign/getlockedtime", async (call: {(err: boolean, data: {
        timeLocked: number,
        isLocked: boolean
    }): void} ) => {

        slog("API /sign/getlockedtime");

        const timeLocked: number = await checkUserIsLocked(getClientIPFromSocket(socket));

        call(false, {
            timeLocked: timeLocked || 0,
            isLocked: timeLocked !== null
        });

    })

    .on("/sign/checkcredential", async ( data: { 
        password: string,
        username: string,
        twofaToken: string,
        serviceid: string | undefined
        checkContinue: string
    }, call: { (err: boolean, data: {
        credentialsAreOk: boolean,
        isLocked?: boolean,
        cookieToken?: string,
        continue: string,
        isWebAuthnUser?: boolean,
        isTwoFaUser?: boolean
    } ): void} ) => {

        slog("API /sign/checkcredential");
        
        checkCredentialForSignIn({
            ...data,
            ipadress: getClientIPFromSocket(socket),
            userAgent: socket.handshake.headers["user-agent"]
        }, call);
    
    })


    .on("/sign/checksignup", async ( data: { 
        username: string,
        password: string,
        passwordWdh: string,
        inviteToken: string,
        serviceid: string | undefined,
        checkContinue: string
    }, call: { (err: boolean, data?: {
        createSucces: boolean,
        problemWithInput?: { inputid: string, msg: string, inputValue: string },
        isLocked?: boolean
    }): void} ) => {

        slog("API /sign/checksignup");

        if (data.username.length < 4 ||data.username.length > 30) return call(false, {
            createSucces: false,
            problemWithInput: {
                inputid: "username",
                msg: "Benutzername muss zwischen 4 und 30 Zeichen enthalten.",
                inputValue: data.username
            }
        });
        if (data.username.match(/[^a-zA-Z0-9_]/)) return call(false, {
            createSucces: false,
            problemWithInput: {
                inputid: "username",
                msg: "Es sind nur Buchstaben (a-z) und Ziffern (0-9) erlaubt.",
                inputValue: data.username
            }
        });

        const userDB = await getUserByUsername(data.username);
        if (userDB.err)
            return call(true);

        if (userDB.user !== null) return call(false, {
            createSucces: false,
            problemWithInput: {
                inputid: "username",
                msg: "Dieser Benutzername ist vergeben.",
                inputValue: data.username
            }
        });

        if (data.password.length < 8) return call(false, {
            createSucces: false,
            problemWithInput: {
                inputid: "password",
                msg: "Passwort muss min. 8 Zeichen lang sein.",
                inputValue: data.password
            }
        });

        if (data.password !== data.passwordWdh) return call(false, {
            createSucces: false,
            problemWithInput: {
                inputid: "passwordWdh",
                msg: "Passwörter stimmen nicht überein.",
                inputValue: data.passwordWdh
            }
        });

        const tokenDB = await getToken("inviteToken", data.inviteToken);
        if (tokenDB.err)
            return call(true);

        const tokenDevAllow =
            config.get("runmode") === "development" &&
            data.inviteToken === config.get("dev:invitetoken");
        

        if (tokenDB.token === null && !tokenDevAllow) return call(false, {
            createSucces: false,
            problemWithInput: {
                inputid: "inviteToken",
                msg: "Dieser Token ist nicht gültig.",
                inputValue: data.inviteToken
            }
        });
        
        signUpData.username = data.username;
        signUpData.password = data.password;
        signUpData.checkContinue = data.checkContinue;
        signUpData.tokenDB = tokenDB.token;
        signUpData.serviceid = data.serviceid;

        call(false, {
            createSucces: true
        });
    
    })

    .on("/sign/privacyaccepted", (call: {(err: boolean, data?: { setCookieToken : string}): void}) => {

        slog("API /sign/privacyaccepted");

        if (signUpData.username === "")
            return call(true);

        createNewUser({
            ...signUpData,
            ipadress: getClientIPFromSocket(socket),
            userAgent: socket.handshake.headers["user-agent"]
        }, call)

    })
    
}
