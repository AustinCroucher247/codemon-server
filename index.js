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
    const roomId = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number

    // TODO: Check if the room ID already exists, and if it does, generate a new one

    rooms[roomId] = {}; // Initialize the room

    res.json({ roomId: roomId.toString() }); // Convert the room ID to a string and send it back to the client
});