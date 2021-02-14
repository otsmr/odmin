
import { Token } from '../initdb';
import log from "../../utils/logs"

export const createNewToken = async (name: string, token: string, value: string = "") => {

    try {
        
        const tokens = await Token.create({
            token: token,
            name: name,
            value: value
        });

        if (!tokens) throw "Token konnte nicht erstellt werden.";

        return true;

    } catch (e) { 
        log.error("database", `createNewToken: ${e.toString()}` );
    }

    return false;

}

export const getAllTokensByName = async (name: string) => {

    try {
        
        return await Token.findAll({ where: { name }});

    } catch (e) {
        log.error("database", `getAllTokensByName: ${e.toString()}` );
    }

    return null;

}

export const getTokens = async (name: string, value: string) => {

    try {
        
        const tokens = await Token.findAll({ where: { 
            token: value,
            name
        }});

       return tokens;

    } catch (e) {
        log.error("database", `getToken: ${e.toString()}` );
    }

    return null;

}

export const getToken = async (name: string, token: string) => {

    try {
        
        const tokens = await Token.findAll({ where: {
            name,
            token
        }});

        if (tokens && tokens.length > 0) return { err: false, token: tokens[0] };

        return { err: false, token: null };

    } catch (e) {
        log.error("database", `isInviteTokenValid: ${e.toString()}` );
        return { err: true };
    }

}

export const removeToken = async (name, value, next) => {

    try {
        
        const tokens = await Token.findAll({ where: {
            name,
            token: value
        }});

       if (tokens) await tokens[0].destroy();

    } catch (e) {
        log.error("database", `removeToken: ${e.toString()}` );
    }

    next();

}

export const removeTokenById = async (tokenid: number) => {

    try {
        
        const tokens = await Token.findAll({ where: {
            id: tokenid
        }});

       if (tokens) await tokens[0].destroy();
       return true;

    } catch (e) {
        log.error("database", `removeTokenById: ${e.toString()}` );
    }

    return false

}