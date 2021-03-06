import io from "socket.io-client";

console.info("Verbindung zum Websocket wird aufgebaut.");

const socket = io((window as any).API_BASE);

socket.on("connect", () => {
    console.info("Verbunden mit dem Websocket auf " + (window as any).API_BASE);
})
socket.on("disconnect", () => {
    console.info("Verbindung vom Websocket unterbrochen");
})

export default socket;