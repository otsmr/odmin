import { getSessionIfValidBySessionToken, getUserByID } from './../database/services/user'
import { IUser } from './../database/models/user'
import socket = require("socket.io");

export class SocketUser {

    _sessionToken: string | null;
    _isValid: boolean;
    _userDB: IUser | null;
    _sessionDB: any | null;

    constructor (sessionToken: string | null) {
        this._sessionToken = sessionToken;
        this._userDB = null;
        this._sessionDB = null;
    }

    checkToken () {

        return new Promise(async (re, rj) => {

            this._sessionDB = await getSessionIfValidBySessionToken(this._sessionToken);

            if (!this._sessionDB) {
                this._isValid = false;
                return re();
            }

            const userDB = await getUserByID(this._sessionDB.user_id);

            if (!userDB) {
                return rj();
            }

            this._isValid = true;
            this._userDB = userDB;

            re();

        });

    }

    get sessionDB () {
        if (!this._isValid)
            return null;
        return this._sessionDB;

    } 

    get isLoggedIn () {
        return this._isValid;
    }

    get twofa () {
        if (!this._isValid)
            return null;
        return this._userDB.twofa;
    }
    get saveLog () {
        if (!this._isValid)
            return null;
        return this._userDB.saveLog;
    }

    get name () {
        if (!this._isValid)
            return null;
        return this._userDB.name;
    }

    get role () {
        if (!this._isValid)
            return null;
        return this._userDB.role;
    }

    get id () {
        if (!this._isValid)
            return null;
        return this._userDB.id;
    }

}

export interface SocketWithData extends socket.Socket {
    user: SocketUser
}