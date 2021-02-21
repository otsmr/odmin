
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as Speakeasy from "speakeasy";

import { User } from '../initdb'
import log from '../../utils/logs'
import config from '../../utils/config'

import { createNewSession, getSessionByToken, JWT_SESSION_TOKEN } from "./session";
import { getAllKeysByUserid } from "./webauthn"
import { getTokens, createNewToken } from "./token"
import { checkUserName } from '../../routes/shared';
import { checkPasswordDialog } from '../../utils/dialog';
import EMailNotification from '../../mail/notify';
import { checkContinueLocation, getServiceByServiceId } from './service';
import service from '../models/service';


export const getUserByID =  async (userid) => {

    try {

        const user = await User.findByPk(userid);
        if (!user) throw "user not found";

        return user;
        
    } catch (e) {
        // log.error("database", `getUserByID: ${e.toString()}` );
        return null;
    }

}

export const getAllUsers =  async () => {

    return await User.findAll();

}

export const checkUserIsLocked = async (ipadress: string): Promise<number> => {

    const tokens = await getTokens("signinfailed", sha256(ipadress));

    const now = new Date().getTime();
    let count = 0;
    let time = null;
    if (tokens) {
        tokens.reverse();
        for (const token of tokens) {
            if (now - new Date(token.createdAt).getTime() < 3600000) {
                count++;
                time = new Date(token.createdAt).getTime();
            }
        }
    }
    
    if (count > 6) {
        time += 3600000;
    } else if (count > 3) {
        time += 60000;
    }

    if (count < 3 || time - now <= 0) return null;
    
    return time;

}

const sha256 = (string: string) => {
    return crypto.createHash('sha256').update(string).digest('hex');
}

// 1. create temp code for the url get param
// 2. create service-based session token
// TODO: create docs
export async function getBuildedContinueForService (serviceid: string, sessionsToken: string, checkContinueUrl: string ) {

    const service = await getServiceByServiceId(serviceid);
    
    if (!service) {
        return checkContinueLocation(checkContinueUrl);
    }

    let continueUrl = service.returnto;

    if (continueUrl.indexOf("?") === -1) {
        continueUrl += "?";
    } else {
        continueUrl += "&";
    }

    const code = crypto.randomBytes(30).toString('hex');
    const codeToSessionToken = crypto.randomBytes(30).toString('hex');

    if (!await createNewToken("oauth-temp-code", code, codeToSessionToken)){
        return checkContinueLocation(checkContinueUrl); 
    }

    sessionsToken = serviceid + "::" + sessionsToken;

    if (!await createNewToken("oauth-session-token", codeToSessionToken, sessionsToken)){
        return checkContinueLocation(checkContinueUrl); 
    }

    return continueUrl + `code=${code}&continue=${checkContinueUrl}`;

}

export const checkCredentialForSignIn = async (data: {
    username: string,
    password: string,
    ipadress: string,
    twofaToken: string,
    userAgent: string,
    checkContinue: string,
    serviceid: string | undefined
}, call: {(err: boolean, data?: {
    credentialsAreOk: boolean,
    isLocked?: boolean,
    cookieToken?: string,
    continue?: string,
    isWebAuthnUser?: boolean,
    isTwoFaUser?: boolean,
}): void}) => {

    const isLocked = await checkUserIsLocked(data.ipadress);

    if ( isLocked !== null ) {
        return call(false, { isLocked: true, credentialsAreOk: false });
    }

    const failed = async () => {
        await createNewToken("signinfailed", sha256(data.ipadress));
        call(false, {
            credentialsAreOk: false
        });
    }

    const userInDB = await getUserByUsername(data.username);
    if (userInDB.err) return call(true);

    if (userInDB.user === null) return failed();

    if (data.password.length === 0) {

        let credentialIDs = await getAllKeysByUserid(userInDB.user.id);
        if (credentialIDs.length === 0) return failed();

        return call(false, {
            credentialsAreOk: false,
            isWebAuthnUser: true
        });

    }

    if (sha256(data.password + userInDB.user.salt) !== userInDB.user.password) {
        return failed();
    }

    if (userInDB.user.twofa) {

        if (data.twofaToken === "") {
            return call(false, {
                credentialsAreOk: true,
                isTwoFaUser: true
            });
        }

        const verified = Speakeasy.totp.verify({ 
            secret: userInDB.user.twofa,
            encoding: 'base32',
            token: data.twofaToken,
            window: 2
        });
    
        if (!verified) {

            await createNewToken("signinfailed", sha256(data.ipadress));
            return call(false, {
                credentialsAreOk: false,
                isTwoFaUser: true
            });

        }

    }

    const sessionData = await createNewSession(userInDB.user, data.ipadress, data.userAgent);
    if (!sessionData) return call(true);

    let continueUrl: string = ""; 
    if (data.serviceid) {
        continueUrl = await getBuildedContinueForService(data.serviceid, sessionData.sessionsToken, data.checkContinue);
    } else {
        continueUrl = checkContinueLocation(data.checkContinue);
    }

    call(false, {
        credentialsAreOk: true,
        cookieToken: sessionData.jwt,
        continue: continueUrl
    });

}


export const createNewUser = async (data: {
    username: string,
    password: string,
    serviceid: string,
    checkContinue: string,
    ipadress: string,
    userAgent: string
}, call: {(err: boolean, data?: { cookieToken: string, continue: string }): void}) => {

    try {

        // await data.token.destroy();

        crypto.randomBytes(512, async (err, randomBytes) => {
            if (err) throw "crypto error";
                
            const salt = randomBytes.toString("hex");
            const password = crypto.createHash('sha256').update(data.password + salt).digest('hex');

            const user = await User.create({
                name: data.username,
                password,
                salt
            });
                
            if (!user) throw "Benutzer konnte nicht erstellt werden.";
            
            const sessionData = await createNewSession(user, data.ipadress, data.userAgent);
            if (!sessionData) return call(true);

            let continueUrl: string = ""; 
            if (data.serviceid) {
                continueUrl = await getBuildedContinueForService(data.serviceid, sessionData.sessionsToken, data.checkContinue);
            } else {
                continueUrl = checkContinueLocation(data.checkContinue);
            }
    
            call(false, {
                cookieToken: sessionData.jwt,
                continue: continueUrl
            });

        });

    } catch (e) {

        log.error("database", `createNewUser: ${e.toString()}` );
        call(true);
        
    }


}


export const checkIsTokanValid = async (jwt_token: string)  => {

    try {

        if (!jwt_token) return null;

        const jwt_data = (jwt.verify(jwt_token, config.get("jsonwebtoken:secret")) as JWT_SESSION_TOKEN);

        // the token is from an service
        if (jwt_data.service_id !== "odmin") {
            return null;
        }
        
        const userdb = await getUserByID(jwt_data.user_id);

        const session = await getSessionByToken(jwt_data.session_token);

        if (session && userdb)  {

            if (session.valid !== true)
                return null;
            
            return {
                id: userdb.id,
                username: userdb.name,
                role: userdb.role,
                token: jwt_data.session_token,
                userdb: userdb,
                session: session
            }
        }
        
    } catch (e) {
        log.error("database", `checkIsTokanValid: ${e.toString()}` );
    }
    
    return null;

}

export const destroyUserAccount = async (userid: number, call: {(err: boolean, success: string | boolean): void}) => {

    try {

        const user = await getUserByID(userid);
        if (!user) return call(true, false);

        await user.destroy();
        
    } catch (error) {
        log.error("database", `destroyUserAccount: ${error.toString()}` );
        return call(true, false);
    }

    call(false, true);

}

export const changeTwoFA = async (twofa: string, userid: number) => {

    try {

        const user = await getUserByID(userid);
        if (!user) throw "user not found";

        await user.update({
            twofa
        });

    } catch (e) {
        log.error("database", `changeTwoFA: ${e.toString()}` );
    }

}

export const getUserByUsername = async (username: string) => {

    try {

        const user = await User.findAll({ where: { name: username } });
        if (user.length !== 1) return { err: false, user: null };

        return { err: false, user: user[0] };
        
    } catch (e) {
        log.error("database", `getByUserName: ${e.toString()}`);
        return { err: true, msg: ""};
    }

}

export const changeUsersPassword = async (userid: number, data: {
    password: string,
    socket: any
}, call: {(err: boolean, data: { updateSucces: boolean} | string): void}) => {

    try {

        checkPasswordDialog(data.socket, "Passwort ändern", async (status) => {
                
            if (!status) return;

            log.info("database", `Passwort geändert: ${userid}`);

            const user = await getUserByID(userid);
            if (!user) throw "Benutzer nicht gefunden.";
    
            crypto.randomBytes(512, async (err, randomBytes) => {
                if (err) return call(false, { updateSucces: false });
    
                const salt = randomBytes.toString("hex");
                const hash = crypto.createHash('sha256');
                const hashPassword = hash.update(data.password + salt).digest('hex');
                
                await user.update({
                    password: hashPassword,
                    salt
                });

                new EMailNotification(userid).send("changePassword");
        
                call(false, {
                    updateSucces: true
                }); 
    
            })

        })

    } catch (e) {
        log.error("database", `changeUsersPassword: ${e.toString()}` );
        call(true, "Datenbankfehler");
    }

}

export const checkUserPassword = async (id, password) => {

    try {

        const user = await getUserByID(id);
        if (!user) return false;

        const hash = crypto.createHash('sha256');
        const hashPassword = hash.update(password + user.salt).digest('hex');

        if (hashPassword === user.password) return true;

    } catch (e) {
        log.error("database", `checkUserPassword: ${e.toString()}` );
    }
    
    return false;
}

export const updateUserAccount = async (userid: number, data: {
    username?: string,
    saveLogStatus?: boolean,
    socket: any
}, call: { (err: boolean, data?: {
    updateSucces: boolean,
    message?: string,
    problemWithInput?: { inputid: string, msg: string, inputValue: string }
} | string ): void}) => {

    function success () {
        new EMailNotification(userid).send("updateAccount");

        call(false, {
            updateSucces: true
        });
    }

    try {

        let user = await getUserByID(userid);
        if (!user) throw "usernotfound";

        if (data.username) {
            
            log.info("database", `Benutzername geändert: ${userid}`);
            const usernameStatus = await checkUserName(data.username);
            
            if (usernameStatus.error) {
                if (usernameStatus.message) return call(true, usernameStatus.message);
                return call(false, {
                    updateSucces: false,
                    problemWithInput: usernameStatus.problemWithInput
                });
            }
            
            await user.update({
                name: data.username
            });

            success();
            
        }
        
        if (typeof data.saveLogStatus === "boolean") {
        
            checkPasswordDialog(data.socket, "Erweitertes Sicherheitsprotokoll " + ((data.saveLogStatus) ? "aktivieren" : "deaktivieren"), async (status) => {
                
                if (!status) return;

                log.info("database", `saveLog geändert: ${userid}`);
                await user.update({
                    saveLog: data.saveLogStatus
                });

                success();

            })

        }

    } catch (e) {
        log.error("database", `updateUserAccount: ${e.toString()}`);
        call(true, "Datenbankfehler");
    }

}