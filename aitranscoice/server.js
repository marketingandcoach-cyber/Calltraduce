// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use("/api/meta", require("./meta"));
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 3000;
const host = process.env.MODEL_API_KEY || process.env.SEAMLESS_EXPRESSIVE_CLI
    ? "127.0.0.1"
    : undefined;
server.listen(PORT, host, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

