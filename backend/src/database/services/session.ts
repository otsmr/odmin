
import { Session } from "../initdb";

import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

import log from "../../utils/logs"
import config from "../../utils/config"

import fetch from "node-fetch"

export const createNewSession = async (user: any, ipadress?: string, userAgent?: string) => {

    try {

        let date = new Date();

        let sessions: any = {
            user_id: user.id,
            token: crypto.randomBytes(64).toString('hex'),
            expiresIn: date.setTime( date.getTime() + 1 * 86400000 )
        }


        if (user.saveLog) {
            sessions.clientip = ipadress || "";
            sessions.userAgent = userAgent || "";

            console.log("IP", ipadress);

            const localDomains = [
                "::1",
                "localhost",
                "127.0.0.1",
                ""
            ]

            // use real ip in dev
            if (
                config.get("nodeEnv") === "development" && 
                (localDomains.indexOf(ipadress) > -1 || ipadress.startsWith("127.0.0."))    
            ) {
                try {
                    
                    const resMyIP = await fetch(config.get("ipinfoservice") + "/api/myip");
                    const jsonMyIP = await resMyIP.json();
                    ipadress = jsonMyIP.ip || "";
                    sessions.clientip = ipadress;

                } catch (error) {
                    console.error(error);
                }

            }
            
            try {
                
                const response = await fetch(config.get("ipinfoservice") + "/api/ip", {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ip: ipadress
                    })
                });
                const responseJSON = await response.json();

                console.log(responseJSON);

                sessions.city = responseJSON.city;
                sessions.plz = responseJSON.zipcode;
                sessions.country = responseJSON.country_long + ` (${responseJSON.region})`;

            } catch (error) {
                console.log(error);
            }

        }

        await Session.create(sessions);

        return jwt.sign({
            id: user.id,
            name: user.name,
            role: user.role,
            token: sessions.token
        }, config.get("jsonwebtoken:secret"), { 
            expiresIn: '1d'
        });

    } catch (error) {
        log.error("database", `createNewSession: ${error.toString()}`);
    }

    return null;

}

export const destroySessionByToken = async (token) => {

    try {

        const logs = await Session.findAll({
            where: { token }
        });

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


export const getSessionByToken = async (userid, token) => {

    try {

        let session = await Session.findAll({
            where: {
                user_id: userid,
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