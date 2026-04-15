const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory data store (no database requirement)
const rooms = {}; // { roomCode: { teacherId, status, stage: 1, players: [] } }
const players = {}; // { socketId: { roomId, name, score } }

// Helper function to generate room code
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
}

app.get('/', (req, res) => {
  res.send('CAI Game Server is running.');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Teacher creates a room
  socket.on('create_room', (callback) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      teacherId: socket.id,
      status: 'waiting',
      stage: 1,
      players: []
    };
    socket.join(roomCode);
    console.log(`Room created: ${roomCode} by teacher ${socket.id}`);
    callback({ success: true, roomCode });
  });

  // Student joins a room
  socket.on('join_room', ({ roomCode, name }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      return callback({ success: false, message: 'Room not found' });
    }
    if (room.status !== 'waiting') {
      return callback({ success: false, message: 'Game already started' });
    }

    // Add player
    const player = { id: socket.id, name, score: 0 };
    room.players.push(player);
    players[socket.id] = { roomId: roomCode, name, score: 0 };
    
    socket.join(roomCode);
    console.log(`Player ${name} joined room ${roomCode}`);
    
    // Notify teacher
    io.to(room.teacherId).emit('player_joined', room.players);
    callback({ success: true, roomCode });
  });

  // Teacher starts a specific stage
  socket.on('start_stage', (stageId) => {
    let roomCode = null;
    for (const [code, room] of Object.entries(rooms)) {
      if (room.teacherId === socket.id) {
        roomCode = code;
        room.stage = stageId;
        room.status = 'playing';
        break;
      }
    }

    if (roomCode) {
      console.log(`Teacher started stage ${stageId} for room ${roomCode}`);
      // Notify all students in room
      socket.to(roomCode).emit('stage_started', stageId);
    }
  });

  // Student submits score
  socket.on('submit_score', ({ stageId, scoreEarned }) => {
    const pData = players[socket.id];
    if (!pData) return;

    const room = rooms[pData.roomId];
    if (room) {
      pData.score += scoreEarned;
      // Update room players array
      const roomPlayer = room.players.find(p => p.id === socket.id);
      if (roomPlayer) {
        roomPlayer.score = pData.score;
      }
      
      // Notify teacher of updated scores
      io.to(room.teacherId).emit('score_updated', room.players);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // If it's a student
    const pData = players[socket.id];
    if (pData) {
      const room = rooms[pData.roomId];
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        io.to(room.teacherId).emit('player_left', room.players);
      }
      delete players[socket.id];
    }
    
    // If it's a teacher
    const roomCodesToDelete = [];
    for (const [code, room] of Object.entries(rooms)) {
      if (room.teacherId === socket.id) {
        roomCodesToDelete.push(code);
        // Notify students that room is closed
        socket.to(code).emit('room_closed');
      }
    }
    roomCodesToDelete.forEach(code => delete rooms[code]);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
