// import necessary dependencies
const express = require('express');
const uuid = require('uuid');
const app = express();
require('dotenv').config();
const PORT = 8080;
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create a new data structure to hold room IDs
const rooms = {};
const usersInRooms = {};

const messages = {};

const server = app.listen(PORT, () => {
    console.log(`Server listening on port 8080`);
});

const io = socketIo(server, { transports: ['websocket', 'polling'] });

const corsOptions = {
    origin: ['http://localhost:3000'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Create a new route to handle room creation
app.post('/create-room', (req, res) => {
    // Generate a unique room ID
    const roomId = Math.floor(Math.random() * 10000);

    // Get the user ID from the request body or session
    const userId = req.body.userId;

    // Add the room to our rooms object with the host's user ID
    rooms[roomId] = { hostId: userId, users: [] };

    // Return the room ID in the response
    res.json({ roomId, isHost: true });
});

app.post('/join-room/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (rooms[roomId]) {
        // Add the user to the room
        rooms[roomId].users.push(userId);

        // Return a response indicating whether the user is the host
        const isHost = rooms[roomId].hostId === userId;
        res.json({ success: true, isHost });
    } else {
        // Return a response indicating that the room does not exist
        res.json({ success: false });
    }
});

app.get('/room-exists/:roomId', (req, res) => {
    const { roomId } = req.params;

    if (rooms[roomId]) {
        // Return a response indicating that the room exists
        res.sendStatus(200);
    } else {
        // Return a response indicating that the room does not exist
        res.sendStatus(404);
    }
});


app.use(cors(corsOptions));