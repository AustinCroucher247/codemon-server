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

        const user = { userId, username };
        rooms[roomId].users.push(user);

        io.to(roomId).emit('roomUsers', { users: rooms[roomId].users });

        console.log(`User with ID ${userId} joined room with ID ${roomId}`);
    });
    socket.on('changeTrainer', ({ roomId, userId, trainer }) => {
        const room = rooms[roomId];
        const user = room.users.find((user) => user.userId === userId);
        if (user) {
            user.trainer = trainer;
            io.to(roomId).emit('updateTrainer', { userId, trainer });
        }
    });

    socket.on('changePokemon', ({ roomId, userId, pokemon }) => {
        const room = rooms[roomId];
        const user = room.users.find((user) => user.userId === userId);
        if (user) {
            user.pokemon = pokemon;
            io.to(roomId).emit('updatePokemon', { userId, pokemon });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');

        // Find the room that the user is connected to
        const room = Object.values(rooms).find(room => {
            return room.users.some(user => user.userId === socket.id);
        });

        if (room) {
            // Remove the user from the room
            room.users = room.users.filter(user => user.userId !== socket.id);

            // Emit updated user list to the room
            io.to(roomId).emit('roomUsers', { users: room.users });

            console.log(`User with ID ${socket.id} disconnected from room with ID ${roomId}`);
        }
    });
});

server.listen(8080, () => {
    console.log(`Server listening on port 8080`);
});