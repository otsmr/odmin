import { getUserByUsername, checkIsTokanValid } from "../database/services/user";
import * as cookie from "cookie"
import { alert } from "../utils/dialog"

export function checkPassword (password: string, passwordWdh: string) {

    if (password.length < 8) return {
        error: true,
        problemWithInput: {
            inputid: "password",
            msg: "Passwort muss min. 8 Zeichen lang sein.",
            inputValue: password
        }
    };

    if (password !== passwordWdh) return {
        error: true,
        problemWithInput: {
            inputid: "passwordWdh",
            msg: "Passwörter stimmen nicht überein.",
            inputValue: passwordWdh
        }
    };

    return {
        error: false
    }

}


export async function checkUserName (username: string) {

    if (username.length < 4 || username.length > 30) return {
        error: true,
        problemWithInput: {
            inputid: "username",
            msg: "Benutzername muss zwischen 4 und 30 Zeichen enthalten.",
            inputValue: username
        }
    };
    if (username.match(/[^a-zA-Z0-9_]/)) return {
        error: true,
        problemWithInput: {
            inputid: "username",
            msg: "Es sind nur Buchstaben (a-z) und Ziffern (0-9) erlaubt.",
            inputValue: username
        }
    };

    const userInDB = await getUserByUsername(username);
    if (userInDB.err)  return {
        error: true,
        message: "Datenbankfehler"
    };

    if (userInDB.user !== null) return {
        error: true,
        problemWithInput: {
            inputid: "username",
            msg: "Dieser Benutzername ist vergeben.",
            inputValue: username
        }
    };

    return {
        error: false
    }

}

const signOutAlert = (socket: any): null => {
    if (socket.user === null) return null;
    socket.user = null;

    alert(socket, {
        title: "Abgemeldet",
        text: "Die aktuelle Session ist nicht mehr gültig. Bitte melden Sie sich erneut an.",
        action: "reload",
        btnTitel: {
            success: "Erneut Anmelden"
        }
    });
    
    return null;
}

export async function getUserByCookie (socket: any): Promise<{ userid: number, username: string, role: string } | null> {

    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    if (cookies.token) {

        const user = await checkIsTokanValid(cookies.token);

        if (!user) return signOutAlert(socket);

        socket.user = user.inDB;
        socket.currentSession = user.session;

        return {
            userid: user.id,
            username: user.username,
            role: user.role
        }

    }
    return signOutAlert(socket);

}