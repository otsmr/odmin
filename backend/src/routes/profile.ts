import { getNotificationsByUserID } from "../database/services/notifications";
import { getSessionsFromUser, deleteSessionById } from "../database/services/session";

import { UAParser } from "ua-parser-js";
import * as moment from "moment"
moment.locale("de")

import { confirm } from "../utils/dialog"
import { SocketWithData } from "../utils/socket";
import { ISession } from "../database/models/sessions";

export default (socket: SocketWithData, slog) => {

    socket.on("/personalinfo/summary", async (call: {(err: boolean, data?: { email: string, lastSession: { clientip: string, os: string, browser: string } } | string): void } ) => {

        if (!socket.user.isLoggedIn) 
            return call(true, "");
        
        slog("API /personalinfo/summary");

        const sessionDB = socket.user.sessionDB;
        const notify = await getNotificationsByUserID(socket.user.id);
                
        const options = {
            email: notify?.email || "",
            lastSession: {
                clientip: "-",
                browser: "-",
                os: "-",
                plz: "",
                city: "",
                country: "",
                valid: false,
                createdAtMoment: ""
            }
        }
        
        if (sessionDB && sessionDB.type) {

            options.lastSession = {
                ...options.lastSession,
                valid: sessionDB.valid,
                plz: sessionDB.plz,
                country: sessionDB.country,
                city: sessionDB.city,
                clientip: (sessionDB.clientip || "-"),
                createdAtMoment: moment(new Date(sessionDB.createdAt).getTime()).format("DD.MM.YYYY HH:mm")
            }

            const ua = new UAParser(sessionDB.userAgent);

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
        sessions: ISession[];
    }

    socket.on("/security/summary", async (call: {(err: boolean, data: ISecurityData | string): void}) => {

        if (!socket.user.isLoggedIn) 
            return call(true, "");

        slog("API /security/summary");

        const sessionsInDb = await getSessionsFromUser(socket.user.id);

        sessionsInDb.reverse();

        const sessions: ISecurityData["sessions"] = []

        for (const sessionDB of sessionsInDb) {

            let expiresInMoment = moment(new Date(sessionDB.expiresIn).getTime()).fromNow(true);

            if (new Date(sessionDB.expiresIn).getTime() < new Date().getTime()) 
                expiresInMoment = "Abgelaufen";

            let session = {
                id: sessionDB.id,
                clientip: (sessionDB.clientip || "-"),
                browser: "-",
                os: "-",
                valid: sessionDB.valid,
                plz: sessionDB.plz,
                city: sessionDB.city,
                country: sessionDB.country,
                expiresInMoment: expiresInMoment,
                createdAtMoment: moment(new Date(sessionDB.createdAt).getTime()).format("DD.MM.YYYY HH:mm")
            }

            const ua = new UAParser(sessionDB.userAgent);

            if (ua.getBrowser().name) {
                session.browser = ua.getBrowser().name + " " + ua.getBrowser().version;
                session.os = ua.getOS().name + " " + (ua.getOS().version || "");
            }

            sessions.push(session);

        }

        call(false, {
            isTwoFAEnabled: (socket.user.twofa) ? true : false,
            isExtendedLogEnabled: socket.user.saveLog,
            sessions
        });

    })

    .on("/security/sessions/delete", async (sessionid: number, call: {(err: boolean): void}) => {

        slog("API /security/sessions/delete");
        
        if (!socket.user.isLoggedIn) 
            return call(true);

        if (socket.user.sessionDB.id === sessionid) {
            confirm(socket, {
                title: "Aktuelle Session löschen?",
                text: "Die aktuelle Session wird gelöscht und Sie müssen sich erneut anmelden.",
                onSuccess: async () => {
                    await socket.user.sessionDB.destroy();
                    await socket.user.checkToken();
                    call(false);
                }
            })
        } else {
            await deleteSessionById(sessionid);
            call(false);
        }

    })

}
