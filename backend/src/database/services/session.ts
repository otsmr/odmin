
import { Session } from "../initdb";

import * as crypto from 'crypto';

import log from "../../utils/logs"

import { sendNotification } from "../../mail/notify";
import { getLocationFromIP, getRealIpInDevMode } from "../../utils/ip-address";


export const createNewSession = async (user: any, ipadress?: string, userAgent?: string): Promise<string | null> => {

    try {

        let date = new Date();

        let sessions: any = {
            user_id: user.id,
            token: crypto.randomBytes(64).toString('hex'),
            expiresIn: date.setTime( date.getTime() + 1 * 86400000 )
        }

        const session = await Session.create(sessions);

        if (!session) {
            return null;
        }

        new Promise(async () => {

            if (user.saveLog) {

                ipadress = await getRealIpInDevMode(ipadress);
                
                sessions.clientip = ipadress || "";
                sessions.userAgent = userAgent || "";
    
                sessions = {
                    ...sessions,
                    ...await getLocationFromIP(ipadress)
                }
                
                await Session.update(sessions, {
                    where: {
                        id: session.dataValues.id
                    }
                });
    
            }

            sendNotification(user.id, "newSignin");

        })

        return sessions.token;

    } catch (error) {
        log.error("database", `createNewSession: ${error.toString()}`);
    }

    return null;

}

export const disableSessionByToken = async (token: string) => {

    try {

        const session = await Session.findAll({
            where: { token }
        });

        if (session.length !== 1) return false;

        await session[0].update({
            valid: false
        })

        return true;
        
    } catch (error) {
        log.error("database", `disableSessionByToken: ${error.toString()}`);
    }

    return false;

}

export const destroySessionByToken = async (token) => {

    try {

        const logs = await Session.findAll({
            where: { token }
        });

        if (logs.length === 0) return false;

        for (const item of logs) {
            await item.destroy();
        }

        return true;
        
    } catch (error) {
        log.error("database", `destroySessionByToken: ${error.toString()}`);
    }

    return false;

}

export const deleteSessionById = async (sessionid: number) => {

    try {

        const logs = await Session.findAll({
            where: { id: sessionid }
        });

        for (const item of logs) {
            await item.destroy();
        }

        return true;
        
    } catch (error) {
        log.error("database", `deleteSessionById: ${error.toString()}`);
    }

    return false;

}

export const clearAllSessionsFromUser = async (userid, call) => {

    try {

        const logs = await Session.findAll({
            where: { user_id: userid }
        });

        for (const item of logs) {
            await item.destroy();
        }
        
    } catch (error) {
        log.error("database", `clearAllSessionsFromUser: ${error.toString()}`);

    }

    call();

}

export const getSessionsFromUser = async (userid) => {

    try {

        const session = await Session.findAll({
            where: { 
                user_id: userid 
            } 
        });
        
        if (session.length === 0) return null;

        return session;
        
    } catch (error) {
        log.error("database", `getSessionsByUserID: ${error.toString()}`);
        return null;
    }

}


export const getSessionByToken = async (token: string) => {

    try {

        let session = await Session.findAll({
            where: {
                token: token,
                type: "signin"
            }
        });

        if (session.length === 0) return null;

        if (new Date().getTime() < new Date(session[0].expiresIn).getTime()) {
            return session[0];
        }
        
    } catch (error) {
        log.error("database", `getSessionByToken: ${error.toString()}`);
    }

    return null;

}