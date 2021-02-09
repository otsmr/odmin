import io from "socket.io-client";

console.info("Verbindung zum Websocket wird aufgebaut.");

const websocketUrl = (window as any).CONFIG.apibase;

const socket = io(websocketUrl);

socket.on("connect", () => {
    console.info("Verbunden mit dem Websocket auf " + websocketUrl);
})
socket.on("disconnect", () => {
    console.info("Verbindung vom Websocket unterbrochen");
})


export default socket;