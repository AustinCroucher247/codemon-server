const express = require('express');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const rooms = {};
const usersInRooms = {};
const messages = {};

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/create-room', (req, res) => {
    const roomId = Math.floor(Math.random() * 10000);
    const userId = req.body.userId;
    rooms[roomId] = { hostId: userId, users: [] };
    res.json({ roomId, isHost: true });
});

app.post('/join-room/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { userId, username } = req.body;

    if (rooms[roomId]) {
        rooms[roomId].users.push({ userId, username });
        const isHost = rooms[roomId].hostId === userId;
        const usernamesInRoom = rooms[roomId].users.map(user => user.username);
        console.log('Usernames in room:', usernamesInRoom);
        res.json({ success: true, isHost, usernamesInRoom });
    } else {
        res.json({ success: false });
    }
});

app.get('/room-exists/:roomId', (req, res) => {
    const { roomId } = req.params;
    if (rooms[roomId]) {
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', ({ roomId, userId, username }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                hostId: userId,
                users: [],
            };
        }

        const userExists = rooms[roomId].users.some((user) => user.userId === userId);
        if (!userExists) {
            const user = { userId, username };
            rooms[roomId].users.push(user);
        }

        io.to(roomId).emit('roomUsers', { users: rooms[roomId].users });

        console.log(`User with ID ${userId} joined room with ID ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log(`Server listening on port 8080`);
});