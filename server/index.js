const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("request-sync", { roomId });
  });

  socket.on("drawing", ({ roomId, pathData }) => {
    socket.to(roomId).emit("receive-drawing", pathData);
  });
  socket.on('request-sync', ({ roomId }) => {
    if (!roomId) {
    console.warn(`❌ Request sync failed: roomId is undefined from ${socket.id}`);
    return;
  }
  console.log(`Request sync from ${socket.id} in room ${roomId}`);
  socket.to(roomId).emit('request-sync', { roomId });
});

  socket.on("sync-canvas", ({ roomId, objects }) => {
    if (!roomId) {
    console.warn(`❌ Sync-canvas failed: roomId is undefined from ${socket.id}`);
    return;
  }
    console.log(`Syncing canvas in room ${roomId} with ${objects.length} objects`);
    socket.to(roomId).emit("receive-sync", objects);
  });

  socket.on("disconnect", () => {
    console.log('User disconnected:', socket.id);
  });
  socket.on("undo-action", ({ roomId, object }) => {
    if (!roomId || !object) {
      console.warn("Undo action failed: missing data");
      return;
    }
    console.log(`Undo from ${socket.id} in room ${roomId}`);
    socket.to(roomId).emit("undo-action", { object });
  });

  socket.on("redo-action", ({ roomId, object }) => {
    if (!roomId || !object) {
      console.warn("Redo action failed: missing data");
      return;
    }
    console.log(`Redo from ${socket.id} in room ${roomId}`);
    socket.to(roomId).emit("redo-action", { object });
  });

  socket.on("clear-canvas", ({ roomId }) => {
  if (!roomId) return;
  console.log(`Clear canvas from ${socket.id} in room ${roomId}`);
  socket.to(roomId).emit("clear-canvas");
});

socket.on("loaded-canvas", ({ roomId, objects }) => {
  if (!roomId || !objects) {
    console.warn("Loaded-canvas failed: roomId or objects missing");
    return;
  }
  console.log(`Broadcasting loaded canvas to room ${roomId}`);
  socket.to(roomId).emit("loaded-canvas", { roomId, objects });
});


});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

