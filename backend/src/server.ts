import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import * as crypto from 'crypto';
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
import useSetupSocket from "./routes/setup"
import useProfileSocket from "./routes/profile"
import useSettingsSocket from "./routes/settings/index"
import useAdminSocket from "./routes/admin/index"
import { signOutAlert } from './routes/shared';
import { SocketWithData, SocketUser } from './utils/socket'

const app = express();
const port = config.get("server:port") || 3000;
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
    req["pseudo-remote-addr"] = (config.get("privacy:ip-addresses-pseudonymize")) ? pseudoIP(ip): ip;
    next()
})

app.use(morgan(`:pseudo-remote-addr - ":method :url HTTP/:http-version" :status :res[content-length]`, (
    { stream: log.stream } as any
)));

app.use(cookieParser());
app.use(bodyParser.json());

app.use((req, res, next) => {

    // https://developer.mozilla.org/en-US/docs/Web/Security

    (req as any).cspNonce = crypto.randomBytes(16).toString('base64');
    
    res.append("X-Content-Type-Options", "nosniff");
    res.append("Referrer-Policy", "no-referrer");
    res.append("Access-Control-Allow-Origin", config.get("frontend-base-url"));
    res.append("X-Frame-Options", "DENY");

    res.append("Content-Security-Policy", `default-src 'self'; img-src 'self' 'unsafe-inline' data:; script-src 'nonce-${(req as any).cspNonce}'`);

    res.append("X-Bug-Bounty", "More info here: /.well-known/security.txt");
    res.header("X-Powered-By", "Odmin");

    next();
    
})

app.get("/index.html", (req, res, next) => {
	res.redirect("/");
})

app.use(express.static(__dirname + '/public', {
    index: false
}));

app.use(async (req, res, next) => {

    if (config.get("mysql:database") !== "") {
        return next();
    }

    if (req.url.indexOf("/setup") === -1) {
        res.redirect(config.get("frontend-base-url") + "/setup");
    } else {
        next();
    }


})

app.use("/api/v0", apiMiddleware);

app.use((req, res) => {

    const indexPath = join(__dirname, "public", 'index.html');
    if (!existsSync(indexPath)) {
        return res.send("");
    }
    let indexHtml = readFileSync(indexPath).toString();

    indexHtml = indexHtml.replace(/<script/g, `<script nonce="${(req as any).cspNonce}" `)

    return res.send(indexHtml);

})

io.on('connection', async (socket: SocketWithData) => {

    if (config.get("mysql:database") === "") {
        socket.emit("redirect-to-setup");
    }

    function slog (msg: string) {
        if (config.get("runmode") === "development")
            log.info("socket", `${msg} - ${socket.conn.id}`);
    }

    slog(`Neue Verbindung mit "${socket.handshake.headers.host}"`);

    let intervall = null;

    socket.on("disconnect", () => {
        if (intervall)
            clearInterval(intervall);
        slog("Verbindung getrennt");
    });

    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    socket.user = new SocketUser(cookies.token || "");

    await socket.user.checkToken();

    useSetupSocket(socket, slog);
    useSignSocket(socket, slog);
    
    if (socket.user.isLoggedIn) {

        intervall = setInterval(() => {
            if (socket.user && socket.user.isLoggedIn) {
                socket.user.checkToken()
                .then(() => {
                    if (!socket.user.isLoggedIn)
                        signOutAlert(socket);
                })
                .catch(console.error);
            }
        }, 5000);

        useProfileSocket(socket, slog);
        useSettingsSocket(socket, slog);

        if (socket.user.role === "admin") {
            useAdminSocket(socket, slog);
        }

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