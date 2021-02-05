const io = require("socket.io-client");

const socket = io("http://localhost:8080");

socket.on('connect', () => {
    console.log("Verbunden mit der API mit socket.io");
});
socket.on('disconnect', () => {
    console.log("Verbindung zur API wurde getrennt");
});