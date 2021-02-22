import { createServer } from 'http'
import morgan = require("morgan")
import * as express from "express"
import * as socket from "socket.io"
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


const app = express();
const io = socket();

morgan.token('pseudo-remote-addr', function getId (req: any) {
    return req["pseudo-remote-addr"];
})

app.use((req, res, next) => {    
    req["pseudo-remote-addr"] = (config.get("log:ip-addresses-pseudonymize")) ? pseudoIP(req.ip): req.ip;
    next()
})

app.use(morgan(`:pseudo-remote-addr - ":method :url HTTP/:http-version" :status :res[content-length]`, (
    { stream: log.stream } as any
)));

app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/v0", apiMiddleware);

app.use((req, res) => {

    res.setHeader('Content-Type', 'application/json');
    res.status(403);

    return res.send(JSON.stringify({
        error: true,
        message: "403 Forbidden"
    }))

})

io.on('connection', (socket) => {

    function slog (msg: string) {
        if (config.get("runmode") === "development")
            log.info("socket", `${msg} - ${socket.conn.id}`);
    }

    slog(`Neue Verbindung mit "${socket.handshake.headers.host}"`);

    socket.on("disconnect", () => {
        slog("Verbindung getrennt");
    });

    useSignSocket(socket, slog);
    useProfileSocket(socket, slog);
    useSettingsSocket(socket, slog);
    useAdminSocket(socket, slog);

});

const port = config.get("server:port") || 8080;
app.set('port', port);

const server = createServer(app);

io.attach(server);

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