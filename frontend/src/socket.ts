import io from "socket.io-client";

console.info("Verbindung zum Websocket wird aufgebaut.");

const location = (window as any).location;

const websocketUrl = location.protocol + "//" + location.host.split(":")[0] + ":3030";

const socket = io(websocketUrl);

socket.on("connect", () => {
    console.info("Verbunden mit dem Websocket auf " + websocketUrl);
})
socket.on("disconnect", () => {
    console.info("Verbindung vom Websocket unterbrochen");
})


export default socket;