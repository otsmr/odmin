import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

import morgan = require("morgan")
import * as express from "express"
import * as cookie from "cookie"
import socket = require("socket.io");
import * as cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'

import log from "./utils/logs"
import config from "./utils/config"
import { pseudoIP } from './utils/utils'

// used in log.ts
globalThis.isDev = (config.get("runmode") === "development") ? true : false;

import database from "./database/initdb"

import apiMiddleware from "./routes/api"
import useSignSocket from "./routes/sign"
import useProfileSocket from "./routes/profile"
import useSettingsSocket from "./routes/settings/index"
import useAdminSocket from "./routes/admin/index"
import { signOutAlert } from './routes/shared';
import { getSessionByToken } from './database/services/session';

const app = express();
const port = config.get("server:port") || 8080;
app.set('port', port);

const server = createServer(app);
const io = socket(server);

morgan.token('pseudo-remote-addr', function getId (req: any) {
    return req["pseudo-remote-addr"];
})

app.use((req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof ip === "object") {
        ip = ip[0];
    }
    req["pseudo-remote-addr"] = (config.get("log:ip-addresses-pseudonymize")) ? pseudoIP(ip): ip;
    next()
})

app.use(morgan(`:pseudo-remote-addr - ":method :url HTTP/:http-version" :status :res[content-length]`, (
    { stream: log.stream } as any
)));

app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/v0", apiMiddleware);

app.get("/index.html", (req, res, next) => {
	res.redirect("/");
})

app.use(express.static(__dirname + '/public', {
    index: false
}));

app.use((req, res) => {
    const indexPath = join(__dirname, "public", 'index.html');
    if (!existsSync(indexPath)) {
        return res.send("");
    }
    const indexHtml = readFileSync(indexPath).toString();
    return res.send(indexHtml);
})

export class SocketUser {

    _sessionToken: string | null;
    _userID: number;
    _userRole: string;
    _userName: string;
    _valid: boolean;
    _saveLog: boolean;
    _twofa: string;

    constructor (sessionToken: string | null) {
        this._sessionToken = sessionToken;
        this.checkToken();
    }

    checkToken () {

        return new Promise((re, rj) => {

            re();

            rj();

        });

    }

    getDBSession (): Promise<any | null> {

        return new Promise(async (re, rj) => {
            re(await getSessionByToken(this._sessionToken));
        });

    } 

    get isLoggedIn () {
        return this._valid;
    }

    get twofa () {
        return this._twofa;
    }
    get saveLog () {
        return this._saveLog;
    }

    get name () {
        return this._userName;
    }

    get role () {
        return this._userRole;
    }

    get id () {
        return this._userID;
    }

}

export interface SocketWithData extends socket.Socket {
    user: SocketUser
}

io.on('connection', async (socket: SocketWithData) => {

    function slog (msg: string) {
        if (config.get("runmode") === "development")
            log.info("socket", `${msg} - ${socket.conn.id}`);
    }

    slog(`Neue Verbindung mit "${socket.handshake.headers.host}"`);

    const int = setInterval(() => {
        if (socket.user) {
            socket.user.checkToken()
            .then(() => {
                if (!socket.user.isLoggedIn)
                    signOutAlert(socket);
            })
            .catch(console.error);
        }
    }, 5000);

    socket.on("disconnect", () => {
        clearInterval(int);
        slog("Verbindung getrennt");
    });

    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    socket.user = new SocketUser(cookies.token || "");

    if (socket.user.isLoggedIn) {

        useProfileSocket(socket, slog);
        useSettingsSocket(socket, slog);

        if (socket.user.role === "admin") {
            useAdminSocket(socket, slog);
        }

    } else {

        useSignSocket(socket, slog);

    }

});


server.listen(port, () => {
    database.sequelize.sync(); 
});


server.on('listening', () => {

    const addr: any = server.address();
    if (typeof addr.address === "string" && addr.address === "::") addr.address += "1";

    log.info("http", `Server gestartet auf ${(addr.family === "IPv6") ? `[${addr.address}]` : addr.address}:${addr.port}`);

})

server.on('error', (error: any) => {

    if (error.syscall !== 'listen') throw error;
    const bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case 'EACCES': log.error("server", `Der ${bind} erfordert erhöhte Berechtigungen`); process.exit(1);
        case 'EADDRINUSE': log.error("server", `Der ${bind} wird schon verwendet.`); process.exit(1);
        default: throw error;
    }

})