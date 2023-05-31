const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { transports: ['websocket', 'polling'] });

const corsOptions = {
    origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

// Start the server
server.listen(3306, () => {
    console.log('Server started on port 3306');
});

// WebSocket server setup
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (room) => {
        socket.join(room);
    });

    socket.on('gameEvent', (event) => {
        io.emit('gameEvent', event);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
