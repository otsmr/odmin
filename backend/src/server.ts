import { createServer } from 'http'

const morgan = require("morgan")

import * as express from "express"
import * as socket from "socket.io"
import * as cookieParser from 'cookie-parser'

import log from "./utils/logs"
import config from "./utils/config"

globalThis.isDev = config.get("isDev");

import database from "./database/initdb"

import apiMiddleware from "./routes/http-get"

// import webauthnSocket from "./routes/webauthn"

import useSignSocket from "./routes/sign"
import useProfileSocket from "./routes/profile"
import useSettingsSocket from "./routes/settings/index"
import useAdminSocket from "./routes/admin/index"
import { getUserByCookie } from './routes/shared'


const app = express();
const io = socket();

app.use(morgan("combined", { stream: log.stream }));
app.use(cookieParser());
app.use(apiMiddleware);

app.get("/", (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify({
        error: "403 Forbidden"
    }))

})

io.on('connection', (socket) => {

    const slog = (msg: string) => {
        log.info("socket", `${msg} - ${socket.conn.id}`);
    }

    const checkSignStatus = setInterval(()=>{
        getUserByCookie(socket)
    }, 1000);

    slog(`Neue Verbindung mit "${socket.handshake.headers.host}"`);
    socket.on("disconnect", () => {
        slog("Verbindung getrennt");
        clearInterval(checkSignStatus);
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