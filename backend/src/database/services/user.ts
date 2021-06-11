
import * as crypto from 'crypto';
import * as Speakeasy from "speakeasy";

import { User } from '../initdb'
import log from '../../utils/logs'

import { createNewSession, getSessionByToken } from "./session";
import { getTokens, createNewToken } from "./token"
import { checkUserName } from '../../routes/shared';
import { checkPasswordDialog } from '../../utils/dialog';
import { sendNotification } from '../../mail/notify';
import { checkContinueLocation, getServiceByServiceId } from './service';
import { IUser } from '../models/user';


export const getUserByID =  async (userID: number): Promise<null | any | IUser> => {

    try {

        const user = await User.findByPk(userID);
        if (!user)
            return null;

        return user;
        
    } catch (e) {
        log.error("database", `getUserByID: ${e.toString()}` );
        return null;
    }

}

export const isAdminUserExists = async (): Promise<boolean> => {

    try {

        const adminUser = await User.findAll({
            where: {
                role: "admin"
            }
        });
    
        return (adminUser !== null) && adminUser.length > 0;
        
    } catch (e) {
        log.error("database", `isAdminUserExists: ${e.toString()}` );
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

async function handleCreateNewSession (req: {
    user: any
    ipAddress: string
    userAgent: string
    serviceID: string
    checkContinue: string
}): Promise<{
    continueUrl: string
    setCookieToken: string
} | null>  {

    const sessionToken = await createNewSession(req.user, req.ipAddress, req.userAgent);
    if (!sessionToken)
        return null;

    let continueUrl: string = ""; 
    if (req.serviceID) {
        continueUrl = await getBuildedContinueForService(req.serviceID, sessionToken, req.checkContinue);
    } else {
        continueUrl = checkContinueLocation(req.checkContinue);
    }

    const setCookieToken = crypto.randomBytes(30).toString('hex');

    if (!await createNewToken("odmin-set-cookie", setCookieToken, sessionToken)) {
        return null;
    };

    return {
        setCookieToken,
        continueUrl
    }

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
    setCookieToken?: string,
    continue?: string,
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

    let password = "";

    try {
        
        password = crypto.createHash('sha512').update(
            userInDB.user.salt.split("").sort().join("") + data.password + userInDB.user.salt
        ).digest('hex');

    } catch (error) {
        log.error("user", "checkCredentialForSignIn: " + error.toString());
        return failed();
    }

    if (password !== userInDB.user.password) {
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

    const {
        setCookieToken,
        continueUrl
    } = await handleCreateNewSession({
        checkContinue: data.checkContinue,
        ipAddress: data.ipadress,
        serviceID: data.serviceid,
        userAgent: data.userAgent,
        user: userInDB.user
    });
    
    call(false, {
        credentialsAreOk: true,
        setCookieToken,
        continue: continueUrl
    });

}


export const createNewUser = async (data: {
    username: string,
    password: string,
    serviceid: string,
    checkContinue: string,
    ipadress: string,
    userAgent: string,
    tokenDB: any
}, call: {(err: boolean, data?: { setCookieToken: string, continue: string }): void}) => {

    try {

        if (data.tokenDB)
            await data.tokenDB.destroy();

        const salt = await crypto.randomBytes(64).toString("hex");

        const password = crypto.createHash('sha512').update(
            salt.split("").sort().join("") + data.password + salt
        ).digest('hex');

        const user = await User.create({
            name: data.username,
            password,
            salt
        });
            
        if (!user)
            throw "Benutzer konnte nicht erstellt werden.";
        
        const {
            setCookieToken,
            continueUrl
        } = await handleCreateNewSession({
            checkContinue: data.checkContinue,
            ipAddress: data.ipadress,
            serviceID: data.serviceid,
            userAgent: data.userAgent,
            user: user
        });

        call(false, {
            setCookieToken,
            continue: continueUrl
        });

    } catch (e) {

        log.error("database", `createNewUser: ${e.toString()}` );
        call(true);
        
    }


}


export const getSessionIfValidBySessionToken = async (sessionToken: string)  => {

    try {

        if (!sessionToken)
            return null;

        const sessionDB = await getSessionByToken(sessionToken);
        if (!sessionDB || sessionDB.valid !== true)
            return null;

        return sessionDB;
        
    } catch (e) {
        log.error("database", `getSessionIfValidBySessionToken: ${e.toString()}` );
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
    
            const salt = await crypto.randomBytes(64).toString("hex");

            const password = crypto.createHash('sha512').update(
                salt.split("").sort().join("") + data.password + salt
            ).digest('hex');
                
            await user.update({ password, salt });

            sendNotification(userid, "changePassword");
    
            call(false, {
                updateSucces: true
            }); 

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


        const hashPassword = crypto.createHash('sha512').update(
            user.salt.split("").sort().join("") + password + user.salt
        ).digest('hex');

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
        
        sendNotification(userid, "updateAccount");

        call(false, {
            updateSucces: true
        });

    }

    try {

        let user = await getUserByID(userid);
        if (!user) throw "usernotfound";

        if (data.username) {
            
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