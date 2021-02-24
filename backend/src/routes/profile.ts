import { getNotificationsByUserID } from "../database/services/notifications";
import { getSessionByToken, getSessionsFromUser, deleteSessionById } from "../database/services/session";

import { UAParser } from "ua-parser-js";
import * as cookie from "cookie"
import * as moment from "moment"
moment.locale("de")

import { checkIsTokanValid, getUserByID } from "../database/services/user";
import { getAllKeysByUserid } from "../database/services/webauthn";
import { getUserByCookie } from "./shared";

import { confirm } from "../utils/dialog"

export interface ISession {
    id: number,
    clientip: string;
    browser: string;
    os: string;
    plz: string,
    city: string,
    country: string,
    valid: boolean,
    expiresInMoment: string;
    createdAtMoment: string;
}


export default (socket, slog) => {

    socket.on("/personalinfo/summary", async (call: {(err: boolean, data?: { email: string, lastSession: { clientip: string, os: string, browser: string } } | string): void } ) => {

        slog("API /personalinfo/summary");
        const user = await getUserByCookie(socket);
        if (!user) return call(false);
        
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const userJWT = await checkIsTokanValid(cookies.token);

        // FIXME: ? userJWT not defined ?
        
        const notify = await getNotificationsByUserID(user.userid);
        const session = await getSessionByToken(userJWT?.token)
                
        const options = {
            email: notify?.email || "",
            lastSession: {
                clientip: "",
                browser: "",
                os: "",
                plz: "",
                city: "",
                country: "",
                valid: false,
                createdAtMoment: ""
            }
        }
        
        if (session && session.type) {

            options.lastSession = {
                clientip: (session.clientip || "-"),
                browser: "-",
                os: "-",
                valid: session.valid,
                plz: session.plz,
                country: session.country,
                city: session.city,
                createdAtMoment: moment(new Date(session.createdAt).getTime()).format("DD.MM.YYYY HH:mm")
            }

            const ua = new UAParser(session.userAgent);

            if (ua.getBrowser().name) {
                options.lastSession.browser = ua.getBrowser().name + " " + ua.getBrowser().version;
                options.lastSession.os = ua.getOS().name + " " + (ua.getOS().version || "");
            }

        }

        call(false, options);


    });

    interface ISecurityData {
        isTwoFAEnabled: boolean;
        isExtendedLogEnabled: boolean;
        webAuthnKey: number;
        sessions: ISession[];
    }

    socket.on("/security/summary", async (call: {(err: boolean, data: ISecurityData | string): void}) => {

        slog("API /security/summary");
        const user = await getUserByCookie(socket);
        if (!user) return call(true, "nicht angemeldet");

        const sessionsInDb = await getSessionsFromUser(user.userid);
        let webauthn = await getAllKeysByUserid(user.userid);

        let webAuthnKey = 0;
        if (webauthn) webAuthnKey = webauthn.length;

        sessionsInDb.reverse();

        const sessions: ISecurityData["sessions"] = []

        for (const sessionInDb of sessionsInDb) {

            let expiresInMoment = moment(new Date(sessionInDb.expiresIn).getTime()).fromNow(true);

            if (new Date(sessionInDb.expiresIn).getTime() < new Date().getTime()) 
                expiresInMoment = "Abgelaufen";

            let session = {
                id: sessionInDb.id,
                clientip: (sessionInDb.clientip || "-"),
                browser: "-",
                os: "-",
                valid: sessionInDb.valid,
                plz: sessionInDb.plz,
                city: sessionInDb.city,
                country: sessionInDb.country,
                expiresInMoment: expiresInMoment,
                createdAtMoment: moment(new Date(sessionInDb.createdAt).getTime()).fromNow(true)
            }

            const ua = new UAParser(sessionInDb.userAgent);

            if (ua.getBrowser().name) {
                session.browser = ua.getBrowser().name + " " + ua.getBrowser().version;
                session.os = ua.getOS().name + " " + (ua.getOS().version || "");
            }

            sessions.push(session);

        }

        call(false, {
            webAuthnKey,
            isTwoFAEnabled: (socket.user.twofa) ? true : false,
            isExtendedLogEnabled: (socket.user.saveLog as boolean),
            sessions
        });

    })

    .on("/security/sessions/delete", async (sessionid: number, call: {(err: boolean): void}) => {

        slog("API /security/sessions/delete");
        const user = await getUserByCookie(socket);
        if (!user) return call(true);

        if (socket.currentSession.id === sessionid) {
            confirm(socket, {
                title: "Aktuelle Session löschen?",
                text: "Die aktuelle Session wird gelöscht und Sie müssen sich erneut anmelden.",
                onSuccess: async () => {
                    await deleteSessionById(sessionid);
                    call(false);
                }
            })
        } else {
            await deleteSessionById(sessionid);
            call(false);
        }


    })


}