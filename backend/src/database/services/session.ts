
import { Session } from "../initdb";

import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

import log from "../../utils/logs"
import config from "../../utils/config"

import EMailNotification from "../../mail/notify";
import { getLocationFromIP, getRealIpInDevMode } from "../../utils/ip-address";

export interface JWT_SESSION_TOKEN {
    session_token: string
    user_id: number
    user_name: string
    user_role: string
    service_id: string
}

export const createNewSession = async (user: any, ipadress?: string, userAgent?: string) => {

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

        const jwtData: JWT_SESSION_TOKEN = {
            user_id: user.id,
            user_name: user.name,
            user_role: user.role,
            session_token: sessions.token,
            service_id: "odmin"
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

            new EMailNotification(user.id).send("newSignin");

        })

        return {
            jwt: jwt.sign(jwtData, config.get("jsonwebtoken:secret"), { 
                expiresIn: '1d'
            }),
            sessionsToken: sessions.token
        }

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