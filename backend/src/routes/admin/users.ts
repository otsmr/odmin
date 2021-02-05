import * as moment from "moment"
import { getAllUsers, getUserByID } from "../../database/services/user";
import { getAllKeysByUserid } from "../../database/services/webauthn";
import { getSessionsFromUser } from "../../database/services/session";
import { getNotificationsByUserID } from "../../database/services/notifications";
import { UAParser } from "ua-parser-js";
import { ISession } from "../profile";

interface IUser {
    id: number,
    name: string,
    enabled: boolean,
    role: string,
    createdAt: string
}

interface IUserAll extends IUser {
    isTwoFAEnabled: boolean,
    isWebAuthnInUse: boolean,
    lastLogin: string,
    updatedAt: string,
    sessions: ISession[],
    chanels: {
        email: string,
        matrixid: string,
        telegramid: string
    }
}

interface IInputProblem { inputid: string, msg: string, inputValue: string }

function getHumanTime (dbTime: string) {
    return moment(new Date(dbTime).getTime()).format("DD.MM.YYYY HH:mm")
}

export default (socket: any, slog: {(msg: string): void}) => {

    socket

    .on("/admin/users/getall", async (call: {(err: boolean, allUsers?: IUser[]): void}) => {
        
        slog("API /admin/users/getall");

        if (!socket.user || socket.user.role !== "admin") return call(true);

        const users = await getAllUsers();

        if (!users) return call(true);

        call(false, users.map((user: IUser) => {
            return {
                id: user.id,
                name: user.name,
                role: user.role,
                enabled: user.enabled,
                createdAt: getHumanTime(user.createdAt)
            }
        }));

    })

    .on("/admin/users/getuser", async (userid: number, call: {(err: boolean, userData?: IUserAll): void}) => {

        slog("API /admin/users/getall");

        if (!socket.user || socket.user.role !== "admin") return call(true);

        const user = await getUserByID(userid);
        if (!user) return call(true);

        const webAuthnKeys = await getAllKeysByUserid(user.id);
        const sessionsInDB = await getSessionsFromUser(user.id) || [];
        const notification = await getNotificationsByUserID(user.id);
        let sessions: ISession[] = [];

    
            
        if (sessionsInDB.length > 0) {

            sessionsInDB.forEach(session => {
                const ua = new UAParser(session.userAgent);
                let expiresInMoment = moment(new Date(session.expiresIn).getTime()).fromNow(true);

                if (new Date(session.expiresIn).getTime() < new Date().getTime()) 
                    expiresInMoment = "Abgelaufen";

                sessions.push({
                    id: session.id,
                    clientip: (session.clientip || "-"),
                    plz: session.plz,
                    browser: ua.getBrowser().name + " " + ua.getBrowser().version,
                    os: ua.getOS().name + " " + (ua.getOS().version || ""),
                    createdAtMoment: getHumanTime(session.createdAt),
                    expiresInMoment: expiresInMoment,
                    country: session.country,
                    city: session.city
                });
            });
            
        }

        call(false, {
            id: user.id,
            name: user.name,
            role: user.role,
            enabled: user.enabled,
            createdAt: getHumanTime(user.createdAt),
            updatedAt: getHumanTime(user.updatedAt),
            isTwoFAEnabled: (user.twofa !== ""),
            isWebAuthnInUse: (webAuthnKeys.length > 0),
            lastLogin: (sessions.length > 0) ? getHumanTime((sessions[sessions.length-1] as any).createdAt) : "-",
            chanels: {
                email: (notification) ? notification.email : "",
                matrixid: (notification) ? notification.matrixid : "",
                telegramid: (notification) ? notification.telegramid : ""
            },
            sessions
        })
        

    })

    // .on("/admin/invitetoken/delete", async (tokenid: number, call: {(err: boolean): void}) => {

    //     slog("API /admin/invitetoken/delete");

    //     if (!socket.user || socket.user.role !== "admin") return call(true);

    //     call(!await removeTokenById(tokenid));

}